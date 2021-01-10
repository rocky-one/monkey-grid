export function initSheetData(
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
    if(dataRowLen > rowCount) {
        data.splice(rowCount)
    }
    // 列同上
    if(dataColLen > colCount) {
        data.forEach(row => {
            row.splice(colCount)
        })
    // 补全列
    }else if(dataRowLen) {
        for(let i = 0; i < dataRowLen; i++) {
            for(let j = dataColLen; j < colCount; j++) {
                // 取前一个cell如果没有前一个从 -1个开始
                const preCell = data[i][j-1] || {
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
    if(data.length) {
        startRow = dataRowLen
    }
    // 如果当前sheet没有数据 先创建第一行数据 方便后面遍历时向上取数
    if(startRow === 0) {
        data = []
        const firstRow = []
        for(let j = 0; j < colCount; j++) {
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
    for(let i = startIndex; i < rowCount; i++) {
        const row = []
        for(let j = startCol; j < colCount; j++) {
            let upCell = data[i - 1][j]
            let preCell:any
            if(j === 0) {
                preCell = {
                    height: cellHeight,
                    width: upCell.width,
                    x: -cellWidth + xOffset,
                    y: i * cellHeight - cellHeight + yOffset
                }
            } else {
                preCell = row[j-1]
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
 * @desc 把table数据插入到2sheetData中 
 * @param row 
 * @param col 
 * @param tableData 
 * @param sheetData 
 */
export function insertTableDataToSheet(row: number, col: number, tableData: any[], sheetData: any[]) {
    let rowLen = tableData.length
    let colLen = tableData.length ? tableData[0].length : 0
    // 注意这里需要检测是否覆盖已有数据和边界问题 111
    for(let i = 0; i < rowLen; i++) {
        const r = tableData[i]
        for(let j = 0; j < r.length; j++) {
            const cell = sheetData[row+i][col+j]
            sheetData[row+i][col+j] = Object.assign(r[j], cell)
        }
    }

    return sheetData
}
