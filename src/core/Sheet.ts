import Table from './Table'
import { SheetOptions } from '../interface/SheetInterface'
import { initSheetData, insertTableDataToSheet } from './utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBar'
import { calcStartRowIndex, calcEndRowIndex, calcStartColIndex, calcEndColIndex } from '../utils/helper'
class Sheet {
    constructor(options: SheetOptions) {
        this.tables = []
        this.rowCount = 10
        this.colCount = 4
        this.options = options
        this.sheetData = []
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
    public addTable = (name: string, row: number, col: number, dataSource: any[]) => {
        const table = new Table(name, row, col, dataSource)
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
        this.sheetData = initSheetData(this.sheetData, rowCount, colCount, 80, 20)
        this.rowCount = rowCount
        this.colCount = colCount
        this.calcScrollWidthHeight()
    }
    public calcScrollWidthHeight() {
        const lastRow = this.sheetData[this.rowCount - 1] || []
        // 更新内容宽高 用来创建滚动条
        if (lastRow.length) {
            this.scrollHeight = lastRow[0].y + lastRow[0].height
        }
        const lastCell = lastRow[lastRow.length - 1]
        if (lastCell) {
            this.scrollWidth = lastCell.x + lastCell.width
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
     * 绘制整个sheet画布
     */
    public point = () => {
        const sheetData = this.sheetData
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        const startRowIndex = calcStartRowIndex(vertical.scrollTop, sheetData)
        const endRowIndex = calcEndRowIndex(startRowIndex, this.options.clientHeight, sheetData)
        const startColIndex = calcStartColIndex(horizontal.scrollLeft, sheetData)
        const endColIndex = calcEndColIndex(startColIndex, this.options.clientWidth, sheetData)
        canvasContext.clearRect(0, 0, this.options.canvas.width, this.options.canvas.height)
        canvasContext.font = `${this.font}px Arial`
        canvasContext.beginPath()
        const hasOrder = true
        const xOffset = hasOrder ? 20 : 0
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            if(hasOrder) {
                // const cell = row[0]
                // const y = cell.y
                // // 横线
                // canvasContext.moveTo(0, y)
                // canvasContext.lineTo(0 + cell.width, y)
                // // 竖线
                // canvasContext.moveTo(0, y)
                // canvasContext.lineTo(0, y + cell.height)

                // this.pointCell({
                //     x: 0,
                //     y: cell.y,
                //     value: i
                // })
            }
            for (let j = startColIndex; j <= endColIndex; j++) {
                const cell = row[j]
                const x = cell.x - horizontal.scrollLeft + xOffset
                const y = cell.y - vertical.scrollTop
                // 横线
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x + cell.width, y)
                // 竖线
                canvasContext.moveTo(x, y)
                canvasContext.lineTo(x, y + cell.height)

                this.pointCell(cell)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.stroke()
        canvasContext.closePath()
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
        this.point()
    }
    private horizontalScrollCb = (horizontal) => {
        this.point()
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