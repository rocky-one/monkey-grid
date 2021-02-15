import Table from './Table'
import { SheetOptions, PointRange } from '../interface/SheetInterface'
import { setSheetRowColCount, insertTableDataToSheet } from './utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBar'
import { calcStartRowIndex, calcEndRowIndex, calcStartColIndex, calcEndColIndex } from '../utils/helper'
import { LEFT_ORDER_WIDTH, HEADER_ORDER_WIDTH } from './const'
class Sheet {
    constructor(options: SheetOptions) {
        this.tables = []
        this.rowCount = 10
        this.colCount = 4
        this.options = options
        this.sheetData = []
        this.frozenRowCount = options.frozenRowCount || 0
        this.frozenColCount = options.frozenColCount || 0
        this.setSheetName(options.name)
        this.setRowColCount(options.rowCount, options.colCount)
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
    scrollHeight: number = 0
    scrollWidth: number = 0
    pointRange: PointRange = {
        startRowIndex: 0,
        endRowIndex: 0,
        startColIndex: 0,
        endColIndex: 0
    }
    frozenRowCount: number =  0
    frozenColCount: number = 0
    public addTable = (name: string, row: number, col: number, dataSource: any[]) => {
        const table = new Table({
            name,
            row,
            col,
            dataSource,
            xOffset: this.options.xOffset,
            yOffset: this.options.yOffset
        })
        this.tables.push(table)
        
        this.sheetData = insertTableDataToSheet(row, col, table.getData(), this.sheetData)
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
        this.sheetData = setSheetRowColCount(this.sheetData, rowCount, colCount, 100, 24, this.options.xOffset, this.options.yOffset)
        this.rowCount = rowCount
        this.colCount = colCount
        this.calcScrollWidthHeight()
    }
    // 计算内容区域的宽高 需要减去偏移量以及后续的 冻结窗口111
    public calcScrollWidthHeight() {
        const lastRow = this.sheetData[this.rowCount - 1] || []
        // 更新内容宽高 用来创建滚动条
        if (lastRow.length) {
            this.scrollHeight = lastRow[0].y + lastRow[0].height - this.options.yOffset
        }
        const lastCell = lastRow[lastRow.length - 1]
        if (lastCell) {
            this.scrollWidth = lastCell.x + lastCell.width - this.options.xOffset
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
    private pointBody = (pointCellMap, startRowIndex, endRowIndex, startColIndex, endColIndex, isFrozen?: boolean) => {
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        // 绘制table部分
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = row[j]
                // 当前单元格已经被绘制过就跳出
                if(!cell || pointCellMap[`${i}${j}`]) continue
                if(cell.pointer && pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`]) continue
                
                // 重新定向到指针单元格
                if(cell.pointer) {
                    pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`] = true
                    cell = sheetData[cell.pointer[0]][cell.pointer[1]]
                }
                const x = cell.x - horizontal.scrollLeft
                const y = cell.y - vertical.scrollTop
                // 横线 第一行不画线
                // if(i !== startRowIndex && !isFrozen) {
                    canvasContext.moveTo(x, y)
                    canvasContext.lineTo(x + cell.width, y)
                // }
                // 竖线 第一列不画
                // if(j !== startColIndex && !isFrozen) {
                    canvasContext.moveTo(x, y)
                    canvasContext.lineTo(x, y + cell.height)
                // }
                this.pointCell(cell)
            }
        }
    }
    /**
     * 绘制整个sheet画布
     */
    public point = () => {
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        const startRowIndex = this.pointRange.startRowIndex = calcStartRowIndex(vertical.scrollTop, sheetData, this.options.yOffset)
        const endRowIndex = this.pointRange.endRowIndex = calcEndRowIndex(startRowIndex, this.options.clientHeight, sheetData)
        const startColIndex = this.pointRange.startColIndex = calcStartColIndex(horizontal.scrollLeft, sheetData, this.options.xOffset)
        const endColIndex = this.pointRange.endColIndex = calcEndColIndex(startColIndex, this.options.clientWidth, sheetData, this.options.xOffset)
        canvasContext.font = `${this.font}px Arial`
        canvasContext.beginPath()
        const hasOrder = this.options.order
        // 记录当前单元格是否已经被绘制，有单元格合并的情况需要跳过
        const pointCellMap = {}

        if(this.frozenRowCount > 0) {
            this.pointBody(pointCellMap, 0, this.frozenRowCount - 1, startColIndex, endColIndex, true)
        }
        // 绘制table部分
        this.pointBody(pointCellMap, startRowIndex + this.frozenRowCount, endRowIndex, startColIndex, endColIndex)

        // 绘制左侧序号 放在后面 可以覆盖前面的
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            if (hasOrder) {
                const cell = row[0]
                const y = cell.y - vertical.scrollTop
                // 横线
                if(i !== startRowIndex) {
                    canvasContext.moveTo(0, y)
                    canvasContext.lineTo(0 + LEFT_ORDER_WIDTH, y)
                }
                // 竖线
                canvasContext.moveTo(LEFT_ORDER_WIDTH, y)
                canvasContext.lineTo(LEFT_ORDER_WIDTH, y + HEADER_ORDER_WIDTH)
                // 背景颜色
                this.paintCellBgColor(0, y, LEFT_ORDER_WIDTH, cell.height, '#fff')
                // 字体
                canvasContext.fillStyle = '#000'
                canvasContext.fillText(i + 1, 0 + 4, y + (cell.height / 2) + (this.font / 2))
            }
        }
        
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
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
            clientHeight: this.options.clientHeight,
            scrollClientHeight: this.options.clientHeight,
            scrollHeight: this.getScrollHeight(),
            clientWidth: this.options.clientWidth,
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
    private pointCell = (cell: any) => {
        if (cell.value) {
            const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
            const scrollTop = this.scrollBar.getVertical().scrollTop
            const canvasContext = this.options.canvasContext
            canvasContext.fillText(cell.value, cell.x - scrollLeft + 4, cell.y - scrollTop + (cell.height / 2) + (this.font / 2))
        }
    }

    private updateScrollHeight() {

    }
}

export default Sheet