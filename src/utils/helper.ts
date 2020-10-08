// 延迟执行
export function defer(callback) {
    setTimeout(callback, 0)
}

// 初始化数据
export function initData(data = [], rowHeight = 24, colWidth = 100) {
    let y = 0
    for (let i = 0; i < data.length; i++) {
        const row = data[i]
        let x = 0
        for (let j = 0; j < row.length; j++) {
            const cell = row[j]
            cell.width = colWidth
            cell.height = rowHeight
            cell.y = y
            cell.x = x
            x += colWidth
        }
        y += rowHeight
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
 * @desc 计算可是区域开始的行索引
 * @param scrollTop 
 * @param sheetData 
 * @param rowHeight 
 */
export function calcStartRowIndex(scrollTop: number, sheetData: any[]): number {
    if (scrollTop === 0) return 0
    const sheetLen = sheetData.length
    let start = 0
    let end = sheetLen - 1
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2);
        const cell = sheetData[mid][0]
        if (cell.y + cell.height >= scrollTop && cell.y <= scrollTop) {
            return mid;
        } else if (cell.y < scrollTop) {
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
export function calcEndRowIndex(startRow: number, containerHeight: number, sheetData: any[]): number {
    let height = 0
    for(let i = startRow + 1; i < sheetData.length; i++) {
        height += sheetData[i][0].height
        if(height > containerHeight) {
            return i
        }
    }
    return sheetData.length - 1
}
/**
 * @desc 计算可视区域开始的列索引
 * @param scrollLeft 
 * @param sheetData 
 */
export function calcStartColIndex(scrollLeft: number, sheetData: any[]): number {
    if (scrollLeft === 0) return 0
    const sheetLen = sheetData[0].length
    let start = 0
    let end = sheetLen - 1
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2);
        const cell = sheetData[0][mid]
        if (cell.x + cell.width >= scrollLeft && cell.x <= scrollLeft) {
            return mid;
        } else if (cell.x < scrollLeft) {
            start = mid + 1;
        } else {
            end = mid - 1;
        }
    }
}

export function calcEndColIndex(startCol: number, containerWidth: number, sheetData: any[]): number {
    if(!sheetData[0]) return 0
    let width = 0
    for(let j = startCol + 1; j < sheetData[0].length; j++) {
        width += sheetData[0][j].width
        if(width > containerWidth) {
            return j
        }
    }

    return sheetData[0].length - 1
}