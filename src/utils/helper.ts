import { PointRange } from '../interface/SheetInterface'
// 延迟执行
export function defer(callback) {
    setTimeout(callback, 0)
}

export function getPointerCell(row: number, col: number, sheetData: any) {
    const cell = sheetData[row][col]
    if (cell.pointer) {
        return sheetData[cell.pointer[0]][cell.pointer[1]]
    }
    return cell
}
// 初始化数据
export function initData(data = [], startRow: number, startCol: number, sheet: any) {
    const xOffset = sheet.xOffset
    const yOffset = sheet.yOffset
    const rowHeight = 24
    const colWidth = 100
    // startRow: number, startCol: number,
    let startY = yOffset
    if (startRow > 0) {
        const yCell = getPointerCell(startRow, 0, sheet.sheetData)
        startY = yCell.y + yCell.height
    }
    let startX = xOffset
    if (startCol > 0) {
        const xCell = getPointerCell(startRow, 0, sheet.sheetData)
        startX = xCell.x + xCell.width
    }
    for (let i = 0; i < data.length; i++) {
        const row = data[i]
        let x = startX
        for (let j = 0; j < row.length; j++) {
            const cell = row[j]
            // cell.width = cell.width || colWidth
            // cell.height = cell.height || rowHeight
            // cell.y = startY
            // cell.x = x
            // x += cell.width
        }
        startY += rowHeight
    }
    return data
}

export function getExploreType() {
    var explorer = window.navigator.userAgent
    if (explorer.indexOf("MSIE") >= 0) {
        return 'IE'
    }
    else if (explorer.indexOf("Firefox") >= 0) {
        return 'Firefox'
    }
    else if (explorer.indexOf("Chrome") >= 0) {
        return 'Chrome'
    }
    else if (explorer.indexOf("Opera") >= 0) {
        return 'Opera'
    }
    else if (explorer.indexOf("Safari") >= 0) {
        return 'Safari'
    }
}

export const explorerType = getExploreType()

export function createOrderName(name: string, list) {
    return name
}

export function getPixelRatio(context: any) {
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
}

/**
 * @desc 计算可是区域渲染开始的行索引，因为数据是根据坐标排序所以这里采用二分查找算法
 * 根据最小行高计算，如果当前单元格正好是合并单元格直接绘制，如果当前单元格不是第一个带合并信息的单元格需要根据指针找到第一个
 * @param scrollTop 
 * @param sheetData 
 * @param rowHeight 
 */
export function calcStartRowIndex(scrollTop: number, sheetData: any[], yOffset: number, rowsHeight: number[]): number {
    if (scrollTop === 0) return 0
    const sheetLen = sheetData.length
    const top = scrollTop + yOffset
    let start = 0
    let end = sheetLen - 1
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2);
        const cell = sheetData[mid][0]
        const height = rowsHeight[mid]
        if (cell.y + height >= top && cell.y <= top) {
            return mid;
        } else if (cell.y < top) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
}

/**
 * @desc  计算可视区域结束的行索引
 * @param startRow 
 * @param containerHeight 
 * @param sheetData 
 */
export function calcEndRowIndex(startRow: number, containerHeight: number, sheetData: any[], rowsHeight: number[]): number {
    let height = 0
    for (let i = startRow + 1; i < sheetData.length; i++) {
        height += rowsHeight[i]
        if (height > containerHeight) {
            return i
        }
    }
    return sheetData.length - 1
}

/**
 * @desc 计算可视区域开始的列索引 二分查找
 * @param scrollLeft 
 * @param sheetData 
 * @param colsWidth 这里需要使用列头的宽计算，如果采用cell.width存在colspan的情况计算不对
 */
export function calcStartColIndex(scrollLeft: number, sheetData: any[], xOffset: number, colsWidth: number[]): number {
    if (scrollLeft === 0) return 0
    const sheetLen = sheetData[0].length
    const left = scrollLeft + xOffset
    let start = 0
    let end = sheetLen - 1
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2)
        const cell = sheetData[0][mid]
        const width = colsWidth[mid]
        if (cell.x + width >= left && cell.x <= left) {
            return mid;
        } else if (cell.x < left) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
}

/**
 * @desc 计算可视区域结束列索引
 * @param startCol 
 * @param containerWidth 
 * @param sheetData 
 */
export function calcEndColIndex(startCol: number, containerWidth: number, sheetData: any[], colsWidth: number[]): number {
    if (!sheetData[0]) return 0
    let width = 0
    for (let j = startCol + 1; j < sheetData[0].length; j++) {
        width += colsWidth[j]
        if (width > containerWidth) {
            return j
        }
    }

    return sheetData[0].length - 1
}

/**
 * @desc 获取对象的属性值，没有给一个默认值
 * @param obj
 * @param attrName 
 * @param defaultValue 
 */
