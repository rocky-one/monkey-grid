
export function setSheetDataByCount(
    sheet: any,
    rowCount: number,
    colCount: number,
    cellWidth: number,
    cellHeight: number,
) {
    let sheetData = sheet.sheetData
    const rowDataMap = sheet.rowDataMap
    const colDataMap = sheet.colDataMap

    const xOffset = sheet.xOffset
    const yOffset = sheet.yOffset
    const dataRowLen = sheetData.length
    const dataColLen = dataRowLen ? sheetData[0].length : 0
    // 初始化时指向同一个对象，节省内存
    const emptyCell = {
        value: ''
    }
    // 当整个sheet的行比当前数据的行多时 直接截取掉多余的行
    if (dataRowLen > rowCount) {
        sheetData.splice(rowCount)
        rowDataMap.splice(rowCount)
    }
    // 列同上
    if (dataColLen > colCount) {
        sheetData.forEach(row => {
            row.splice(colCount)
        })
        colDataMap.splice(colCount)
        // 补全当前sheetData右侧缺失的列
    } else if (dataRowLen) {
        const rowMapLast = rowDataMap[rowDataMap.length - 1]
        const colMapLast = colDataMap[colDataMap.length - 1]
        let startX = colMapLast.x + rowMapLast.width

        for (let i = 0; i < dataRowLen; i++) {
            sheetData[i].push(...new Array(colCount - dataColLen).fill(emptyCell))
        }

        for (let j = dataColLen; j < colCount; j++) {
            colDataMap.push({
                x: startX,
                height: cellHeight
            })
            startX += cellWidth
        }
    }
    // 如果当前sheet没有数据
    if (dataRowLen === 0) {
        const emptyCols = new Array(colCount).fill(emptyCell)
        sheetData = new Array(rowCount).fill(emptyCols)

        let startY = yOffset
        for (let i = 0; i < rowCount; i++) {
            rowDataMap.push({
                y: startY,
                width: cellWidth
            })
            startY += cellHeight
        }

        let startX = xOffset
        for (let j = 0; j < colCount; j++) {
            colDataMap.push({
                x: startX,
                height: cellHeight
            })
            startX += cellWidth
        }
    } else {
        const startRow = dataRowLen
        const rowMapLast = rowDataMap[rowDataMap.length - 1]
        const colMapLast = colDataMap[colDataMap.length - 1]
        let startY = rowMapLast.y + colMapLast.height

        for (let i = startRow; i < rowCount; i++) {
            rowDataMap.push({
                y: startY,
                width: cellWidth
            })
            startY += cellHeight

            sheetData.push(new Array(colCount).fill(emptyCell))
        }
    }
    
    console.log(sheetData, rowDataMap, colDataMap)
    return sheetData
}

export function setSheetRowColCount(
    data: any[],
    rowCount: number,
    colCount: number,
    cellWidth: number,
    cellHeight: number,
    xOffset: number,
    yOffset: number
) {
    const dataRowLen = data.length
    const dataColLen = dataRowLen ? data[0].length : 0
    // 当整个sheet的行比当前数据的行多时 直接截取掉多余的行
    if (dataRowLen > rowCount) {
        data.splice(rowCount)
    }
    // 列同上
    if (dataColLen > colCount) {
        data.forEach(row => {
            row.splice(colCount)
        })
        // 补全列
    } else if (dataRowLen) {
        for (let i = 0; i < dataRowLen; i++) {
            for (let j = dataColLen; j < colCount; j++) {
                // 取前一个cell如果没有前一个从 -1个开始
                const preCell = data[i][j - 1] || {
                    height: cellHeight,
                    width: cellWidth,
                    x: -cellWidth,
                    y: i * cellHeight
                }
                data[i].push({
                    width: cellWidth,
                    height: preCell.height,
                    x: preCell.x + preCell.width,
                    y: preCell.y
                })
            }
        }
    }
    let startRow = 0
    let startCol = 0
    if (data.length) {
        startRow = dataRowLen
    }
    // 如果当前sheet没有数据 先创建第一行数据 方便后面遍历时向上取数
    if (startRow === 0) {
        data = []
        const firstRow = []
        for (let j = 0; j < colCount; j++) {
            firstRow.push({
                height: cellHeight,
                width: cellWidth,
                x: j * cellWidth + xOffset,
                y: 0 + yOffset
            })
        }
        data.push(firstRow)
    }
    let startIndex = startRow === 0 ? 1 : startRow
    for (let i = startIndex; i < rowCount; i++) {
        const row = []
        for (let j = startCol; j < colCount; j++) {
            let upCell = data[i - 1][j]
            let preCell: any
            if (j === 0) {
                preCell = {
                    height: cellHeight,
                    width: upCell.width,
                    x: -cellWidth + xOffset,
                    y: i * cellHeight - cellHeight + yOffset
                }
            } else {
                preCell = row[j - 1]
            }
            row.push({
                width: upCell.width,
                height: preCell.height,
                x: preCell.x + preCell.width,
                y: upCell.y + upCell.height
            })
        }
        data.push(row)
    }
    return data
}

