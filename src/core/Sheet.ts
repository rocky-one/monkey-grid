import Table from './Table'
import { SheetOptions, PointRange } from '../interface/SheetInterface'
import { setSheetRowColCount, insertTableDataToSheet, setLeftTopByFrozenData } from './utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBar'
import { calcStartRowIndex, calcEndRowIndex, calcStartColIndex, calcEndColIndex } from '../utils/helper'
import { FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH, LEFT_ORDER_WIDTH, HEADER_ORDER_WIDTH } from './const'
class Sheet {
    constructor(options: SheetOptions) {
        this.tables = []
        this.rowCount = 10
        this.colCount = 4
        this.options = options
        this.sheetData = []
        this.frozenRowCount = options.frozenRowCount || 0
        this.frozenColCount = options.frozenColCount || 0
        // 有序号时的偏移量
        this.xOffset = this.options.order ? LEFT_ORDER_WIDTH : 0
        this.yOffset = this.options.headerOrder ? HEADER_ORDER_WIDTH : 0
        // 计算可视区域宽高
        this.clientWidth = this.options.width - RIGHT_SCROLL_WIDTH - this.xOffset
        this.clientHeight = this.options.height - FOOTER_HEIGHT - this.yOffset
        this.setSheetName(options.name)
        this.setRowColCount(options.rowCount, options.colCount)
        this.calcClientWidthHeight()
        this.initScroll()
    }
    tables: any[]
    rowCount: number
    colCount: number
    options: SheetOptions
    sheetData: any[]
    font: number = 12
    pointStartRow: number = 0
    pointEndRow: number = 0
    pointStartCol: number = 0
    scrollBar: ScrollBar
    sheetName: string
    clientHeight: number = 0
    clientWidth: number = 0
    scrollHeight: number = 0
    scrollWidth: number = 0
    pointRange: PointRange = {
        startRowIndex: 0,
        endRowIndex: 0,
        startColIndex: 0,
        endColIndex: 0
    }
    frozenRowCount: number = 0
    frozenColCount: number = 0
    xOffset: number = 0
    yOffset: number = 0
    public addTable = (name: string, row: number, col: number, dataSource: any[]) => {
        const table = new Table({
            name,
            row,
            col,
            dataSource,
            xOffset: this.xOffset,
            yOffset: this.yOffset
        })
        this.tables.push(table)
        this.sheetData = insertTableDataToSheet(row, col, table.getData(), this.sheetData)
        setLeftTopByFrozenData(this.sheetData, this.frozenRowCount, this.frozenColCount)
        return table
    }
    public getTable = (name: string) => {
        if (!name) return this.tables
        return this.tables.find(table => table.name === name)
    }
    public getSheetData = () => {
        return this.sheetData
    }
    public setSheetName = (name: string) => {
        this.sheetName = name
    }
    public setRowColCount = (rowCount: number, colCount: number) => {
        this.sheetData = setSheetRowColCount(this.sheetData, rowCount, colCount, 100, 24, this.xOffset, this.yOffset)
        this.rowCount = rowCount
        this.colCount = colCount
        this.calcScrollWidthHeight()
    }
    // 计算冻结行高
    private calcFrozenHeight = () => {
        if (this.frozenRowCount > 0) {
            const frozenRowIndex = this.frozenRowCount - 1
            const frozenLastRow = this.sheetData[frozenRowIndex]
            if (frozenLastRow) {
                return frozenLastRow[0].y + frozenLastRow[0].height - this.yOffset
            }
        }
        return 0
    }
    // 计算冻结列宽
    private calcFrozenWidth = () => {
        if (this.frozenColCount > 0) {
            const frozenFristRow = this.sheetData[0]
            if (frozenFristRow) {
                const colCell = frozenFristRow[this.frozenColCount - 1]
                if (colCell) {
                    return colCell.x + colCell.width - this.xOffset
                }
            }
        }
        return 0
    }
    private calcClientWidthHeight = () => {
        this.clientWidth = this.clientWidth - this.calcFrozenWidth()
        this.clientHeight = this.clientHeight - this.calcFrozenHeight()
    }
    // 计算内容区域的宽高 需要减去偏移量以及冻结窗口
    public calcScrollWidthHeight = () => {
        const lastRow = this.sheetData[this.rowCount - 1]
        // 更新内容宽高 用来创建滚动条
        if (lastRow) {
            this.scrollHeight = lastRow[0].y + lastRow[0].height - this.yOffset - this.calcFrozenHeight()
        }

        const lastCell = lastRow[lastRow.length - 1]
        if (lastCell) {
            this.scrollWidth = lastCell.x + lastCell.width - this.xOffset - this.calcFrozenWidth()
        }
    }
    public getScrollHeight = () => this.scrollHeight
    public getScrollWidth = () => this.scrollWidth
    public setColCount = (colCount: number) => {
        this.colCount = colCount
    }
    public setPointStartRow = (row: number) => {
        this.pointStartRow = row
    }
    public setPointEndRow = (row: number) => {
        this.pointEndRow = row
    }
    public setPoinStartCol = (col: number) => {
        this.pointStartCol = col
    }
    public setScrollBar = (scrollBar: ScrollBar) => {
        this.scrollBar = scrollBar
    }
    /**
     * 设置冻结行
     */
    public setFrozenRowCount = (count: number) => {
        this.frozenRowCount = count
    }
    /**
     * 设置冻结列
     */
    public setFrozenColCount = (count: number) => {
        this.frozenColCount = count
    }
    /**
     * 绘制冻结行
     */
    private pointFrozenRow = (startColIndex, endColIndex, pointCellMap) => {
        const isFrozenRowCount = this.frozenRowCount > 0
        if (!isFrozenRowCount) return
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        // 绘制冻结行头
        for (let i = 0; i < this.frozenRowCount; i++) {
            const row = sheetData[i]
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = row[j]
                // 当前单元格已经被绘制过就跳出
                if (!cell || pointCellMap[`${i}${j}`]) continue
                if (cell.pointer && pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`]) continue

                // 重新定向到指针单元格
                if (cell.pointer) {
                    pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`] = true
                    cell = sheetData[cell.pointer[0]][cell.pointer[1]]
                }
                let x = cell.x
                let y = cell.y
                if (isFrozenRowCount) {
                    x -= horizontal.scrollLeft
                } else {
                    x -= horizontal.scrollLeft
                    y -= vertical.scrollTop
                }
                // 横线 第一行不画线
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x + cell.width, y)
                // 竖线 第一列不画
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x, y + cell.height)
                // 背景颜色
                this.paintCellBgColor(x, y, cell.width, cell.height, cell.backgroundColor || '#E1FFFF')

                this.pointCell(cell, -1, cell.y + (cell.height / 2) + (this.font / 2))
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointFrozenCol = (startRowIndex, endRowIndex, pointCellMap) => {
        const isFrozenColCount = this.frozenColCount > 0
        if (!isFrozenColCount) return
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        // 绘制冻结行头
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            for (let j = 0; j < this.frozenColCount; j++) {
                let cell = row[j]
                // 当前单元格已经被绘制过就跳出
                if (!cell || pointCellMap[`${i}${j}`]) continue
                if (cell.pointer && pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`]) continue
                // 重新定向到指针单元格
                if (cell.pointer) {
                    pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`] = true
                    cell = sheetData[cell.pointer[0]][cell.pointer[1]]
                }
                let x = cell.x
                let y = cell.y
                if (isFrozenColCount) {
                    y -= vertical.scrollTop
                } else {
                    x -= horizontal.scrollLeft
                    y -= vertical.scrollTop
                }
                // 横线 第一行不画线
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x + cell.width, y)
                // 竖线 第一列不画
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x, y + cell.height)
                // 背景颜色
                this.paintCellBgColor(x, y, cell.width, cell.height, '#E1FFFF')
                this.pointCell(cell, cell.x + 4, -1)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointBody = (pointCellMap, startRowIndex, endRowIndex, startColIndex, endColIndex) => {
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        // 绘制table部分
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = row[j]
                // 当前单元格已经被绘制过就跳出
                if (!cell || pointCellMap[`${i}${j}`]) continue
                if (cell.pointer && pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`]) continue

                // 重新定向到指针单元格
                if (cell.pointer) {
                    pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`] = true
                    cell = sheetData[cell.pointer[0]][cell.pointer[1]]
                }
                let x = cell.x - horizontal.scrollLeft
                let y = cell.y - vertical.scrollTop
                // 横线 第一行不画线
                // if(i !== startRowIndex && !isFrozenRowCount) {
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x + cell.width, y)
                // }
                // 竖线 第一列不画
                // if(j !== startColIndex && !isFrozenRowCount) {
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x, y + cell.height)
                // }
                this.pointCell(cell)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointLeftOrder = (startRowIndex: number, endRowIndex: number, frozenRow?: boolean) => {
        const sheetData = this.sheetData
        const hasOrder = this.options.order
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            if (hasOrder) {
                const cell = row[0]
                const y = frozenRow ? cell.y : cell.y - vertical.scrollTop
                // 横线
                // if (i !== startRowIndex) {
                canvasContext.moveTo(0, y)
                canvasContext.lineTo(0 + LEFT_ORDER_WIDTH, y)
                // }
                // 竖线
                canvasContext.moveTo(LEFT_ORDER_WIDTH, y)
                canvasContext.lineTo(LEFT_ORDER_WIDTH, y + HEADER_ORDER_WIDTH)
                // 背景颜色
                this.paintCellBgColor(0, y, LEFT_ORDER_WIDTH, cell.height, '#AFEEEE')
                // 字体
                canvasContext.fillStyle = '#000'
                canvasContext.fillText(i + 1, 0 + 4, y + (cell.height / 2) + (this.font / 2))
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    /**
     * 绘制左上角冻结的空白区域
     * @param pointCellMap
     */
    private pointLeftTopByFrozen = (pointCellMap) => {
        // const isFrozenColCount = this.frozenColCount > 0
        // if (!isFrozenColCount) return
        // const sheetData = this.sheetData
        // let width = 0
        // let height = 0
        // for(let i = 0; i < this.frozenRowCount; i++) {
        //     const row = sheetData[i]
        //     for(let j = 0; j < this.frozenColCount; j++) {
        //         let cell = row[j]
        //         if(i === 0 && j === 0) {
        //             sheetData[i][j].value = ''
        //             sheetData[i][j].rowspan = this.frozenRowCount
        //             sheetData[i][j].colspan = this.frozenColCount
        //         } else {
        //             sheetData[i][j] = {
        //                 pointer: [0, 0]
        //             }
        //         }
        //         if(j === 0) {
        //             width += cell.width
        //         }
        //     }
        //     height += row[0].height
        // }

        let cell:any
        if(this.sheetData.length) {
            if(this.sheetData[0].length) {
                cell = this.sheetData[0][0]
            }
        }
        if(!cell) return
        pointCellMap['00'] = true
        let x = cell.x
        let y = cell.y
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        // 横线 第一行不画线
        canvasContext.moveTo(x, y)
        canvasContext.lineTo(x + cell.width, y)
        // 竖线 第一列不画
        canvasContext.moveTo(x, y)
        canvasContext.lineTo(x, y + cell.height)
        // 背景颜色
        this.paintCellBgColor(x, y, cell.width, cell.height, '#E1FFFF')

        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    /**
     * 绘制整个sheet画布
     */
    public point = () => {
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        let startRowIndex = this.pointRange.startRowIndex = calcStartRowIndex(vertical.scrollTop, sheetData, this.yOffset)
        let endRowIndex = this.pointRange.endRowIndex = calcEndRowIndex(startRowIndex, this.clientHeight, sheetData)
        let startColIndex = this.pointRange.startColIndex = calcStartColIndex(horizontal.scrollLeft, sheetData, this.xOffset)
        let endColIndex = this.pointRange.endColIndex = calcEndColIndex(startColIndex, this.clientWidth, sheetData, this.xOffset)
        canvasContext.font = `${this.font}px Arial`
        
        // 记录当前单元格是否已经被绘制，有单元格合并的情况需要跳过
        const pointCellMap = {}
        startRowIndex = startRowIndex + this.frozenRowCount
        endRowIndex = endRowIndex + this.frozenRowCount
        startColIndex = startColIndex + this.frozenColCount
        endColIndex = endColIndex + this.frozenColCount
        if (startRowIndex < 0) startRowIndex = 0
        if (endRowIndex >= this.getRowCount() - 1) endRowIndex = this.getRowCount() - 1
        if (startColIndex < 0) startColIndex = 0
        if (endColIndex >= this.getColCount()) endColIndex = this.getColCount() - 1

        // 绘制table部分
        this.pointBody(pointCellMap, startRowIndex, endRowIndex, startColIndex, endColIndex)
        // 冻结列头
        this.pointFrozenCol(startRowIndex, endRowIndex, pointCellMap)

        // 冻结行头
        this.pointFrozenRow(startColIndex - this.frozenColCount, endColIndex, pointCellMap)

        // 绘制左侧序号 放在后面 可以覆盖前面的
        this.pointLeftOrder(startRowIndex, endRowIndex)

        // 冻结序号
        this.pointLeftOrder(0, this.frozenRowCount - 1, true)

        // 绘制左上角冻结区域
        this.pointLeftTopByFrozen(pointCellMap)
        
    }
    // 绘制背景颜色 context: CanvasRenderingContext2D
    private paintCellBgColor = (x: number, y: number, width: number, height: number, fillStyle?: string) => {
        const canvasContext = this.options.canvasContext
        canvasContext.fillStyle = fillStyle || '#fff'
        canvasContext.fillRect(x, y, width, height)
        canvasContext.fill()
    }
    private initScroll = () => {
        this.scrollBar = new ScrollBar({
            ele: this.options.layout.container,
            horizontalEle: this.options.layout.footerScrollBox,
            clientWidth: this.clientWidth,
            clientHeight: this.clientHeight,
            scrollClientHeight: this.options.height - this.yOffset,
            scrollHeight: this.getScrollHeight(),
            scrollClientWidth: this.options.layout.footerScrollBox.offsetWidth,
            scrollWidth: this.getScrollWidth(),
            eventBindEle: this.options.layout.container,
            verticalScrollCb: this.verticalScrollCb,
            horizontalScrollCb: this.horizontalScrollCb
        })
    }
    private verticalScrollCb = (vertical) => {
        window.requestAnimationFrame(() => {
            const canvasContext = this.options.canvasContext
            this.options.canvas.width = this.options.canvas.width
            canvasContext.scale(this.options.ratio, this.options.ratio)
            this.point()
        })
    }
    private horizontalScrollCb = (horizontal) => {
        window.requestAnimationFrame(() => {
            const canvasContext = this.options.canvasContext
            this.options.canvas.width = this.options.canvas.width
            canvasContext.scale(this.options.ratio, this.options.ratio)
            this.point()
        })
    }
    private pointCell = (cell: any, x?: number, y?: number) => {
        if (cell.value) {
            const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
            const scrollTop = this.scrollBar.getVertical().scrollTop
            const canvasContext = this.options.canvasContext
            let cx = x >= 0 ? x : cell.x - scrollLeft + 4
            let cy = y >= 0 ? y : cell.y - scrollTop + (cell.height / 2) + (this.font / 2)
            // 字体
            canvasContext.fillStyle = '#000'
            canvasContext.fillText(cell.value, cx, cy)
        }
    }
    public getRowCount() {
        return this.sheetData.length
    }

    public getColCount() {
        if (this.sheetData.length) {
            const row = this.sheetData[0]
            if (row) return row.length
        }
        return 0
    }
    private updateScrollHeight() {

    }
}

export default Sheet