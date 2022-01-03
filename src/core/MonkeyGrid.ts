import { layout, createDragColLine, createDragRowLine, updateLine } from './layout'
import * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import { sheetParams } from '../interface/SheetInterface'
import CreateScroll from '../scrollbar/CreateScroll'
import Sheet from './Sheet'
import Tabs from './Tabs'
import Canvas from './Canvas'
import { mouseDown, mouseMove, mouseUp, removeMouseDown, removeMouseMove, removeMouseUp } from '../event/mouseEvent'
import { getPixelRatio, getObjectAttrDefault, findCellByXY, inFrozenRowByXY, inFrozenColByXY, throllte } from '../utils/helper'
import { getColNumByPageX, getRowNumByPageY, findTopOrderCellByXY, findLeftOrderCellByXY, getCellWidthHeight, getDefaultSheetName } from '../utils/sheetUtils'
import watch from '../event/watch'
import keyBoardInit from '../event/keyBoard'
import { FOOTER_HEIGHT } from './const'
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
        this.canvasInstance = new Canvas({
            container: this.layout.container,
            width: this.width - 2,
            height: this.height - FOOTER_HEIGHT - 2
        })
        this.init()
        this.createSheetTabs()
        watch(this, 'selectedSheetIndex', () => {
            keyBoardInit(this.getSheet())
        })
        this.canvasRect = this.canvasInstance.getCanvasRect();

        this.tabsInterface = new Tabs({
            contariner: this.layout.tabBox,
            tabs: this.sheets.map((sheet, index) => ({
                name: sheet.name,
                id: index
            })),
            onClickAddTab: ()  => {
                this.addSheet({
                    rowCount: 100,
                    colCount: 20
                })
            },
            onClickTab: (index) => {
                this.onClickTab(index)
            },
            onClickArrowLeft: (e) => {

            },
            onClickArrowRight: (e) => {

            }
        })
    }
    options: OptionsInterface
    optContainer: HTMLElement
    width: number
    height: number
    sheets: any[] = []
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
    scroll: any = null
    tabsInterface: Tabs
    canvasInstance: Canvas
    public addSheet = (params: sheetParams) => {
        const name = params.name || getDefaultSheetName(this.sheets)
        const sheet = new Sheet({
            name,
            rowCount: params.rowCount,
            colCount: params.colCount,
            layout: this.layout,
            canvas: this.canvasInstance,
            height: this.height,
            width: this.width,
            order: getObjectAttrDefault(this.options, 'order', true),
            headerOrder: getObjectAttrDefault(this.options, 'headerOrder', true),
            ratio: this.ratio,
            frozenRowCount: params.frozenRowCount,
            frozenColCount: params.frozenColCount,
            active: true,
            getScroll: () => {
                return this.scroll
            }
        })
        if (!this.scroll) {
            this.scroll = new CreateScroll({
                verticalEle: this.layout.container,
                horizontalEle: this.layout.footerScrollBox,
                vertical: sheet.scrollBar.vertical,
                horizontal: sheet.scrollBar.horizontal,
                eventBindEle: this.layout.container,
                verticalScrollCb: (vertical) => {
                    this.sheets[this.selectedSheetIndex].scrollBar.vertical = vertical
                    this.sheets[this.selectedSheetIndex].verticalScrollCb()
                },
                horizontalScrollCb: (horizontal) => {
                    this.sheets[this.selectedSheetIndex].scrollBar.horizontal = horizontal
                    this.sheets[this.selectedSheetIndex].horizontalScrollCb()
                }
            })
        }
        let preSlectedSheetIndex = this.selectedSheetIndex;
        this.sheets.push(sheet)
        this.selectedSheetIndex = this.sheets.length - 1
        if (preSlectedSheetIndex >= 0) {
            this.sheets[preSlectedSheetIndex].active = false;
            this.scroll.resetScrollBar(sheet.getScrollHeight(), sheet.getScrollWidth(), sheet.scrollBar.vertical, sheet.scrollBar.horizontal)
        } else {
            sheet.paint()
        } 
        this.tabsInterface.addTab({
            name,
            id: Math.random()
        })
        return sheet
    }
    public getSheet = () => {
        return this.sheets[this.selectedSheetIndex]
    }
    public removeSheet = (name: string) => {
        const index = this.sheets.find(item => item.sheetName === name)
        const sheet: any = this.sheets.splice(index, 1)
        if (sheet) {
            sheet.destroy()
        }
    }
    public setSelectSheet = () => {

    }
    public onChangeSheet = () => {

    }
    private init = () => {
        this.canvasInstance.on('mousedown', this.onMouseDown)
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
            this.canvasRect = this.canvasInstance.getCanvasRect()
            const now = new Date().getTime()
            const sheet = this.sheets[this.selectedSheetIndex]
            sheet.isDbClick = false
            this.mouseDownFlag = true
            if (now - this.mouseDownTime < 200) {
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
                sheet.setKeyboardInfo({
                    row: cell.range[0],
                    col: cell.range[1]
                })
            }
            sheet.paint()
        }, 20)
    }
    private onMouseUp = (event: MouseEvent) => {
        setTimeout(() => {
            this.mouseDownFlag = false
            const sheet = this.sheets[this.selectedSheetIndex]
            this.scroll.stopAutoScrollIngTopLeft()
            this.scroll.stopAutoScrollIngTop()
            this.scroll.stopAutoScrollIngLeft()
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
        }, 20)
    }
    private onDocumentMove = () => {
        return throllte((event: MouseEvent) => {
            const { offsetX, offsetY }: any = event
            // const offsetX = pageX - this.canvasRect.left
            // const offsetY = pageY - this.canvasRect.top
            const sheet = this.sheets[this.selectedSheetIndex]
            if (!sheet) return
            if (this.mouseDownFlag) {
                const cell = findCellByXY(offsetX, offsetY, sheet)
                if (cell) {
                    sheet.calcCellSelectedRange(cell)
                    sheet.paint()
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
        const { pageX, pageY, offsetX, offsetY }: any = event
        // const offsetX = pageX - this.canvasRect.left
        // const offsetY = pageY - this.canvasRect.top
        const sheet = this.sheets[this.selectedSheetIndex]
        sheet.paintRange.boundEndCol = getColNumByPageX(offsetX, sheet)
        sheet.paintRange.boundEndRow = getRowNumByPageY(offsetY, sheet)
        const upBound = pageY < this.canvasRect.top
        const downBound = pageY > this.canvasRect.bottom
        const leftBound = pageX < this.canvasRect.left
        const rightBound = pageX > this.canvasRect.right

        if (downBound && rightBound) {
            this.scroll.autoScrollIngTopLeft({
                leftSpeed: 24,
                topSpeed: 24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.endRowIndex, sheet.paintRange.endColIndex]
                })
            })
            return
        }
        if (upBound && rightBound) {
            this.scroll.autoScrollIngTopLeft({
                leftSpeed: 24,
                topSpeed: -24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.startRowIndex, sheet.paintRange.endColIndex]
                })
            })
            return
        }
        if (downBound && leftBound) {
            this.scroll.autoScrollIngTopLeft({
                leftSpeed: -24,
                topSpeed: 24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.endRowIndex, sheet.paintRange.startColIndex]
                })
            })
            return
        }
        if (upBound && leftBound) {
            this.scroll.autoScrollIngTopLeft({
                leftSpeed: -24,
                topSpeed: -24,
                time: 100
            }, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.startRowIndex, sheet.paintRange.startColIndex]
                })
            })
            return
        }
        this.scroll.stopAutoScrollIngTopLeft()
        // 向下超出
        if (downBound) {
            this.scroll.autoScrollIngTop(24, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.endRowIndex, sheet.paintRange.boundEndCol]
                })
            })
        // 向上超出
        } else if (upBound) {
            this.scroll.autoScrollIngTop(-24, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.startRowIndex, sheet.paintRange.boundEndCol]
                })
            })
        } else {
            this.scroll.stopAutoScrollIngTop()
        }

        // 向右超出
        if (rightBound) {
            this.scroll.autoScrollIngLeft(80, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.boundEndRow, sheet.paintRange.endColIndex]
                })
            })
        // 向左超出
        } else if (leftBound) {
            this.scroll.autoScrollIngLeft(-80, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.paintRange.boundEndRow, sheet.paintRange.startColIndex]
                })
            })
        } else {
            this.scroll.stopAutoScrollIngLeft()
        }
    }
    // 创建底部SheetDom
    private createSheetTabs = () => {
        const tabBox = domCore.createDom('div', {
            class: 'mg-footer-tab',
        })
        const footerScrollBox = domCore.createDom('div', {
            class: 'mg-footer-scroll',
        })
        this.layout.footerBox.appendChild(tabBox)
        this.layout.footerBox.appendChild(footerScrollBox)
        this.layout.tabBox = tabBox
        this.layout.footerScrollBox = footerScrollBox
    }
    private onClickTab = (index) => {
        let preSlectedSheetIndex = this.selectedSheetIndex;
        this.selectedSheetIndex = index
        const sheet = this.sheets[index]
        sheet.active = true;
        if (preSlectedSheetIndex >= 0) {
            this.sheets[preSlectedSheetIndex].active = false;
            this.scroll.resetScrollBar(sheet.getScrollHeight(), sheet.getScrollWidth(), sheet.scrollBar.vertical, sheet.scrollBar.horizontal)
        } else {
            sheet.paint()
        } 
    }
    public destroy = () => {
        // removeMouseDown(this.layout.canvas, this.onMouseDown)
        this.canvasInstance.off('mousedown')
        removeMouseMove(document.body, this.documentMoveFn)
        removeMouseUp(document.body, this.onMouseUp)
        this.sheets.forEach(s => s.destroy())
        this.sheets = null
        this.options = null
        this.layout = null
    }
}

export default MonkeyGrid;