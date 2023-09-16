import {getCellWidthHeight} from './sheetUtils'

// 延迟执行
export function defer(callback) {
    setTimeout(callback, 0);
}

export function getExploreType() {
    var explorer = window.navigator.userAgent;
    if (explorer.indexOf("MSIE") >= 0) {
        return 'IE';
    }
    else if (explorer.indexOf("Firefox") >= 0) {
        return 'Firefox';
    }
    else if (explorer.indexOf("Chrome") >= 0) {
        return 'Chrome';
    }
    else if (explorer.indexOf("Opera") >= 0) {
        return 'Opera';
    }
    else if (explorer.indexOf("Safari") >= 0) {
        return 'Safari';
    }
}

export const explorerType = getExploreType();

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
export function calcStartRowIndex(sheet: any): number {
    const sheetData = sheet.sheetData;
    const scrollTop = sheet.scrollBar.getVertical().scrollTop;
    if (scrollTop === 0) return 0;

    const sheetLen = sheetData.length;
    const top = scrollTop ;
    const frozenInfoHeight = sheet.frozenInfo.row.endY || sheet.yOffset;
    let start = 0;
    let end = sheetLen - 1;
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2);
        const cell = sheet.getCellInfo(mid, 0);
        const y = cell.y - frozenInfoHeight;
        if (y + cell.height >= top && y <= top) {
            return mid;
        } else if (y < top) {
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
export function calcEndRowIndex(startRow: number, containerHeight: number, sheetData: any[], rowDataMap: any[]): number {
    let height = 0;
    for (let i = startRow + 1; i < sheetData.length; i++) {
        height += rowDataMap[i].height;
        if (height > containerHeight) {
            return i;
        }
    }
    return sheetData.length - 1;
}

/**
 * @desc 计算可视区域开始的列索引 二分查找
 * @param scrollLeft 
 * @param sheetData 
 * @param colsWidth 这里需要使用列头的宽计算，如果采用cell.width存在colspan的情况计算不对
 */
export function calcStartColIndex(sheet: any): number {
    const scrollLeft = sheet.scrollBar.getHorizontal().scrollLeft;
    if (scrollLeft === 0) return 0;
    const colLen = sheet.colDataMap.length;
    const frozenInfoWidth = sheet.frozenInfo.col.endX || sheet.xOffset;
    const left = scrollLeft;

    let start = 0;
    let end = colLen - 1;
    while (start <= end) {
        let mid = Math.floor(start + (end - start) / 2);
        const cell = sheet.getCellInfo(0, mid);
        const x = cell.x - frozenInfoWidth;
        if (x + cell.width >= left && x < left) {
            return mid;
        } else if (x < left) {
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
export function calcEndColIndex(startCol: number, containerWidth: number, sheetData: any[], colDataMap: any[]): number {
    if (!sheetData[0]) return 0;
    let width = 0;
    for (let j = startCol + 1; j < sheetData[0].length; j++) {
        width += colDataMap[j].width;
        if (width > containerWidth) {
            return j;
        }
    }

    return sheetData[0].length - 1;
}

/**
 * @desc 获取对象的属性值，没有给一个默认值
 * @param obj
 * @param attrName 
 * @param defaultValue 
 */
export function getObjectAttrDefault(obj: object, attrName: string, defaultValue: any) {
    if (obj.hasOwnProperty(attrName)) {
        return obj[attrName];
    }
    return defaultValue;
}

/**
 * @desc 函数截流
 * @param fn 
 * @param time
 */
export function throllte(fn: Function, time: number) {
    let sign = true;
    return function () {
        if (!sign) return;
        let context = this;
        let args = arguments;
        sign = false;
        setTimeout(() => {
            sign = true;
            fn.apply(context, args);
        }, time);
    }
}

/**
 * @desc 根据当前鼠标坐标判断是否在冻结区域
 * @param x 
 * @param y 
 * @param frozenInfo 
 */
export function getCellInFrozenByXY(x: number, y: number, frozenInfo: any) {
    if (x > frozenInfo.col.startX && x < frozenInfo.col.endX && y > frozenInfo.row.startY && y < frozenInfo.row.endY) {
        return 'row-col';
    } else if (x > frozenInfo.col.startX && x < frozenInfo.col.endX) {
        return 'col';
    } else if(y > frozenInfo.row.startY && y < frozenInfo.row.endY) {
        return 'row';
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
        return 'row';
    }
    if (col < sheet.frozenColCount) {
        return 'col';
    }
}

/**
 * @desc 根据坐标位置查找当前坐标内的单元格
 * @param x 
 * @param y 
 * @param paintRange 
 * @param data 
 */
export function findCellByXY(x: number, y: number, sheet: any, isFindPainterOrigin: boolean = true) {
    const {sheetData, paintRange, frozenRowCount, frozenColCount} = sheet;
    const scrollLeft = sheet.scrollBar.getHorizontal().scrollLeft;
    const scrollTop = sheet.scrollBar.getVertical().scrollTop;
    let startRowIndex = 0;
    let endRowIndex = frozenRowCount - 1;
    let startColIndex = 0;
    let endColIndex = frozenColCount - 1;
    const frozenFlag = getCellInFrozenByXY(x, y, sheet.frozenInfo);
    if (frozenFlag !== 'row' && frozenFlag !== 'row-col') {
        y += scrollTop;
    }
    if (frozenFlag !== 'col' && frozenFlag !== 'row-col') {
        x += scrollLeft;
    }
    endColIndex = paintRange.endColIndex;
    endRowIndex = paintRange.endRowIndex;
    for (let i = startRowIndex; i <= endRowIndex; i++) {
        const row = sheetData[i];
        if (!row) {
            return false;
        }
        const first = getCellWidthHeight(i, 0, sheet);
        if (y >= first.y &&  y <= first.y + first.height) {
            for (let j = startColIndex; j <= endColIndex; j++) {
                // 这里需要用当前单元格的宽高和坐标比较
                const cellWH = getCellWidthHeight(i, j, sheet);
                if (x >= cellWH.x && x <= cellWH.x + cellWH.width) {
                    let cell = sheet.getCellInfo(i, j);
                    if (isFindPainterOrigin) {
                        let mergeCell = sheet.sheetData[i][j].merge || [1, 1];
                        let pointer = [i, j];
                        if (sheet.gePointer(i, j)) {
                            pointer = sheet.gePointer(i, j);
                            cell = sheet.getCellInfo(pointer[0], pointer[1]);
                            mergeCell = sheet.sheetData[pointer[0]][pointer[1]].merge || [1, 1];
                        }
                        return {
                            ...cell,
                            range: [pointer[0], pointer[1], pointer[0] + mergeCell[0]-1, pointer[1] + mergeCell[1]-1]
                        }
                    } else {
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

export const pxToNum = (pxString: string|number) => {
    const arr = pxString.toString().split('px');
    if (arr.length) {
        return arr[0];
    }
    return 0;
}

export const splitValueByCellWidth = (value: any, cellWidth: number, canvasContext: any) => {
    let val = value.toString();
    let fontWidth = canvasContext.measureText(val).width;
    // 6px 用来添加...省略号
    let newCellWidth = cellWidth - 6;
    function loop() {
        const morePercent = (fontWidth - newCellWidth) / fontWidth;
        const splitLen = Math.ceil(val.length * morePercent);
        val = val.substring(0, val.length - splitLen);
        fontWidth = canvasContext.measureText(val).width;
        if (fontWidth > newCellWidth) {
            return loop();
        }
        return val + '...';
    }
    if (fontWidth > cellWidth) {
        return loop();
    } else {
        return val;
    }
}