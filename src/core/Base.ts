import Table from './Table'
import { SheetOptions } from '../interface/SheetInterface'
import { setSheetDataByCount, insertTableDataToSheet, getCellWidthHeight } from '../utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBar'
import CreateTextarea from './CreateTextarea'
import watch from '../event/watch'
import { ROW_HEIGHT, COL_WIDTH, FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH, LEFT_ORDER_WIDTH, HEADER_ORDER_HEIGHT } from './const'
import Record from './Record'


// 10月 - 11月

// 1. 回撤， 修改value、复制粘贴、合并单元格(暂时不实现)
// 2. addTable 边界检测 --- 优化sheetData数据结构，把x,y,width,height提取到映射表中
// 绘制时，实时计算当前区域，实时计算单元格x、y、width、height，实时计算合并单元格width、height
// 3. 单元格样式设置setCellStyle
// 4. 单元格格式设置 数字、日期、字符串、下拉
// 5. 拖拽选中 超出可视区域时 自动滚动。插入行列，移除行列。选中区域对应行头列头选中效果
// 6. 二开 自定义render
// 7. 架构
// 8. 拖拽行列宽高

// 12月
// 1. ssr文档系统
// 2. demo搭建
// 3. 上线

class Base {
    constructor(options: SheetOptions) {
        this.tables = []
        this.options = Object.assign({
            rowHeight: ROW_HEIGHT,
            colWidth: COL_WIDTH,
            frozenRowCount: 0,
            frozenColCount: 0,
        }, options)
        this.rowCount = options.rowCount || 100
        this.colCount = options.colCount || 10
        this.rowHeight = this.options.rowHeight
        this.colWidth = this.options.colWidth
        this.sheetData = []
        this.mergeCells = {}
        this.frozenRowCount = this.options.frozenRowCount || 0
        this.frozenColCount = this.options.frozenColCount || 0
        // 有序号时的偏移量
        this.xOffset = this.options.order ? LEFT_ORDER_WIDTH : 0
        this.yOffset = this.options.headerOrder ? HEADER_ORDER_HEIGHT : 0
        // 计算可视区域宽高
        this.clientWidth = this.options.width - RIGHT_SCROLL_WIDTH - this.xOffset
        this.clientHeight = this.options.height - FOOTER_HEIGHT - this.yOffset
        this.setSheetName(this.options.name)
        this.setRowColCount(this.rowCount, this.colCount)
        this.calcClientWidthHeight()
        this.initScroll()
        this.textareaInstance = new CreateTextarea({
            container: this.options.layout.container,
            sheet: this
        })
        watch(this, 'selectedCell', () => {
            this.textareaInstance.hide()
            this.textareaInstance.changeSelectedCell(this)
        })
        this.record = new Record({ sheet: this })
    }
    point: any
    tables: any[]
    rowHeight: number = ROW_HEIGHT
    colWidth: number = COL_WIDTH
    rowCount: number
    colCount: number
    options: SheetOptions
    sheetData: any[]
    rowDataMap: any[] = []
    colDataMap: any[] = []
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
    frozenRowCount: number = 0
    frozenColCount: number = 0
    frozenInfo: any = {
        row: {
            startY: 0,
            endY: 0
        },
        col: {
            startX: 0,
            endX: 0
        }
    }
    xOffset: number = 0
    yOffset: number = 0
    selectedRange: number[] = []
    selectedRangeInFrozenRow: boolean // 当前选中区域是否在冻结行内
    selectedRangeInFrozenCol: boolean // 当前选中区域是否在冻结列内
    selectedCell: any = null
    selectedMoveRange: any = [null, null, null, null]
    textareaInstance: any = null
    isDbClick: boolean = false
    record: any
    public addTable = (name: string, row: number, col: number, dataSource: any[]) => {
        const table = new Table({
            name,
            row,
            col,
            dataSource,
            sheet: this
        })
        this.tables.push(table)
        this.sheetData = insertTableDataToSheet(row, col, table.getData(), this)
        this.scrollBar.resetScrollBar(this.getScrollHeight(), this.getScrollWidth())
        this.scrollBar.verticalScrollTo(this.getCellInfo(row, 0).y)
        this.scrollBar.horizontalScrollTo(this.getCellInfo(0, col).x)
        return table
    }
    public getTable = (name: string) => {
        if (!name) return this.tables
        return this.tables.find(table => table.name === name)
    }
    public getSheetData = () => {
        return this.sheetData
    }
    // 根据行列坐标获取映射单元格宽高等信息
    public getCellInfo = (row: number, col: number, pointerFlag?: boolean) => {
        const rowDataMap = this.rowDataMap
        const colDataMap = this.colDataMap
        // 获取到指针指向cell
        const pointer = this.sheetData[row][col].pointer
        if (pointerFlag && pointer) {
            row = pointer[0]
            col = pointer[1]
        }
        return {
            ...this.sheetData[row][col],
            ...getCellWidthHeight(row, col, this),
            x: colDataMap[col].x,
            y: rowDataMap[row].y
        }
    }
    // 设置单元格样式
    public setCellStyle = (row: number, col: number, style: any) => {
        if (this.sheetData[row][col].empty) {
            this.sheetData[row][col] = {}
        }
        this.sheetData[row][col].style = style
        this.nextTick(this.point, 'next-setCellStyle')
    }
    // 设置单元格 格式
    public setFormatter = (row: number, col: number, format: string) => {
        if (this.sheetData[row][col].empty) {
            this.sheetData[row][col] = {}
        }
        this.sheetData[row][col].format = format
        this.nextTick(this.point, 'next-setFormatter')
    }
    public setSheetName = (name: string) => {
        this.sheetName = name
    }
    public setRowColCount = (rowCount: number, colCount: number) => {
        this.sheetData = setSheetDataByCount(this, rowCount, colCount)
        this.rowCount = rowCount
        this.colCount = colCount
        this.calcScrollWidthHeight()
    }
    public setMergeCells = (row: number, col: number, rowCount: number, colCount: number) => {
        this.mergeCells[`${row}${col}`] = [rowCount, colCount]
        const sheetData = this.sheetData
        const endRow = row + rowCount
        const endCol = col + colCount
        // 修改指针指向
        for (let i = row; i < endRow; i++) {
            for (let j = col; j < endCol; j++) {
                if (i === row && j === col) {
                    if (sheetData[i][j].pointer) {
                        sheetData[i][j].pointer = null
                        delete sheetData[i][j].pointer
                    }
                } else {
                    if (sheetData[i][j].empty) {
                        sheetData[i][j] = {
                            pointer: [row, col]
                        }
                    } else {
                        sheetData[i][j].pointer = [row, col]
                    }
                    if (this.mergeCells[`${i}${j}`]) {
                        delete this.mergeCells[`${i}${j}`]
                    }
                }
            }
        }
    }
    public setMergeCellsByRange = () => {
        const selectedRange = this.selectedRange
        if (selectedRange.length) {
            this.setMergeCells(
                selectedRange[0],
                selectedRange[1],
                selectedRange[2] - selectedRange[0] + 1,
                selectedRange[3] - selectedRange[1] + 1
            )
            this.point()
        }
    }
    public removeMergeCells = (row: number, col: number, rowCount: number, colCount: number) => {
        const sheetData = this.sheetData
        const endRow = row + rowCount - 1
        const endCol = col + colCount - 1
        // 先判断当前区域是否可以移除合并，有些边界情况需要处理
        for (let i = row; i <= endRow; i++) {
            for (let j = col; j <= endCol; j++) {
                const cell = this.getCellInfo(i, j)
                if (cell.pointer) {
                    // 说明超出边界了
                    if (row > cell.pointer[0] || endRow < cell.endRow || col > cell.pointer[1] ||  endCol < cell.endCol) {
                        console.error('当前单元格跨合并区域不能取消合并，请重新选择')
                        return false
                    }
                }
            }
        }
        // 修改指针指向
        for (let i = row; i <= endRow; i++) {
            for (let j = col; j <= endCol; j++) {
                this.mergeCells[`${i}${j}`] = null
                sheetData[i][j].pointer = null
            }
        }
        this.point()
    }
    public removeMergeCellsByRange = () => {
        const selectedRange = this.selectedRange
        if (selectedRange.length) {
            this.removeMergeCells(
                selectedRange[0],
                selectedRange[1],
                selectedRange[2] - selectedRange[0] + 1,
                selectedRange[3] - selectedRange[1] + 1
            )
        }
    }
    // 设置行高
    public setRowHeight = (row: any, height: number) => {
        if (Array.isArray(row)) {
            row.forEach(item => {
                this.rowDataMap[item.row].height = item.height
            })
        } else {
            const oldHeight = this.rowDataMap[row].height
            if (oldHeight === height) return
            this.rowDataMap[row].height = height
        }
        this.updateRow(row)
    }
    // 设置列高
    public setColWidth = (col: number, width: number) => {
        if (Array.isArray(col)) {
            col.forEach(item => {
                this.colDataMap[item.col].width = item.width
            })
        } else {
            const oldWidth = this.colDataMap[col].width
            if (oldWidth === width) return
            this.colDataMap[col].width = width
        }
        this.updataCol(col)
    }
    public setSelectedCell = (selectedCell) => {
        this.selectedCell = selectedCell
    }
    public setSelectedRange = (selectedRange: number[]) => {
        this.selectedRange = selectedRange
    }
    
