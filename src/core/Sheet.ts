import Table from './Table'
import { SheetOptions, PointRange } from '../interface/SheetInterface'
import { setSheetRowColCount, insertTableDataToSheet, setLeftTopByFrozenData, numToABC } from './utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBar'
import { calcStartRowIndex, calcEndRowIndex, calcStartColIndex, calcEndColIndex } from '../utils/helper'
import { ROW_HEIGHT, COL_WIDTH, FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH, LEFT_ORDER_WIDTH, HEADER_ORDER_HEIGHT } from './const'
class Sheet {
    constructor(options: SheetOptions) {
        this.tables = []
        this.rowCount = 100
        this.colCount = 10
        this.options = options
        this.sheetData = []
        this.mergeCells = {}
        this.frozenRowCount = options.frozenRowCount || 0
        this.frozenColCount = options.frozenColCount || 0
        // 有序号时的偏移量
        this.xOffset = this.options.order ? LEFT_ORDER_WIDTH : 0
        this.yOffset = this.options.headerOrder ? HEADER_ORDER_HEIGHT : 0
        // 计算可视区域宽高
        this.clientWidth = this.options.width - RIGHT_SCROLL_WIDTH - this.xOffset
        this.clientHeight = this.options.height - FOOTER_HEIGHT - this.yOffset
        this.setSheetName(options.name)
        this.setRowColCount(options.rowCount, options.colCount)
        this.calcClientWidthHeight()
        this.initScroll()
    }
    tables: any[]
    rowsHeight: number[] = []
    colsWidth: number[] = []
    rowCount: number
    colCount: number
    options: SheetOptions
    sheetData: any[]
    mergeCells: any
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
    selectedRange: number[] = []
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
        this.sheetData = insertTableDataToSheet(row, col, table.getData(), this.sheetData, this.mergeCells)
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
    public getCellRange = (x: number, y: number, xx: number, yy: number) => {
        const cells = []
        for (let i = x; i <= xx; i++) {
            for (let j = y; j <= yy; j++) {
                cells.push({ ...this.sheetData[i][j] })
            }
        }
        return cells
    }
    public setSheetName = (name: string) => {
        this.sheetName = name
    }
    public setRowColCount = (rowCount: number, colCount: number) => {
        this.sheetData = setSheetRowColCount(this.sheetData, rowCount, colCount, 100, 24, this.xOffset, this.yOffset)
        this.rowCount = rowCount
        this.colCount = colCount
        this.rowsHeight = new Array(rowCount).fill(ROW_HEIGHT)
        this.colsWidth = new Array(colCount).fill(COL_WIDTH)
        this.calcScrollWidthHeight()
    }
    public setMergeCells = (row: number, col: number, endRow: number, endCol: number) => {
        this.mergeCells[`${row}${col}`] = [endRow - row, endCol - col]
    }
    public removeMergeCells = () => {

    }
    // 设置行高
    public setRowsHeight = (rows = []) => {
        rows.forEach(item => this.rowsHeight[item.row] = item.height)
    }
    // 设置列高
    public setColsWidth = (cols = []) => {
        cols.forEach(item => this.colsWidth[item.col] = item.width)
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
                cell.backgroundColor = cell.backgroundColor || '#E1FFFF'
                this.pointCell(cell, undefined, cell.y)
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
                let y = cell.y - vertical.scrollTop
                if (!isFrozenColCount) {
                    x -= horizontal.scrollLeft
                }
                cell.backgroundColor = cell.backgroundColor || '#E1FFFF'
                this.pointCell(cell, cell.x, y)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointBody = (pointCellMap, startRowIndex, endRowIndex, startColIndex, endColIndex) => {
        const sheetData = this.sheetData
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        // 绘制table部分
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = row[j]
                // 当前单元格已经被绘制过就跳出，合并单元格的情况，因为后面的数据和前面的一样
                if (!cell || pointCellMap[`${i}${j}`]) continue
                if (cell.pointer && pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`]) continue

                // 如果当前开始的位置的单元格是合并单元格，且不是第一个位置，重新定向到指针单元格，也就是第一个带合并信息的单元格。
                // 因为第一个带合并信息的单元格的合并信息和坐标是准确的
                if (cell.pointer) {
                    pointCellMap[`${cell.pointer[0]}${cell.pointer[1]}`] = true
                    cell = sheetData[cell.pointer[0]][cell.pointer[1]]
                }
                this.pointCell(cell)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointLeftOrder = (startRowIndex: number, endRowIndex: number, frozenRow?: boolean) => {
        const hasOrder = this.options.order
        if (!hasOrder) return
        const sheetData = this.sheetData
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = sheetData[i]
            const cell = row[0]
            let y = frozenRow ? cell.y : cell.y - vertical.scrollTop
            this.pointCell({
                color: '#000',
                value: i + 1,
                width: LEFT_ORDER_WIDTH,
                height: cell.height,
                backgroundColor: '#AFEEEE'
            }, 0, y)
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointTopOrder = (startColIndex, endColIndex, frozen?: boolean) => {
        const sheetData = this.sheetData
        const headerOrder = this.options.headerOrder
        if (!headerOrder) return
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let j = startColIndex; j <= endColIndex; j++) {
            const cell = sheetData[0][j]
            let x = frozen ? cell.x : cell.x - scrollLeft
            this.pointCell({
                color: '#000',
                value: numToABC(j),
                width: this.colsWidth[j],
                height: HEADER_ORDER_HEIGHT,
                backgroundColor: '#AFEEEE'
            }, x, 0)
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    /**
     * 绘制body区域左上角冻结的空白区域
     * @param pointCellMap
     */
    private pointLeftTopByFrozenOnBody = (pointCellMap) => {
        let cell: any
        if (this.sheetData.length) {
            if (this.sheetData[0].length) {
                cell = this.sheetData[0][0]
            }
        }
        if (!cell) return
        pointCellMap['00'] = true

        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        cell.backgroundColor = '#E1FFFF'
        this.pointCell(cell, cell.x, cell.y)
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    /**
     * 如果有行列标，绘制左上角空白区域
     */
    private pointLeftTopByFrozen = () => {
        if (this.options.order && this.options.headerOrder) {
            const canvasContext = this.options.canvasContext
            canvasContext.beginPath()
            const cell: any = {
                x: 0,
                y: 0,
                width: LEFT_ORDER_WIDTH,
                height: HEADER_ORDER_HEIGHT,
                backgroundColor: '#FFFFFF',
                value: ''
            }
            this.pointCell(cell, cell.x, cell.y)
            canvasContext.strokeStyle = "#ccc"
            canvasContext.closePath()
            canvasContext.stroke()
        }
    }
    private pointSelectedRange = () => {
        if (this.selectedRange.length) {
            const selected: any = {
                x: null,
                y: null,
                width: 0,
                height: 0,
                fristCell: null
            }
            for (let i = this.selectedRange[0]; i <= this.selectedRange[2]; i++) {
                if (i < this.pointRange.startRowIndex || i > this.pointRange.endRowIndex) break

                for (let j = this.selectedRange[1]; j <= this.selectedRange[3]; j++) {
                    if (j < this.pointRange.startColIndex || j > this.pointRange.endColIndex) break

                    if(selected.fristCell === null) {
                        selected.fristCell = this.getCellRange(i, j, i, j)[0]
                    }
                    // 累加宽，只需要第一行的即可
                    if (i === this.selectedRange[0]) {
                        const cell = this.getCellRange(i, j, i, j)[0]
                        if (cell) {
                            selected.width += cell.width
                            if (selected.x === null) {
                                selected.x = cell.x
                            }
                            if (selected.y === null) {
                                selected.y = cell.y
                            }
                        }
                    }
                    // 累加高，只需要第一列
                    if (j === this.selectedRange[1]) {
                        const cell = this.getCellRange(i, j, i, j)[0]
                        if (cell) {
                            selected.height += cell.height
                        }
                    }
                }
            }
            const canvasContext = this.options.canvasContext
            
            // 单元格背景颜色

            // 第一行除第一个单元格外的单元格背景颜色

            // 排除只有一列的情况，>=1说明至少有两列
            if(this.selectedRange[3] - this.selectedRange[1] >= 1) {
                this.paintCellBgColor(
                    selected.x + selected.fristCell.width,
                    selected.fristCell.y,
                    selected.width - selected.fristCell.width,
                    selected.fristCell.height,
                    null,
                    'rgba(0, 0, 0, 0.2)'
                )
            }
            
            // 绘制第二行后单元格背景
            // 排除只有一行的情况 >=1说明至少有两行
            if(this.selectedRange[2] - this.selectedRange[0] >= 1) {
                this.paintCellBgColor(
                    selected.x,
                    selected.fristCell.y + selected.fristCell.height,
                    selected.width,
                    selected.fristCell.height,
                    null,
                    'rgba(0, 0, 0, 0.2)'
                )
            }
            
            // 绘制线段
            canvasContext.beginPath()
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = '#227346';
            canvasContext.moveTo(selected.x - 1, selected.y)
            canvasContext.lineTo(selected.x + selected.width + 2, selected.y)

            canvasContext.moveTo(selected.x - 1, selected.y + selected.height + 1)
            canvasContext.lineTo(selected.x + selected.width - 3, selected.y + selected.height + 1)

            canvasContext.moveTo(selected.x, selected.y)
            canvasContext.lineTo(selected.x, selected.y + selected.height)
            
            canvasContext.moveTo(selected.x + selected.width + 1, selected.y)
            canvasContext.lineTo(selected.x + selected.width + 1, selected.y + selected.height - 3)

            canvasContext.stroke()

            canvasContext.fillStyle = '#227346'
            canvasContext.fillRect(selected.x + selected.width - 2, selected.y + selected.height - 2, 5, 5)
        
            canvasContext.closePath()
            
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
        canvasContext.lineWidth = 1;
        let startRowIndex = calcStartRowIndex(vertical.scrollTop, sheetData, this.yOffset, this.rowsHeight)
        let endRowIndex = calcEndRowIndex(startRowIndex, this.clientHeight, sheetData, this.rowsHeight)
        let startColIndex = calcStartColIndex(horizontal.scrollLeft, sheetData, this.xOffset, this.colsWidth)
        let endColIndex = calcEndColIndex(startColIndex, this.clientWidth, sheetData, this.colsWidth)
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
        this.pointRange.startRowIndex = startRowIndex
        this.pointRange.endRowIndex = endRowIndex
        this.pointRange.startColIndex = startColIndex
        this.pointRange.endColIndex = endColIndex
        // 绘制table部分
        this.pointBody(pointCellMap, startRowIndex, endRowIndex, startColIndex, endColIndex)
        // 冻结列头
        this.pointFrozenCol(startRowIndex, endRowIndex, pointCellMap)

        // 冻结行头
        this.pointFrozenRow(startColIndex - this.frozenColCount, endColIndex, pointCellMap)

        // 头部列标
        this.pointTopOrder(startColIndex, endColIndex)

        // 冻结头部列标
        this.pointTopOrder(0, this.frozenColCount - 1, true)

        // 绘制左侧序号 放在后面 可以覆盖前面的
        this.pointLeftOrder(startRowIndex, endRowIndex)

        // 冻结序号
        this.pointLeftOrder(0, this.frozenRowCount - 1, true)

        // 如果有冻结行列，绘制body区域左上角冻结区域
        this.pointLeftTopByFrozenOnBody(pointCellMap)

        // 如果有行列标，绘制左上角空白区域
        this.pointLeftTopByFrozen()

        // 绘制选中区域
        this.pointSelectedRange()

    }
    // 绘制背景颜色 context: CanvasRenderingContext2D
    private paintCellBgColor = (x: number, y: number, width: number, height: number, fillStyle: string, customStyle?: string) => {
        const canvasContext = this.options.canvasContext
        canvasContext.fillStyle = customStyle || fillStyle
        canvasContext.fillRect(x, y, width, height)
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
            // canvasContext.clearRect(0,0,this.options.canvas.width,this.options.canvas.height);
            this.point()
        })
    }
    private horizontalScrollCb = (horizontal) => {
        window.requestAnimationFrame(() => {
            const canvasContext = this.options.canvasContext
            this.options.canvas.width = this.options.canvas.width
            canvasContext.scale(this.options.ratio, this.options.ratio)
            // canvasContext.clearRect(0,0,this.options.canvas.width,this.options.canvas.height);
            this.point()
        })
    }
    private pointCell = (cell: any, x?: number, y?: number) => {
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
        const scrollTop = this.scrollBar.getVertical().scrollTop
        const canvasContext = this.options.canvasContext
        const lineX = x !== undefined ? x : cell.x - scrollLeft
        const lineY = y !== undefined ? y : cell.y - scrollTop
        
        canvasContext.strokeStyle = '#227346';
        canvasContext.moveTo(lineX + 0.5, lineY + cell.height + 0.5)
        canvasContext.lineTo(lineX + cell.width + 0.5, lineY + cell.height + 0.5)

        canvasContext.moveTo(lineX + cell.width + 0.5, lineY + 0.5)
        canvasContext.lineTo(lineX + cell.width + 0.5, lineY + cell.height + 0.5)
        // 单元格背景颜色
        this.paintCellBgColor(lineX, lineY, cell.width, cell.height, cell.backgroundColor || '#FFFFFF')

        if (cell.value) {
            let fontX = x !== undefined ? x + 4 : cell.x - scrollLeft + 4
            let fontY = y !== undefined ? y + (cell.height / 2) + (this.font / 2) : cell.y - scrollTop + (cell.height / 2) + (this.font / 2)
            // 字体
            canvasContext.fillStyle = '#000'
            canvasContext.fillText(cell.value, fontX, fontY)
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
    public destroy = () => {
        this.tables.forEach(t => t.destroy())
        this.tables = null
        this.options = null
        this.sheetData = null
        this.mergeCells = null
        this.scrollBar = null
    }
}

export default Sheet