export function getObjectAttrDefault(obj: object, attrName: string, defaultValue: any) {
    if (obj.hasOwnProperty(attrName)) {
        return obj[attrName]
    }
    return defaultValue
}

/**
 * @desc 函数截流
 * @param fn 
 * @param time
 */
export function throllte(fn: Function, time: number) {
    let sign = true
    return function () {
        if (!sign) return
        let context = this
        let args = arguments
        sign = false
        setTimeout(() => {
            sign = true
            fn.apply(context, args)
        }, time)
    }
}

/**
 * @desc 判断当前点击坐标是否在冻结行内部
 * @param y 
 * @param frozenRowCount 
 * @param sheetData 
 */
export function inFrozenRowByXY(y: number, frozenRowCount: number, sheetData: any) {
    if( frozenRowCount <= 0) {
        return false
    }
    let y2 = sheetData[0][0].y
    for(let i = 0; i < frozenRowCount; i++) {
        if(sheetData[i][0]) {
            if(sheetData[i][0].pointer) {
                continue
            }
            y2 += sheetData[i][0].height
        }
    }
    return y <= y2
}
export function inFrozenColByXY(x: number, frozenColCount: number, sheetData: any) {
    if( frozenColCount <= 0) {
        return false
    }
    let x2 = sheetData[0][0].x
    for(let i = 0; i < frozenColCount; i++) {
        if(sheetData[0][i].pointer) {
            continue
        }
        x2 += sheetData[0][i].width
    }
    return x <= x2
}

/**
 * @desc 根据当前鼠标坐标判断是否在冻结区域
 * @param x 
 * @param y 
 * @param frozenInfo 
 */
export function getCellInFrozenByXY(x: number, y: number, frozenInfo: any) {
    if (x > frozenInfo.col.startX && x < frozenInfo.col.endX) {
        return 'col'
    } else if(y > frozenInfo.row.startY && y < frozenInfo.row.endY) {
        return 'row'
    }
}

/**
 * @desc 根据索引判断当前是否在冻结区域
 * @param row 
 * @param col 
 * @param sheet 
 * @returns 
 */
export function getCellInFrozenByIndex(row: number, col: number, sheet: any) {
    if (row < sheet.frozenRowCount) {
        return 'row'
    }
    if (col < sheet.frozenColCount) {
        return 'col'
    }
}

/**
 * @desc 根据坐标位置查找当前坐标内的单元格
 * @param x 
 * @param y 
 * @param pointRange 
 * @param data 
 */
export function findCellByXY(x: number, y: number, sheet: any, isFindPointerOrigin: boolean = true) {
    const {sheetData, pointRange, frozenRowCount, frozenColCount} = sheet
    const scrollLeft = sheet.scrollBar.getHorizontal().scrollLeft
    const scrollTop = sheet.scrollBar.getVertical().scrollTop
    let startRowIndex = 0
    let endRowIndex = frozenRowCount - 1
    let startColIndex = 0
    let endColIndex = frozenColCount - 1
    // if(!sheet.selectedRangeInFrozenRow) {
    //     y += scrollTop
    //     startRowIndex = pointRange.startRowIndex
    //     endRowIndex = pointRange.endRowIndex
    // }
    // if(!sheet.selectedRangeInFrozenCol) {
    //     x += scrollLeft
    //     startColIndex = pointRange.startColIndex
    //     endColIndex = pointRange.endColIndex
    // }
    const frozenFlag = getCellInFrozenByXY(x, y, sheet.frozenInfo)
    if (frozenFlag !== 'row') {
        y += scrollTop
    }
    if (frozenFlag !== 'col') {
        x += scrollLeft
    }
    // x += scrollLeft
    // y += scrollTop
    endColIndex = pointRange.endColIndex
    endRowIndex = pointRange.endRowIndex
    for (let i = startRowIndex; i <= endRowIndex; i++) {
        const row = sheetData[i]
        if (!row) {
            return false
        }
        if (y >= row[0].y &&  y <= row[0].y + row[0].height) {
            for (let j = startColIndex; j <= endColIndex; j++) {
                const cell = row[j]
                if (x >= cell.x && x <= cell.x + cell.width) {
                    if (cell.pointer && isFindPointerOrigin) {
                        let rowspan = cell.rowspan ? cell.rowspan - 1 : 0
                        let colspan = cell.colspan ? cell.colspan - 1 : 0
                        const pointerCell = sheetData[cell.pointer[0]][cell.pointer[1]]
                        return {
                            ...pointerCell,
                            range: [cell.pointer[0], cell.pointer[1], cell.pointer[0] + rowspan, cell.pointer[1] + colspan]
                        }
                    }else {
                        return {
                            ...cell,
                            range: [i, j, i, j]
                        };
                    }
                }
            }
        }
    }
    return false;
}