    private updateRowDataMapY = (startRow: number = 0) => {
        const startCell = this.rowDataMap[startRow]
        let startY = startCell.y + startCell.height
        for (let i = startRow + 1; i < this.rowDataMap.length; i++) {
            this.rowDataMap[i].y = startY
            startY += this.rowDataMap[i].height
        }
    }
    private updateColDataMapX = (startCol: number = 0) => {
        const startCell = this.colDataMap[startCol]
        let startX = startCell.x + startCell.width
        for (let i = startCol + 1; i < this.colDataMap.length; i++) {
            this.colDataMap[i].x = startX
            startX += this.colDataMap[i].width
        }
    }
    private updateRow = (row: number = 0) => {
        this.updateRowDataMapY(row)
        this.calcScrollWidthHeight()
        this.scrollBar.resetScrollBar(this.getScrollHeight(), this.getScrollWidth())
        this.nextTick(this.point, 'next-updateRow')
    }
    private updataCol = (startCol: number = 0) => {
        this.updateColDataMapX(startCol)
        this.calcScrollWidthHeight()
        this.scrollBar.resetScrollBar(this.getScrollHeight(), this.getScrollWidth())
        this.nextTick(this.point, 'next-updateCol')
    }
    private nextTick = (callback: Function, flag: string) => {
        if (!this[flag]) {
            const p = Promise.resolve()
            p.then(() => {
                callback()
                this[flag] = null
                delete this[flag]
            })
            this[flag] = true;
        }
    }
    // 设置单元格值
    public setCellValue = (
        row: number,
        col: number,
        value: any,
        extend: any = {
            point: true,
            record: true
        }
    ) => {
        let cell = this.sheetData[row][col]
        if (cell.empty) {
            this.sheetData[row][col] = {
                value: ''
            }
        }
        const oldVal = this.sheetData[row][col]
        // 记录操作
        // 当上一次value和当前value不一样时 赋值、记录
        // 注意excel中相同value的更改也会被记录
        if (oldVal !== value) {
            this.sheetData[row][col].value = value
            if (extend.record) {
                this.record.add({
                    undo: {
                        setCellValue: [{
                            row,
                            col,
                            value: oldVal,
                            extend: {
                                point: true,
                                record: false
                            }
                        }],
                        setSelectedCell: { ...this.selectedCell, value: oldVal },
                        setSelectedRange: [...this.selectedRange]
                    },
                    redo: {
                        setCellValue: [{
                            row,
                            col,
                            value,
                            extend: {
                                point: true,
                                record: false
                            }
                        }],
                        setSelectedCell: { ...this.selectedCell, value },
                        setSelectedRange: [...this.selectedRange]
                    }
                })
            }
            extend.point && this.nextTick(this.point, 'next-setCellValue')
        }
    }
    // 计算冻结行高
    // yOffsetFlag 是否需要计算序列号的高度
    public calcFrozenHeight = (yOffsetFlag: boolean = true) => {
        if (this.frozenRowCount > 0) {
            const rowDataMap = this.rowDataMap
            const last = rowDataMap[this.frozenRowCount - 1]
            return last.y + last.height - (yOffsetFlag ? this.yOffset : 0)
        }
        return 0
    }
    // 计算冻结列宽
    // xOffsetFlag 是否需要计算序列号的宽度
    public calcFrozenWidth = (xOffsetFlag: boolean = true) => {
        if (this.frozenColCount > 0) {
            const colDataMap = this.colDataMap
            const last = colDataMap[this.frozenColCount - 1]
            return last.x + last.width - (xOffsetFlag ? this.xOffset : 0)
        }
        return 0
    }
    private calcClientWidthHeight = () => {
        this.clientWidth = this.clientWidth - this.calcFrozenWidth()
        this.clientHeight = this.clientHeight - this.calcFrozenHeight()
    }
    // 计算内容区域的宽高 需要减去偏移量以及冻结窗口
    public calcScrollWidthHeight = () => {
        const lastRowCell = this.getCellInfo(this.rowCount - 1, 0)
        // 更新内容宽高 用来创建滚动条
        if (lastRowCell) {
            this.scrollHeight = lastRowCell.y + lastRowCell.height - this.yOffset - this.calcFrozenHeight()
        }
        const lastColCell = this.getCellInfo(this.rowCount - 1, this.colCount - 1)
        if (lastColCell) {
            this.scrollWidth = lastColCell.x + lastColCell.width - this.xOffset - this.calcFrozenWidth()
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
    public calcCellSelectedRange = (cell) => {
        const mergeCells = this.mergeCells
        // 如果当前选中区域有合并单元格 找出最大边界
        // 此处可优化计算，当合并区域小于选中区域是可跳过计算 111
        const findMergeBound = (selectedRanges) => {
            const selectedRange = [...selectedRanges]
            let lastSelectedRange = [...selectedRange].toString()
            for (let i = selectedRange[0]; i <= selectedRange[2]; i++) {
                for (let j = selectedRange[1]; j <= selectedRange[3]; j++) {
                    const cell = this.getCellInfo(i, j)
                    const pointer = cell.pointer || [i, j]
                    const mergeCellEnd = mergeCells[`${pointer[0]}${pointer[1]}`]
                    if (mergeCellEnd) {
                        let mergeStartRow = cell.pointer ? cell.pointer[0] : i
                        let mergeStartCol = cell.pointer ? cell.pointer[1] : j
                        let mergeEndRow = mergeStartRow + mergeCellEnd[0] - 1
                        let mergeEndCol = mergeStartCol + mergeCellEnd[1] - 1
                        if (mergeStartRow < selectedRange[0]) {
                            selectedRange[0] = mergeStartRow
                        }
                        if (mergeEndRow > selectedRange[2]) {
                            selectedRange[2] = mergeEndRow
                        }
                        if (mergeStartCol < selectedRange[1]) {
                            selectedRange[1] = mergeStartCol
                        }
                        if (mergeEndCol > selectedRange[3]) {
                            selectedRange[3] = mergeEndCol
                        }
                        this.selectedRange = selectedRange
                        // 上一次和当前不同递归
                        // 上一次和当前如果相同说明找到边界
                        if (lastSelectedRange !== selectedRange.toString()) {
                            findMergeBound(selectedRange)
                        }
                    }
                }
            }
        }
        if (cell) {
            const selectedRange = this.selectedRange
            const selectedCellRange = this.selectedCell.range
            if (selectedCellRange) {
                const row = cell.range[0]
                const col = cell.range[1]
                selectedRange[2] = row
                selectedRange[3] = col
                // 反方向选中
                if (row < selectedCellRange[0]) {
                    selectedRange[0] = row
                    selectedRange[2] = selectedCellRange[0]
                }
                if (col < selectedCellRange[1]) {
                    selectedRange[1] = col
                    selectedRange[3] = selectedCellRange[1]
                }
                this.selectedRange = selectedRange
            }
            // 如果当前区域有合并单元格 需要找出最大的边界值
            findMergeBound(selectedRange)
        }
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
    public getRowCount() {
        return this.rowDataMap.length
    }
    public getColCount() {
        return this.colDataMap.length
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

export default Base