/**
 * @desc 把table数据插入到sheetData中, sheetData长度不够自动补全
 * @param row 
 * @param col 
 * @param tableData 
 * @param sheetData 
 */
export function insertTableDataToSheet(row: number, col: number, tableData: any[], sheet: any) {
    let sheetData = sheet.sheetData
    const mergeCells = sheet.mergeCells
    let maxRowLen = row + tableData.length
    let maxColLen = col + (tableData[0] ? tableData[0].length : 0)
    let rowCount = sheetData.length
    let colCount = sheetData[0] ? sheetData[0].length : 0
    if (maxRowLen < rowCount) {
        maxRowLen = rowCount
    }
    if (maxColLen < colCount) {
        maxColLen = colCount
    }

    let flag = false
    const hasValue = checkHasValueByRange(row, col, maxRowLen - 1, maxColLen - 1, sheetData)
    if (hasValue) {
        console.error('当前区域有值，不能新建table')
        return sheetData
    }

    // 超出行边界
    if (row > rowCount || maxRowLen > rowCount) {
        rowCount = maxRowLen
        flag = true
    }
    // 超出列边界
    if (col > colCount || maxColLen > colCount) {
        colCount = maxColLen
        flag = true
    }
    if (flag) {
        sheet.setRowColCount(rowCount, colCount)
        // sheetData = setSheetRowColCount(sheetData, rowCount, colCount, 100, 24, sheet.xOffset, sheet.yOffset)
    }
    // 注意这里需要检测是否覆盖已有数据和边界问题 ，如果该区域有数据存在给出提示 做调整 111
    for (let i = 0; i < tableData.length; i++) {
        const r = tableData[i]
        for (let j = 0; j < r.length; j++) {
            const cell = Object.assign(sheetData[row + i][col + j], r[j])
            sheetData[row + i][col + j] = cell
            setWidthHeightByMergeCells(row + i, col + j, cell, sheetData, mergeCells)
        }
    }

    return sheetData
}

/**
 * @desc 支持按sheetData和tableData计算合并单元格，注意row col索引需要对应
 * @param row 
 * @param col 
 * @param cell 
 * @param data 
 */
export function setWidthHeightByMergeCells(startRow: number, startCol: number, cell: any, data: any[], mergeCells: any) {
    if (!cell || cell.pointer) return false
    const mergeCell = mergeCells[`${startRow}${startCol}`]
    if (!mergeCell) return false
    let endRow = startRow + mergeCell[0]
    let endCol = startCol + mergeCell[1]
    const leftTopCell = data[startRow][startCol]
    let height = 0
    let width = 0
    for (let i = startRow; i <= endRow; i++) {
        const cell = data[i][startCol];
        if (!cell.pointer) {
            height += cell.height
        }
        for (let j = startCol; j <= endCol; j++) {
            if (i === startRow && !data[i][j].pointer) {
                width += data[i][j].width
            }
            if (i !== startRow || j !== startCol) {
                data[i][j].pointer = [startRow, startCol]
            }
        }
    }
    leftTopCell.height = height
    leftTopCell.width = width
    data[startRow][startCol] = leftTopCell
}


