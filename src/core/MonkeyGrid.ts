import { layout, createDragColLine, createDragRowLine, updateLine } from './layout'
import * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import { sheetParams } from '../interface/SheetInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { mouseDown, mouseMove, mouseUp, removeMouseDown, removeMouseMove, removeMouseUp } from '../event/mouseEvent'
import { getPixelRatio, getObjectAttrDefault, findCellByXY, inFrozenRowByXY, inFrozenColByXY, throllte } from '../utils/helper'
import { getColNumByPageX, getRowNumByPageY, findTopOrderCellByXY, findLeftOrderCellByXY, getCellWidthHeight } from '../utils/sheetUtils'
import watch from '../event/watch'
import keyBoardInit from '../event/keyBoard'
import '../style/app.less'

/**
 * @desc options参数描述
 * order 是否有序号 true | false
 */
class MonkeyGrid {
    constructor(options: OptionsInterface) {
        this.options = options
        this.optContainer = options.container
        this.width = options.width || options.container.offsetWidth
        this.height = options.height || options.container.offsetHeight
        this.layout = layout(this.optContainer, this.width, this.height)
        this.init()
        this.createSheetTabs()
        watch(this, 'selectedSheetIndex', () => {
            keyBoardInit(this.getSheet())
        })
        this.canvasRect = this.layout.canvas.getBoundingClientRect();
    }
    options: OptionsInterface
    optContainer: HTMLElement
    width: number
    height: number
    sheets: any[] = []
    // canvas: HTMLCanvasElement
    canvasContext: any
    scrollBar: ScrollBar = null
    layout: any
    hooks: Object = {}
    ratio: number = 1
    selectedSheetIndex: number = -1
    mouseDownFlag: boolean = false
    mouseDownTime: number = 0
    moveFn: Function
    documentMoveFn: Function
    canvasRect: any
    // 记录鼠标坐标信息
    mouseEvent: any = {
        preMovePageX: 0,
        preMovePageY: 0
    }
    orderInfo: any = {
        inTopOrder: false,
        inLeftOrder: false,
        dragLine: false
    }
    public addSheet = (params: sheetParams) => {
        const sheet = new Sheet({
            name: params.name,
            rowCount: params.rowCount,
            colCount: params.colCount,
            layout: this.layout,
            canvas: this.layout.canvas,
            canvasContext: this.canvasContext,
            height: this.height,
            width: this.width,
            order: getObjectAttrDefault(this.options, 'order', true),
            headerOrder: getObjectAttrDefault(this.options, 'headerOrder', true),
            ratio: this.ratio,
            frozenRowCount: params.frozenRowCount,
            frozenColCount: params.frozenColCount
        })
        this.sheets.push(sheet)
        this.selectedSheetIndex = this.sheets.length - 1
        return sheet
    }
    public getSheet = () => {
        return this.sheets[this.selectedSheetIndex]
    }
    public removeSheet = (name: string) => {
        const index = this.sheets.find(item => item.sheetName === name)
        const sheet: any = this.sheets.splice(index, 1)
        if (sheet) {
            sheet.destroy();
        }
    }
    public setSelectSheet = () => {

    }
    public onChangeSheet = () => {

    }
    private init = () => {
        const canvasContext = this.layout.canvas.getContext('2d')
        this.ratio = getPixelRatio(canvasContext)
        const oldWidth = this.layout.canvas.width
        const oldHeight = this.layout.canvas.height
        this.layout.canvas.width = Math.round(oldWidth * this.ratio)
        this.layout.canvas.height = Math.round(oldHeight * this.ratio)
        this.layout.canvas.style.width = oldWidth + 'px'
        this.layout.canvas.style.height = oldHeight + 'px'
        canvasContext.scale(this.ratio, this.ratio)
        // canvasContext.translate(ratio, ratio)
        this.canvasContext = canvasContext

        // this.moveFn = this.onMouseMove()
        mouseDown(this.layout.canvas, this.onMouseDown)
        // mouseMove(this.layout.canvas, this.moveFn)
        mouseUp(document.body, this.onMouseUp)

        this.documentMoveFn = this.onDocumentMove()
        mouseMove(document.body, this.documentMoveFn)

    }
    private onMouseDown = (event: MouseEvent) => {
        setTimeout(() => {
            this.mouseEvent.mouseDownEvent = {
                pageX: event.pageX,
                pageY: event.pageY,
            }
            if (this.orderInfo.inTopOrder >= 0) {
                if (!this.orderInfo.topOrderEle) {
                    this.orderInfo.topOrderEle = createDragColLine(this.layout.container)
                }
                this.orderInfo.orderTopDown = true
                this.orderInfo.orderCol = this.orderInfo.inTopOrder
                return
            }
            if (this.orderInfo.inLeftOrder >= 0) {
                if (!this.orderInfo.leftOrderEle) {
                    this.orderInfo.leftOrderEle = createDragRowLine(this.layout.container)
                }
                this.orderInfo.orderLeftDown = true
                this.orderInfo.orderRow = this.orderInfo.inLeftOrder
                return
            }
            // createDragRowLine
            this.canvasRect = this.layout.canvas.getBoundingClientRect();
            const now = new Date().getTime()
            const sheet = this.sheets[this.selectedSheetIndex]
            sheet.isDbClick = false
            this.mouseDownFlag = true
            if (now - this.mouseDownTime < 300) {
                sheet.isDbClick = true
                this.mouseDownFlag = false
            }
            this.mouseDownTime = now
            const { offsetX, offsetY }: any = event
            // const { sheetData, frozenRowCount, frozenColCount } = sheet
            // const inFrozenRow = inFrozenRowByXY(offsetY, frozenRowCount, sheetData, sheet.getCellInfo)
            // const inFrozenCol = inFrozenColByXY(offsetX, frozenColCount, sheetData, sheet.getCellInfo)
            // sheet.selectedRangeInFrozenRow = inFrozenRow
            // sheet.selectedRangeInFrozenCol = inFrozenCol
            const cell = findCellByXY(offsetX, offsetY, sheet)
            if (cell) {
                // const mergeCell = sheet.mergeCells[`${cell.range[0]}${cell.range[1]}`]
                // if (mergeCell) {
                //     cell.range[2] = cell.range[0] + mergeCell[0] - 1
                //     cell.range[3] = cell.range[1] + mergeCell[1] - 1
                // }
                // 避免同一个引用，否则后面修改 sheet.selectedRange 会影响初始的sheet.selectedCell.range
                sheet.setSelectedRange([...cell.range])
                sheet.setSelectedCell(cell)
            }
            sheet.point()
        }, 0)
    }
    private onMouseUp = (event: MouseEvent) => {
        setTimeout(() => {
            this.mouseDownFlag = false
            const sheet = this.sheets[this.selectedSheetIndex]
            sheet.scrollBar.stopAutoScrollIngTopLeft()
            sheet.scrollBar.stopAutoScrollIngTop()
            sheet.scrollBar.stopAutoScrollIngLeft()

            if (this.orderInfo.orderTopDown) {
                updateLine(this.orderInfo.topOrderEle, {
                    left: '-1000px',
                    display: 'none'
                })
                let col = this.orderInfo.orderCol
                let moveX = event.pageX - this.mouseEvent.mouseDownEvent.pageX
                let width = getCellWidthHeight(0, col, sheet).width + moveX
                if (width < 6) {
                    width = 6
                }
                sheet.setColWidth(col, width)
                this.orderInfo.orderTopDown = false
            }

            if (this.orderInfo.orderLeftDown) {
                updateLine(this.orderInfo.leftOrderEle, {
                    display: 'none',
                    top: '-1000px'
                })
                let row = this.orderInfo.orderRow
                let moveY = event.pageY - this.mouseEvent.mouseDownEvent.pageY
                let height = getCellWidthHeight(row, 0, sheet).height + moveY
                if (height < 6) {
                    height = 6
                }
                sheet.setRowHeight(row, height)
                this.orderInfo.orderLeftDown = false
            }
            sheet.addRow(7)
            // sheet.setMergeCellsByRange()
            // setTimeout(() => {
            //     sheet.removeMergeCellsByRange()
            // }, 2000)
        }, 40)
    }
    private onDocumentMove = () => {

        return throllte((event: MouseEvent) => {
            const { pageX, pageY }: any = event
            const offsetX = pageX - this.canvasRect.left
            const offsetY = pageY - this.canvasRect.top
            const sheet = this.sheets[this.selectedSheetIndex]

            if (this.mouseDownFlag) {
                const cell = findCellByXY(offsetX, offsetY, sheet)
                if (cell) {
                    sheet.calcCellSelectedRange(cell)
                    sheet.point()
                }
                this.calcMoveBound(event)
            }
            const inTopOrder = findTopOrderCellByXY(offsetX, offsetY, sheet)
            if (inTopOrder >= 0) {
                this.layout.container.style.cursor = 'col-resize'
            }
            this.orderInfo.inTopOrder = inTopOrder

            const inLeftOrder = findLeftOrderCellByXY(offsetX, offsetY, sheet)
            if (inLeftOrder >= 0) {
                this.layout.container.style.cursor = 'row-resize'
            }
            this.orderInfo.inLeftOrder = inLeftOrder

            if (this.orderInfo.orderTopDown) {
                updateLine(this.orderInfo.topOrderEle, {
                    display: 'block',
                    height: `${sheet.clientHeight + sheet.calcFrozenHeight()}px`,
                    top: `${sheet.yOffset}px`,
                    left: `${offsetX}px`
                })
            }

            if (this.orderInfo.orderLeftDown) {
                updateLine(this.orderInfo.leftOrderEle, {
                    display: 'block',
                    width: `${sheet.clientWidth + sheet.calcFrozenWidth()}px`,
                    top: `${offsetY}px`,
                    left: `${sheet.xOffset}px`
                })
            }


            if (inTopOrder === -1 && inLeftOrder === -1 && !this.orderInfo.orderTopDown){
                this.layout.container.style.cursor = 'default'
            }
        }, 80)
    }
    private calcMoveBound = (event: MouseEvent) => {
        const { pageX, pageY } = event
        const sheet = this.sheets[this.selectedSheetIndex]
        const offsetX = pageX - this.canvasRect.left
        const offsetY = pageY - this.canvasRect.top
        sheet.pointRange.boundEndCol = getColNumByPageX(offsetX, sheet)
        sheet.pointRange.boundEndRow = getRowNumByPageY(offsetY, sheet)
        const upBound = pageY < this.canvasRect.top
        const downBound = pageY > this.canvasRect.bottom
        const leftBound = pageX < this.canvasRect.left
        const rightBound = pageX > this.canvasRect.right

        if (downBound && rightBound) {
            sheet.scrollBar.autoScrollIngTopLeft({
                leftSpeed: 24,
                topSpeed: 24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.endRowIndex, sheet.pointRange.endColIndex]
                })
            })
            return
        }
        if (upBound && rightBound) {
            sheet.scrollBar.autoScrollIngTopLeft({
                leftSpeed: 24,
                topSpeed: -24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.startRowIndex, sheet.pointRange.endColIndex]
                })
            })
            return
        }
        if (downBound && leftBound) {
            sheet.scrollBar.autoScrollIngTopLeft({
                leftSpeed: -24,
                topSpeed: 24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.endRowIndex, sheet.pointRange.startColIndex]
                })
            })
            return
        }
        if (upBound && leftBound) {
            sheet.scrollBar.autoScrollIngTopLeft({
                leftSpeed: -24,
                topSpeed: -24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.startRowIndex, sheet.pointRange.startColIndex]
                })
            })
            return
        }
        sheet.scrollBar.stopAutoScrollIngTopLeft()
        // 向下超出
        if (downBound) {
            sheet.scrollBar.autoScrollIngTop(24, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.endRowIndex, sheet.pointRange.boundEndCol]
                })
            })
        // 向上超出
        } else if (upBound) {
            sheet.scrollBar.autoScrollIngTop(-24, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.startRowIndex, sheet.pointRange.boundEndCol]
                })
            })
        } else {
            sheet.scrollBar.stopAutoScrollIngTop()
        }

        // 向右超出
        if (rightBound) {
            sheet.scrollBar.autoScrollIngLeft(80, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.boundEndRow, sheet.pointRange.endColIndex]
                })
            })
        // 向左超出
        } else if (leftBound) {
            sheet.scrollBar.autoScrollIngLeft(-80, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.boundEndRow, sheet.pointRange.startColIndex]
                })
            })
        } else {
            sheet.scrollBar.stopAutoScrollIngLeft()
        }
    }
    // 创建底部SheetTab
    private createSheetTabs = () => {
        const tabBox = domCore.createDom('div', {
            class: 'mg-footer-tab',
        })
        tabBox.innerHTML = "sheet1"
        const footerScrollBox = domCore.createDom('div', {
            class: 'mg-footer-scroll',
        })
        this.layout.footerBox.appendChild(tabBox)
        this.layout.footerBox.appendChild(footerScrollBox)
        this.layout.tabBox = tabBox
        this.layout.footerScrollBox = footerScrollBox
    }
    public destroy = () => {
        removeMouseDown(this.layout.canvas, this.onMouseDown)
        removeMouseMove(document.body, this.documentMoveFn)
        removeMouseUp(document.body, this.onMouseUp)
        this.sheets.forEach(s => s.destroy())
        this.sheets = null
        this.options = null
        this.layout = null
    }
}

export default MonkeyGrid;