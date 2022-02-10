import Table from './Table'
import { SheetOptions } from '../interface/SheetInterface'
import { setSheetDataByCount, insertTableDataToSheet, getCellMergeWidthHeight, emptyCell } from '../utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBarS'
import CreateTextarea from './CreateTextarea'
import watch from '../event/watch'
import { ROW_HEIGHT, COL_WIDTH, FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH, LEFT_ORDER_WIDTH, HEADER_ORDER_HEIGHT } from './const'
import Record from './Record'
import Formatter from './Formatter'


// 6. 二开 自定义render

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
        }, {...options})
        this.active = options.active
        this.name = options.name
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
        this.clientWidth = this.originClientWidth = this.options.width - RIGHT_SCROLL_WIDTH - this.xOffset
        this.clientHeight = this.originClientHeight = this.options.height - FOOTER_HEIGHT - this.yOffset - 4
        this.init()
        this.textareaInstance = new CreateTextarea({
            container: this.options.layout.container,
            sheet: this
        })
        watch(this, 'selectedCell', () => {
            this.textareaInstance.hide()
            this.textareaInstance.changeSelectedCell(this)
        })
        this.record = new Record({ sheet: this })
        this.formatterInstance = new Formatter({})
    }
    active: boolean
    name: string
    paint: any
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
    paintStartRow: number = 0
    paintEndRow: number = 0
    paintStartCol: number = 0
    scrollBar: ScrollBar
    sheetName: string
    clientHeight: number = 0
    clientWidth: number = 0
    originClientHeight: number = 0
    originClientWidth: number = 0
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
    formatterInstance: Formatter
    originPointer: any = {}
    keyboardInfo: any = {
        row: -1,
        col: -1
    }
    public init = () => {
        this.setSheetName(this.options.name)
        this.setRowColCount(this.rowCount, this.colCount)
        this.calcClientWidthHeight()
        this.initScroll()
    }
    public setSize = (width?: number, height?: number) => {
        if (width) {
            this.options.width = width
        }
        if (height) {
            this.options.height = height
        }
        this.clientWidth = this.originClientWidth = this.options.width - RIGHT_SCROLL_WIDTH - this.xOffset
        this.clientHeight = this.originClientHeight = this.options.height - FOOTER_HEIGHT - this.yOffset - 4
        this.calcClientWidthHeight()
        this.initScroll()
    }
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
        this.options.getScroll().resetScrollBar(this.getScrollHeight(), this.getScrollWidth(), this.scrollBar.vertical, this.scrollBar.horizontal)
        this.options.getScroll().verticalScrollTo(this.getCellInfo(row, 0).y - this.yOffset)
        this.options.getScroll().horizontalScrollTo(this.getCellInfo(0, col).x - this.xOffset)
        return table
    }
    public getTable = (name: string) => {
        if (!name) return this.tables
        return this.tables.find(table => table.name === name)
    }
    public getSheetData = () => {
        return this.sheetData
    }
    public gePointer = (row: number, col: number) => {
        const pointId = this.sheetData[row][col].pointId
        if (pointId) {
            return this.originPointer[pointId]
        }
        return false
    }
    // 根据行列坐标获取映射单元格宽高等信息
    public getCellInfo = (row: number, col: number, painterFlag?: boolean) => {
        const rowDataMap = this.rowDataMap
        const colDataMap = this.colDataMap
        // 获取到指针指向cell
        const pointer = this.gePointer(row, col)
        if (painterFlag && pointer) {
            row = pointer[0]
            col = pointer[1]
        }
        const whInfo = getCellMergeWidthHeight(row, col, this)
        return {
            ...this.sheetData[row][col],
            ...whInfo,
            x: colDataMap[col].x,
            y: rowDataMap[row].y,
            range: [row, col, whInfo.endRow, whInfo.endCol]
        }
    }
    // 设置单元格样式
    public setCellStyle = (row: number, col: number, style: any) => {
        if (this.sheetData[row][col].empty) {
            this.sheetData[row][col] = {}
        }
        this.sheetData[row][col].style = style
        this.nextTick(this.paint, 'next-setCellStyle')
    }
    // 设置单元格类型 number date string dropdown
    public setCellType = (row: number, col: number, type: string) => {
        if (this.sheetData[row][col].empty) {
            this.sheetData[row][col] = {}
        }
        this.sheetData[row][col].type = type
    }
    // 设置单元格 格式
    public setCellFormatter = (row: number, col: number, formatCode: string) => {
        if (this.sheetData[row][col].empty) {
            this.sheetData[row][col] = {}
        }
        this.sheetData[row][col].format = formatCode
        this.nextTick(this.paint, 'next-setCellStyle')
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
        if (this.sheetData[row][col].empty) {
            this.sheetData[row][col] = {}
        }
        const random = this.sheetData[row][col].originPointId || Math.random()
        this.sheetData[row][col].merge = [rowCount, colCount]
        this.sheetData[row][col].originPointId = random
        this.originPointer[random] = [row, col]
        const sheetData = this.sheetData
        const endRow = row + rowCount
        const endCol = col + colCount
        // 修改指针指向
        for (let i = row; i < endRow; i++) {
            for (let j = col; j < endCol; j++) {
                if (i === row && j === col) {
                    if (sheetData[i][j].pointId) {
                        sheetData[i][j].pointId = null
                        delete sheetData[i][j].pointId
                    }
                } else {
                    if (sheetData[i][j].empty) {
                        sheetData[i][j] = {
                            pointId: random
                        }
                    } else {
                        sheetData[i][j].pointId = random
                    }
                    if (sheetData[i][j].merge) {
                        if (row !== i || col !== j) {
                            const originPointId = sheetData[i][j].originPointId
                            if (originPointId) {
                                this.originPointer[originPointId] = null
                                delete this.originPointer[originPointId]
                            }
                        }
                        sheetData[i][j].merge = null
                        delete sheetData[i][j].merge
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
            this.paint()
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
                const pointer = this.gePointer(i, j)
                if (pointer) {
                    // 说明超出边界了
                    if (row > pointer[0] || endRow < cell.endRow || col > pointer[1] || endCol < cell.endCol) {
                        console.error('当前单元格跨合并区域不能取消合并，请重新选择')
                        return false
                    }
                }
            }
        }
        // 修改指针指向
        for (let i = row; i <= endRow; i++) {
            for (let j = col; j <= endCol; j++) {
                this.sheetData[i][j].merge = null
                sheetData[i][j].originPointId = null
                sheetData[i][j].pointId = null
            }
        }
        this.paint()
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
        this.updateCol(col)
    }
    // 插入一行
    public addRow = (rowIndex: number) => {
        let nextIndex = rowIndex + 1
        const rowDataMap = this.rowDataMap
        let newRow = []
        const mergeHeightMap = {}
        if (rowDataMap[nextIndex]) {
            const y = rowDataMap[rowIndex].y
            const height = rowDataMap[rowIndex].height
            rowDataMap.splice(nextIndex, 0, {
                y: y + height,
                height: ROW_HEIGHT
            })
            const nextRow = this.sheetData[nextIndex]
            for (let j = 0; j < nextRow.length; j++) {
                const nextCell = nextRow[j]
                const nextPointer = this.gePointer(nextIndex, j)
                const rowPointer = this.gePointer(rowIndex, j) || []
                // 下一行的指针和上一行相同 说明横跨 需要拆解合并行
                if (nextPointer) {
                    if (nextPointer[0] === rowIndex || nextPointer[0] === rowPointer[0]) {
                        newRow.push({
                            pointId: nextCell.pointId
                        })
                        if (!mergeHeightMap[`${nextPointer.toString()}`]) {
                            mergeHeightMap[`${nextPointer.toString()}`] = true
                            this.sheetData[nextPointer[0]][nextPointer[1]].merge[0] += 1
                        }
                    }
                } else {
                    newRow.push(emptyCell)
                }
            }
            const originPointer = this.originPointer
            Object.keys(originPointer).forEach(key => {
                if (originPointer[key][0] >= nextIndex) {
                    originPointer[key][0] += 1
                }
            })
            this.rowCount += 1
            this.sheetData.splice(nextIndex, 0, newRow)
            this.updateRow(nextIndex, ROW_HEIGHT)
        } else {
            const count = this.rowCount
            const y = rowDataMap[count - 1].y
            const height = rowDataMap[count - 1].height
            rowDataMap.splice(rowDataMap.length, 0, {
                y: y + height,
                height: ROW_HEIGHT
            })
            newRow = new Array(this.colDataMap.length).fill(emptyCell)
            nextIndex = count
            this.rowCount += 1
            this.sheetData.splice(nextIndex, 0, newRow)
            this.updateRow(nextIndex - 2)
            this.options.getScroll().verticalScrollTo(this.scrollBar.getVertical().maxScrollTop)
        }
    }
    // 插入一列
    public addCol = (colIndex: number) => {
        let nextIndex = colIndex + 1
        const colDataMap = this.colDataMap
        const mergeHeightMap = {}
        if (colDataMap[nextIndex]) {
            const x = colDataMap[colIndex].x
            const width = colDataMap[colIndex].width
            colDataMap.splice(nextIndex, 0, {
                x: x + width,
                width: COL_WIDTH
            })
            for (let i = 0; i < this.sheetData.length; i++) {
                const nextCell = this.sheetData[i][nextIndex]
                const nextPointer = this.gePointer(i, nextIndex)
                const rowPointer = this.gePointer(i, nextIndex) || []
                // 下一行的指针和上一行相同 说明横跨 需要拆解合并行
                if (nextPointer) {
                    if (nextPointer[1] === colIndex || nextPointer[1] === rowPointer[1]) {
                        this.sheetData[i].splice(nextIndex, 0, {
                            pointId: nextCell.pointId
                        })
                        if (!mergeHeightMap[`${nextPointer.toString()}`]) {
                            mergeHeightMap[`${nextPointer.toString()}`] = true
                            this.sheetData[nextPointer[0]][nextPointer[1]].merge[1] += 1
                        }
                    }
                } else {
                    this.sheetData[i].splice(nextIndex, 0, emptyCell)
                }
            }
            const originPointer = this.originPointer
            Object.keys(originPointer).forEach(key => {
                if (originPointer[key][1] >= nextIndex) {
                    originPointer[key][1] += 1
                }
            })
            this.colCount += 1
            this.updateCol(nextIndex, COL_WIDTH)
        } else {
            const count = this.colCount
            const x = colDataMap[count - 1].x
            const width = colDataMap[count - 1].width
            colDataMap.splice(colDataMap.length, 0, {
                x: x + width,
                width: COL_WIDTH
            })
            nextIndex = count
            for (let i = 0; i < this.sheetData.length; i++) {
                this.sheetData[i].splice(nextIndex, 0, emptyCell)
            }
            this.colCount += 1
            this.updateCol(nextIndex - 2)
            this.options.getScroll().horizontalScrollTo(this.scrollBar.getHorizontal().maxScrollLeft)
        }
    }
    public setSelectedCell = (selectedCell) => {
        this.selectedCell = selectedCell
    }
    public setSelectedRange = (selectedRange: number[]) => {
        this.selectedRange = selectedRange
    }
    public getSelectedRange = () => {
        return this.selectedRange
    }
    private updateRowDataMapY = (startRow: number = 0, addHeight?: number) => {
        const startCell = this.rowDataMap[startRow]
        let startY = startCell.y + (addHeight || startCell.height)
        for (let i = startRow + 1; i < this.rowDataMap.length; i++) {
            this.rowDataMap[i].y = startY
            startY += this.rowDataMap[i].height
        }
    }
    private updateColDataMapX = (startCol: number = 0, addWidth?: number) => {
        const startCell = this.colDataMap[startCol]
        let startX = startCell.x + (addWidth || startCell.width)
        for (let i = startCol + 1; i < this.colDataMap.length; i++) {
            this.colDataMap[i].x = startX
            startX += this.colDataMap[i].width
        }
    }
    private updateRow = (row: number = 0, addHeight?: number) => {
        this.updateRowDataMapY(row, addHeight)
        this.calcScrollWidthHeight()
        this.options.getScroll().resetScrollBar(this.getScrollHeight(), this.getScrollWidth(), this.scrollBar.vertical, this.scrollBar.horizontal)
        this.nextTick(this.paint, 'next-updateRow')
    }
    private updateCol = (startCol: number = 0, addWidth?: number) => {
        this.updateColDataMapX(startCol, addWidth)
        this.calcScrollWidthHeight()
        this.options.getScroll().resetScrollBar(this.getScrollHeight(), this.getScrollWidth(), this.scrollBar.vertical, this.scrollBar.horizontal)
        this.nextTick(this.paint, 'next-updateCol')
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
            paint: true,
            record: true
        }
    ) => {
        let cell = this.sheetData[row][col]
        if (cell.empty) {
            this.sheetData[row][col] = {
                value: ''
            }
        }
        const oldVal = this.sheetData[row][col].value
        // 记录操作
        // 当上一次value和当前value不一样时 赋值、记录
        // 注意excel中相同value的更改也会被记录
        if (oldVal != value) {
            this.sheetData[row][col].value = this.formatterInstance.transformValue(value, cell.type)
            if (extend.record) {
                this.record.add({
                    undo: {
                        setCellValue: [{
                            row,
                            col,
                            value: oldVal,
                            extend: {
                                paint: true,
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
                                paint: true,
                                record: false
                            }
                        }],
                        setSelectedCell: { ...this.selectedCell, value },
                        setSelectedRange: [...this.selectedRange]
                    }
                })
            }
            extend.paint && this.nextTick(this.paint, 'next-setCellValue')
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
        this.clientWidth = this.originClientWidth - this.calcFrozenWidth()
        this.clientHeight = this.originClientHeight - this.calcFrozenHeight()
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
    public setPaintStartRow = (row: number) => {
        this.paintStartRow = row
    }
    public setPaintEndRow = (row: number) => {
        this.paintEndRow = row
    }
    public setPainStartCol = (col: number) => {
        this.paintStartCol = col
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
                    const painter = this.gePointer(i, j) || [i, j]
                    const mergeCellEnd = this.sheetData[painter[0]][painter[1]].merge
                    if (mergeCellEnd) {
                        let mergeStartRow = painter[0]
                        let mergeStartCol = painter[1]
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
                if (row <= selectedCellRange[0]) {
                    selectedRange[0] = row
                    selectedRange[2] = selectedCellRange[0]
                }
                if (col <= selectedCellRange[1]) {
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
        if (count > this.rowCount) {
            count = this.rowCount
        }
        if (count < 0) {
            count = 0;
        }
        this.frozenRowCount = count
        this.init()
        this.nextTick(this.paint, 'next-setFrozen')
    }
    /**
     * 设置冻结列
     */
    public setFrozenColCount = (count: number) => {
        if (count > this.colCount) {
            count = this.colCount
        }
        if (count < 0) {
            count = 0;
        }
        this.frozenColCount = count
        this.init()
        this.nextTick(this.paint, 'next-setFrozen')
    }
    public setKeyboardInfo = (info) => {
        this.keyboardInfo = Object.assign(this.keyboardInfo, info)
    }
    public moveSelectedCell = (direction: string, goOn?: false) => {
        const selectedCell = this.selectedCell;
        if (!selectedCell) return
        if (direction === 'up') {
            const row = selectedCell.range[0] - 1
            const col = this.keyboardInfo.col
            if (row < 0) return
            const cell = { ...this.getCellInfo(row, col, true) }
            this.setSelectedRange([...cell.range])
            this.setSelectedCell(cell)
            this.setKeyboardInfo({
                row: row
            })
            if (this.selectedCell.y - this.frozenInfo.row.endY - this.yOffset < this.scrollBar.getVertical().scrollTop) {
                this.options.getScroll().verticalScrollTo(this.selectedCell.y - this.selectedCell.height - this.frozenInfo.row.endY)
            } else {
                this.paint()
            }
        } else if (direction === 'down') {
            let row
            if (selectedCell.range[0] !== selectedCell.range[2]) {
                row = selectedCell.range[2] + 1
            } else {
                row = selectedCell.range[0] + 1
            }
            if (row >= this.rowDataMap.length) return

            const col = this.keyboardInfo.col
            let cell = { ...this.getCellInfo(row, col, true) }
            this.setSelectedRange([...cell.range])
            this.setSelectedCell(cell)
            this.setKeyboardInfo({
                row: row
            })
            if (this.selectedCell.y + this.selectedCell.height > this.scrollBar.getVertical().scrollTop + this.frozenInfo.row.endY + this.clientHeight) {
                this.options.getScroll().verticalScrollTo(this.selectedCell.height + this.scrollBar.getVertical().scrollTop)
            } else {
                this.paint()
            }
        } else if (direction === 'left') {
            const col = selectedCell.range[1] - 1
            const row = this.keyboardInfo.row
            if (col < 0) return
            const cell = { ...this.getCellInfo(row, col, true) }
            this.setSelectedRange([...cell.range])
            this.setSelectedCell(cell)
            this.setKeyboardInfo({
                col: col
            })
            if (this.selectedCell.x - this.frozenInfo.col.endX < this.scrollBar.getHorizontal().scrollLeft) {
                this.options.getScroll().horizontalScrollTo(this.selectedCell.x - this.frozenInfo.col.endX)
            } else {
                this.paint()
            }

        } else if (direction === 'right') {
            let col
            if (selectedCell.range[1] !== selectedCell.range[3]) {
                col = selectedCell.range[3] + 1
            } else {
                col = selectedCell.range[1] + 1
            }
            let row = this.keyboardInfo.row
            if (col >= this.colDataMap.length) {
                if (!goOn) return
                // tab键 下一行
                if (row < this.rowDataMap.length - 1) {
                    row += 1
                    col = 0
                    this.setKeyboardInfo({
                        row
                    })
                    this.options.getScroll().horizontalScrollTo(0)
                // tab键盘 最后一个单元格后跳转到第一个单元格
                } else {
                    row = 0
                    col = 0
                    this.setKeyboardInfo({
                        row,
                        col
                    })
                    this.options.getScroll().horizontalScrollTo(0)
                    this.options.getScroll().verticalScrollTo(0)
                }
            }
            let cell = { ...this.getCellInfo(row, col, true) }
            this.setSelectedRange([...cell.range])
            this.setSelectedCell(cell)
            this.setKeyboardInfo({
                col: col
            })
            if (this.selectedCell.x + this.selectedCell.width > this.scrollBar.getHorizontal().scrollLeft + this.frozenInfo.col.endX + this.clientWidth) {
                this.options.getScroll().horizontalScrollTo(this.selectedCell.width + this.scrollBar.getHorizontal().scrollLeft)
            } else {
                this.paint()
            }
        }
    }
    private initScroll = () => {
        if (this.scrollBar) {
            this.scrollBar.destroy()
        }
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
            // verticalScrollCb: this.verticalScrollCb,
            // horizontalScrollCb: this.horizontalScrollCb
        })
    }
    public verticalScrollCb = (vertical) => {
        window.requestAnimationFrame(() => {
            this.options.canvas.scale()
            this.paint()
        })
    }
    public horizontalScrollCb = (horizontal) => {
        window.requestAnimationFrame(() => {
            this.options.canvas.scale()
            this.paint()
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
        this.scrollBar && this.scrollBar.destroy()
        this.scrollBar = null
    }
}

export default Base