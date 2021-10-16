import Table from './Table'
import { SheetOptions, PointRange } from '../interface/SheetInterface'
import { setSheetDataByCount, insertTableDataToSheet, numToABC, getCellWidthHeight } from './utils/sheetUtils'
import ScrollBar from '../scrollBar/ScrollBar'
import CreateTextarea from './CreateTextarea'
import watch from '../event/watch'
import { calcStartRowIndex, calcEndRowIndex, calcStartColIndex, calcEndColIndex, getCellInFrozenByIndex } from '../utils/helper'
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
// 1. ssr官方文档系统
// 2. demo搭建
// 3. 上线

class Sheet {
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
        this.frozenRowCount = this.options.frozenRowCount
        this.frozenColCount = this.options.frozenColCount
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
    pointRange: PointRange = {
        startRowIndex: 0,
        endRowIndex: 0,
        startColIndex: 0,
        endColIndex: 0
    }
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
        // this.mergeCells[`${row}${col}`] = [rowCount, colCount]
        const sheetData = this.sheetData
        const endRow = row + rowCount
        const endCol = col + colCount
        // 先判断当前区域是否可以移除合并，有些边界情况需要处理
        for (let i = row; i < endRow; i++) {
            for (let j = col; j < endCol; j++) {
                const cell = this.getCellInfo(i, j, true)
                if (cell.pointer) {
                    // 说明超出边界了
                    if (cell.pointer[0] < row || cell.pointer[0] > endRow || cell.pointer[1] < col ||  cell.pointer[1] > endCol) {
                        console.error('当前单元格区域不能取消合并，请重新选择')
                        return false
                    }
                }
            }
        }
        // 修改指针指向
        for (let i = row; i < endRow; i++) {
            for (let j = col; j < endCol; j++) {
                this.mergeCells[`${i}${j}`] = null
                sheetData[i][j].pointer = null
            }
        }
        // this.selectedRange = []
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
            this.point()
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
    private calcFrozenHeight = (yOffsetFlag: boolean = true) => {
        if (this.frozenRowCount > 0) {
            const rowDataMap = this.rowDataMap
            const last = rowDataMap[this.frozenRowCount - 1]
            return last.y + last.height - (yOffsetFlag ? this.yOffset : 0)
        }
        return 0
    }
    // 计算冻结列宽
    // xOffsetFlag 是否需要计算序列号的宽度
    private calcFrozenWidth = (xOffsetFlag: boolean = true) => {
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
    /**
     * 绘制冻结行
     */
    private pointFrozenRow = (startColIndex, endColIndex) => {
        const isFrozenRowCount = this.frozenRowCount > 0
        if (!isFrozenRowCount) return
        const canvasContext = this.options.canvasContext
        // 记住冻结行到达的最大Y坐标，选中区域时用来判断当前鼠标的坐标是否在冻结区域
        let maxY = 0;
        canvasContext.beginPath()
        // 绘制冻结行头
        for (let i = 0; i < this.frozenRowCount; i++) {
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = this.getCellInfo(i, j, true)
                // 当前单元格已经被绘制过就跳出
                if (!cell || cell.pointer) continue
                cell.backgroundColor = cell.backgroundColor || '#E1FFFF'
                this.pointCell(cell, undefined, cell.y, i, j)
                // 冻结的最后一行，更新maxY
                if (i === this.frozenRowCount - 1) {
                    if (cell.y + cell.height > maxY) {
                        maxY = cell.y + cell.height
                    }
                }
            }
        }
        this.frozenInfo.row.endY = maxY
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointFrozenCol = (startRowIndex, endRowIndex) => {
        const isFrozenColCount = this.frozenColCount > 0
        if (!isFrozenColCount) return
        const horizontal = this.scrollBar.getHorizontal()
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        // 记住冻结列到达的最大X坐标，选中区域时用来判断当前鼠标的坐标是否在冻结区域
        let maxX = 0;
        canvasContext.beginPath()
        // 绘制冻结行头
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            for (let j = 0; j < this.frozenColCount; j++) {
                let cell = this.getCellInfo(i, j, true)
                // 当前单元格已经被绘制过就跳出
                if (!cell || cell.pointer) continue
                let x = cell.x
                let y = cell.y - vertical.scrollTop
                if (!isFrozenColCount) {
                    x -= horizontal.scrollLeft
                }
                cell.backgroundColor = cell.backgroundColor || '#E1FFFF'
                this.pointCell(cell, cell.x, y, i, j)
                // 冻结的最后一行，更新maxY
                if (j === this.frozenColCount - 1) {
                    if (cell.x + cell.width > maxX) {
                        maxX = cell.x + cell.width
                    }
                }
            }
        }
        this.frozenInfo.col.endX = maxX
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointBody = (
        startRowIndex: number,
        endRowIndex: number,
        startColIndex: number,
        endColIndex: number
    ) => {
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        // 绘制table部分
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            for (let j = startColIndex; j <= endColIndex; j++) {
                let cell = this.getCellInfo(i, j, true)
                if (!cell || cell.pointer) continue
                this.pointCell(cell, undefined, undefined, i, j)
            }
        }
        canvasContext.strokeStyle = "#ccc"
        canvasContext.closePath()
        canvasContext.stroke()
    }
    private pointLeftOrder = (startRowIndex: number, endRowIndex: number, frozenRow?: boolean) => {
        const hasOrder = this.options.order
        if (!hasOrder) return
        const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let i = startRowIndex; i <= endRowIndex; i++) {
            const cell = this.getCellInfo(i, 0)
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
        const headerOrder = this.options.headerOrder
        if (!headerOrder) return
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let j = startColIndex; j <= endColIndex; j++) {
            const cell = this.getCellInfo(0, j)
            let x = frozen ? cell.x : cell.x - scrollLeft
            this.pointCell({
                color: '#000',
                value: numToABC(j),
                width: cell.width,
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
     * @param
     */
    private pointLeftTopByFrozenOnBody = () => {
        const frozenRowCount = this.frozenRowCount
        const frozenColCount = this.frozenColCount
        if (!frozenRowCount || !frozenColCount) {
            return
        }
        const canvasContext = this.options.canvasContext
        canvasContext.beginPath()
        for (let i = 0; i < frozenRowCount; i++) {
            for (let j = 0; j < frozenColCount; j++) {
                const cell = this.getCellInfo(i, j, true)
                cell.backgroundColor = '#E1FFFF'
                this.pointCell(cell, cell.x, cell.y)
            }
        }
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
        const scrollLeft = this.scrollBar.getHorizontal().scrollLeft
        const scrollTop = this.scrollBar.getVertical().scrollTop
        const frozenColX = this.calcFrozenWidth(false)
        const frozenRowY = this.calcFrozenHeight(false)
        if (this.selectedRange.length) {
            const selected: any = {
                x: null,
                y: null,
                width: 0,
                height: 0,
                fristCell: null
            }
            let isFrozenCol = false
            let isFrozenRow = false
            for (let i = this.selectedRange[0]; i <= this.selectedRange[2]; i++) {
                let colNum = this.selectedRange[1]
                const cell = this.getCellInfo(i, colNum)
                if (!isFrozenCol) {
                    isFrozenCol = getCellInFrozenByIndex(i, colNum, this) === 'col'
                }
                if (!isFrozenRow) {
                    isFrozenRow = getCellInFrozenByIndex(i, colNum, this) === 'row'
                }
                if (cell && !cell.pointer) {
                    selected.height += cell.height
                    if (selected.x === null) {
                        // 如果选中的是冻结区域不需要减去scrollLeft
                        selected.x = cell.x - (isFrozenCol ? 0 : scrollLeft)
                    }
                    if (selected.y === null) {
                        selected.y = cell.y - (isFrozenRow ? 0 : scrollTop)
                    }
                }
            }
            // 选中区域跨冻结和body，需要减去scrollTop，避免滚动时选中区域高度错误
            if (isFrozenRow) {
                selected.height -= scrollTop
                if (selected.height <= this.selectedCell.height) {
                    selected.height = this.selectedCell.height
                }
                // 选中区域超出上侧冻结区域需要隐藏 做截取操作
            } else if (selected.y < frozenRowY) {
                selected.top = false
                let cellBottomY = selected.y + selected.height
                if (selected.y - scrollTop < frozenRowY && cellBottomY >= frozenRowY) {
                    let topMore = frozenRowY - selected.y
                    let newY = selected.y + topMore
                    selected.y = newY
                    selected.height -= topMore
                } else if (cellBottomY < frozenRowY) {
                    selected.bottom = false
                }
            }

            for (let j = this.selectedRange[1]; j <= this.selectedRange[3]; j++) {
                let rowNum = this.selectedRange[0]
                const cell = this.getCellInfo(rowNum, j)
                if (cell && !cell.pointer) {
                    selected.width += cell.width
                }
            }
            // 选中区域跨冻结和body，需要减去scrollLeft，避免滚动时选中区域宽度错误
            if (isFrozenCol) {
                selected.width -= scrollLeft
                if (selected.width <= this.selectedCell.width) {
                    selected.width = this.selectedCell.width
                }
                // 选中区域超出左侧冻结区域需要隐藏 做截取操作
            } else if (selected.x < frozenColX) {
                selected.left = false
                let cellRightX = selected.x + selected.width
                if (selected.x - scrollLeft < frozenColX && cellRightX >= frozenColX) {
                    let leftMore = frozenColX - selected.x
                    let newX = selected.x + leftMore
                    selected.x = newX
                    selected.width -= leftMore
                } else if (cellRightX < frozenColX) {
                    selected.right = false
                }
            }
            const canvasContext = this.options.canvasContext

            for (let i = this.selectedRange[0]; i <= this.selectedRange[2]; i++) {
                for (let j = this.selectedRange[1]; j <= this.selectedRange[3]; j++) {
                    if (i != this.selectedCell.range[0] || j != this.selectedCell.range[1]) {
                        const cell = this.getCellInfo(i, j)
                        if (!cell.pointer) {
                            let sl = scrollLeft
                            let st = scrollTop
                            let wid = cell.width
                            let hei = cell.height
                            let x = cell.x
                            let y = cell.y
                            if (getCellInFrozenByIndex(i, j, this) === 'row') {
                                st = 0;
                            } else {
                                y -= st
                                let cellBottomY = cell.y + cell.height
                                // 往上滚动，当前选中的单元格超过冻结区域时不需要绘制
                                if (cell.y + hei - st <= frozenRowY) {
                                    continue;
                                    // 往上滚动，卡在冻结区域和body各一半时需要重新计算选中的单元格高度和当前单元格y坐标
                                } else if (cell.y - st < frozenRowY && cellBottomY - st > frozenRowY) {
                                    y = frozenRowY
                                    hei = cellBottomY - st - frozenRowY
                                }
                            }
                            if (getCellInFrozenByIndex(i, j, this) === 'col') {
                                sl = 0
                            } else {
                                x -= sl
                                let cellRightX = cell.x + cell.width
                                // 往左滚动，当前选中的单元格超过冻结区域时不需要绘制
                                if (cell.x + wid - sl <= frozenColX) {
                                    continue;
                                    // 往左滚动，卡在冻结区域和body各一半时需要重新计算选中的单元格宽度和当前单元格x坐标
                                } else if (cell.x - sl < frozenColX && cellRightX - sl > frozenColX) {
                                    x = frozenColX
                                    wid = cellRightX - sl - frozenColX
                                }
                            }
                            this.paintCellBgColor(
                                x,
                                y,
                                wid,
                                hei,
                                null,
                                'rgba(0, 0, 0, 0.2)'
                            )
                        }
                    }
                }
            }
            // 滚动超出左侧 或者 上方时选中区域不需要绘制
            if (selected.right === false || selected.bottom === false) {
                return
            }
            // 绘制线段
            canvasContext.beginPath()
            canvasContext.lineWidth = 2
            canvasContext.strokeStyle = '#227346'

            // 选中区域边框超出上方冻结区域时 不需要绘制
            if (selected.top !== false) {
                canvasContext.moveTo(selected.x - 1, selected.y)
                canvasContext.lineTo(selected.x + selected.width + 2, selected.y)
            }

            canvasContext.moveTo(selected.x - 1, selected.y + selected.height + 1)
            canvasContext.lineTo(selected.x + selected.width - 3, selected.y + selected.height + 1)

            if (selected.left !== false) {
                canvasContext.moveTo(selected.x, selected.y)
                canvasContext.lineTo(selected.x, selected.y + selected.height)
            }

            canvasContext.moveTo(selected.x + selected.width + 1, selected.y)
            canvasContext.lineTo(selected.x + selected.width + 1, selected.y + selected.height - 3)

            canvasContext.stroke()

            canvasContext.fillStyle = '#227346'
            canvasContext.fillRect(selected.x + selected.width - 2, selected.y + selected.height - 2, 5, 5)

            canvasContext.closePath()

            canvasContext.lineWidth = 1

        }
    }
    /**
     * 绘制整个sheet画布
     */
    public point = () => {
        const sheetData = this.sheetData
        // const horizontal = this.scrollBar.getHorizontal()
        // const vertical = this.scrollBar.getVertical()
        const canvasContext = this.options.canvasContext
        canvasContext.lineWidth = 1
        let startRowIndex = calcStartRowIndex(this)
        let endRowIndex = calcEndRowIndex(startRowIndex, this.clientHeight, sheetData, this.rowDataMap)
        let startColIndex = calcStartColIndex(this)
        let endColIndex = calcEndColIndex(startColIndex, this.clientWidth, sheetData, this.colDataMap)
        canvasContext.font = `${this.font}px Arial`
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
        this.pointBody(startRowIndex, endRowIndex, startColIndex, endColIndex)
        canvasContext.lineWidth = 1
        // 冻结列头
        this.pointFrozenCol(startRowIndex, endRowIndex)

        // 冻结行头
        this.pointFrozenRow(startColIndex - this.frozenColCount, endColIndex)

        // 头部列标
        this.pointTopOrder(startColIndex, endColIndex)

        // 冻结头部列标
        this.pointTopOrder(0, this.frozenColCount - 1, true)

        // 绘制左侧序号 放在后面 可以覆盖前面的
        this.pointLeftOrder(startRowIndex, endRowIndex)

        // 冻结序号
        this.pointLeftOrder(0, this.frozenRowCount - 1, true)

        // 如果有冻结行列，绘制body区域左上角冻结区域
        this.pointLeftTopByFrozenOnBody()

        // 如果有行列标，绘制左上角空白区域
        this.pointLeftTopByFrozen()

        // 绘制冻结区域选中效果
        this.pointSelectedRange()

        if (this.textareaInstance.isShow) {
            this.textareaInstance.updatePosition();
        }
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
    private pointCell = (cell: any, x: number, y: number, row?: number, col?: number) => {
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

export default Sheet