export function setLeftTopByFrozenData(sheetData: any, frozenRowCount: number, frozenColCount: number) {
    let width = 0
    let height = 0
    for (let i = 0; i < frozenRowCount; i++) {
        const row = sheetData[i]
        for (let j = 0; j < frozenColCount; j++) {
            let cell = row[j]
            if (i === 0 && j === 0) {
                sheetData[i][j].value = ''
                sheetData[i][j].rowspan = frozenRowCount
                sheetData[i][j].colspan = frozenColCount
            } else {
                sheetData[i][j].pointer = [0, 0]
            }
            if (i === 0) {
                width += cell.width
            }
        }
        height += row[0].height
    }
    if (sheetData.length) {
        if (sheetData[0].length) {
            sheetData[0][0].width = width
            sheetData[0][0].height = height
        }
    }
}

export const ABC_MAP = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
    7: 'H',
    8: 'I',
    9: 'J',
    10: 'K',
    11: 'L',
    12: 'M',
    13: 'N',
    14: 'O',
    15: 'P',
    16: 'Q',
    17: 'R',
    18: 'S',
    19: 'T',
    20: 'U',
    21: 'V',
    22: 'W',
    23: 'X',
    24: 'Y',
    25: 'Z'
}
// A
// AB BC
export function getHeaderABC(col: number) {
    const base = 25
    // 余数
    const remainder = col % base
    // 共计多少个25
    const integer = Math.floor((col - remainder) / base)

    let sum = integer > 0 ? 0 : -1
    let str = ''
    let sign = integer
    while (sign > base) {
        let rem = sign % base
        sign = Math.floor((sign - rem) / base)
        sum++
        str = ABC_MAP[rem]
    }

}

export function numToABC(n: number) {
    let orda = 'a'.charCodeAt(0)
    let ordz = 'z'.charCodeAt(0)
    let len = ordz - orda + 1
    let s = ''
    while (n >= 0) {
        s = String.fromCharCode(n % len + orda) + s
        n = Math.floor(n / len) - 1
    }

    return s.toUpperCase()
};


function ABCToNum(a) {
    if (a == null || a.length == 0) {
        return NaN;
    }
    let str = a.toLowerCase().split("");
    let num = 0;
    let al = str.length;
    let getCharNumber = function (charx) {
        return charx.charCodeAt() - 96;
    };
    let numout = 0;
    let charnum = 0;
    for (let i = 0; i < al; i++) {
        charnum = getCharNumber(str[i]);
        numout += charnum * Math.pow(26, al - i - 1);
    };
    if (numout == 0) {
        return NaN;
    }
    return numout - 1;
};

const columeHeader_word = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const columeHeader_word_index = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25 }

/**
 * @desc 根据选中区域循环sheetData
 * @param selectedRange 
 * @param sheetData 
 * @param cb 
 */
export function forEachSheetDataBySelectedRange(selectedRange: number[], sheetData: any, cb: Function, pointerFlag: boolean = true) {
    if (selectedRange.length) {
        for (let i = selectedRange[0]; i <= selectedRange[2]; i++) {
            for (let j = selectedRange[1]; j <= selectedRange[3]; j++) {
                let cell = sheetData[i][j]
                if (pointerFlag && cell.pointer) {
                    cell = sheetData[cell.pointer[0]][cell.pointer[1]]
                }
                cb(cell, i, j)
            }
        }
    }
}

/**
 * @desc 检测一个区域内是否有值
 * @param row 
 * @param col 
 * @param endRow 
 * @param endCol 
 */
export function checkHasValueByRange(row: number, col: number, endRow: number, endCol: number, sheetData: any[]) {
    if (row > sheetData.length) {
        return false
    }
    if (col > sheetData[0].length) {
        return false
    }

    endRow = endRow > sheetData.length ? sheetData.length : endRow + 1
    endCol = endCol > sheetData[0].length ? sheetData[0].length : endCol + 1
    for (let i = row; i < endRow; i++) {
        const rowData = sheetData[i]
        for (let j = col; j < endCol; j++) {
            if (rowData[j].value) {
                return true
            }
        }
    }
    return false
}