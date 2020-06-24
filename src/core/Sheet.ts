import Table from './Table'
import { SheetOptions } from '../interface/SheetInterface'
import { initSheetData, insertTableDataToSheet } from './utils/sheetUtils'
class Sheet{
    constructor(options: SheetOptions) {
        this.tables = []
        this.rowCount = 10
        this.colCount = 4
        this.options = options
        this.sheetData = []
    }
    tables: any[]
    rowCount: number
    colCount: number
    options: SheetOptions
    sheetData: any[]
    font: number = 12
    pointStartRow: number = 0
    public addTable = (name: string, row: number, col: number, dataSource: any []) => {
        const table = new Table(name, row, col, dataSource)
        this.tables.push(table)
        this.sheetData = insertTableDataToSheet(row, col, table.getData(), this.sheetData)
        console.log(this.sheetData)
        return table
    }
    public getTable = (name: string) => {
        if(!name) return this.tables
        return this.tables.find(table => table.name === name)
    }
    public getSheetData = () => {
        return this.sheetData
    }
    public setRowColCount = (rowCount: number, colCount: number) => {
        this.sheetData = initSheetData(this.sheetData, rowCount, colCount, 80, 20)
        this.rowCount = rowCount
        this.colCount = colCount
    }
    public setColCount = (colCount: number) => {
        this.colCount = colCount
    }
    public setPointStartRow = (row: number) => {
        this.pointStartRow = row
    }
    public point = () => {
        const canvasContext = this.options.canvasContext
        canvasContext.clearRect(0, 0, this.options.canvas.width , this.options.canvas.height)
        canvasContext.font = `${this.font}px Arial`
        const sheetData = this.sheetData
		canvasContext.beginPath()
        for(let i = this.pointStartRow; i < sheetData.length; i++) {
            const row = sheetData[i]
            for(let j = 0; j < row.length; j++) {
                const cell = row[j]
                // 横线
				canvasContext.moveTo(cell.x, cell.y)
				canvasContext.lineTo(cell.x + cell.width, cell.y)
				// 竖线
				canvasContext.moveTo(cell.x, cell.y)
                canvasContext.lineTo(cell.x, cell.y+cell.height)
                // value
                cell.value && canvasContext.fillText(cell.value, cell.x + 4, cell.y + (cell.height / 2) + (this.font / 2))
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.stroke()
		canvasContext.closePath()
    }
}

export default Sheet