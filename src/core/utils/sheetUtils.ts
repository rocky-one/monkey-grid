
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
    // 当整个sheet的行比当前数据的行多时 可以直接插入
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
 * @desc 把table数据插入到sheetData中 
 * @param row 
 * @param col 
 * @param tableData 
 * @param sheetData 
 */
export function insertTableDataToSheet(row: number, col: number, tableData: any[], sheetData: any[]) {
    let rowLen = tableData.length
    let colLen = tableData.length ? tableData[0].length : 0
    // 注意这里需要检测是否覆盖已有数据和边界问题 ，如果该区域有数据存在给出提示 做调整 111
    for (let i = 0; i < rowLen; i++) {
        const r = tableData[i]
        for (let j = 0; j < r.length; j++) {
            let cell = sheetData[row + i][col + j]
            setCellMerge(i, j, r[j], tableData)
            sheetData[row + i][col + j] = r[j] ? Object.assign(cell, r[j]) : r[j]
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
export function setCellMerge(row: number, col: number, cell: any, data: any[]) {
    if (!cell || !cell.rowspan || !cell.colspan) return false;
    let endRow = row + cell.rowspan
    let endCol = col + cell.colspan
    if (cell.rowspan > 1 || cell.colspan > 1) {
        const leftTopCell = data[row][col]
        let height = 0
        let width = 0
        for (let i = row; i < endRow; i++) {
            height += data[i][col].height
            for (let j = col; j < endCol; j++) {
                if (i === row) {
                    width += data[i][j].width
                }
                data[i][j] = {
                    pointer: [row, col]
                }
            }
        }
        leftTopCell.height = height;
        leftTopCell.width = width;
        data[row][col] = leftTopCell
    }
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
            }
            sheetData[i][j].pointer = [0, 0]
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
export function getHeaderABC(col: number) {
    // 整数
    let integer = Math.floor(col / 26)
    let sum = integer > 0 ? 0 : -1
    while (integer >= 26) {
        integer = Math.floor(col / 26)
        sum++
    }

    // 余数
    const remainder = col % 26
    let letter = ''
    if (integer > 0) {

    }
}