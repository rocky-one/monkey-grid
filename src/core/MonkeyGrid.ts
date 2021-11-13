import { layout, createDragColLine, createDragRowLine, updateLine } from './layout'
import * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import { sheetParams } from '../interface/SheetInterface'
import CreateScroll from '../scrollbar/CreateScroll'
import Sheet from './Sheet'
import { mouseDown, mouseMove, mouseUp, removeMouseDown, removeMouseMove, removeMouseUp } from '../event/mouseEvent'
import { getPixelRatio, getObjectAttrDefault, findCellByXY, inFrozenRowByXY, inFrozenColByXY, throllte } from '../utils/helper'
import { getColNumByPageX, getRowNumByPageY, findTopOrderCellByXY, findLeftOrderCellByXY, getCellWidthHeight, getDefaultSheetName } from '../utils/sheetUtils'
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
    public addSheet = (params: sheetParams) => {
        const sheet = new Sheet({
            name: params.name || getDefaultSheetName(this.sheets),
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
            sheet.point()
        } 
        this.updateTabs()
        return sheet
    }
    public getSheet = () => {
        return this.sheets[this.selectedSheetIndex]
    }
    public removeSheet = (name: string) => {
        const index = this.sheets.find(item => item.sheetName === name)
        const sheet: any = this.sheets.splice(index, 1)
        this.updateTabs()
        if (sheet) {
            sheet.destroy()
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
                sheet.setKeyboardInfo({
                    row: cell.range[0],
                    col: cell.range[1]
                })
            }
            sheet.point()
        }, 0)
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
            if (!sheet) return
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
            this.scroll.autoScrollIngTopLeft({
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
            this.scroll.autoScrollIngTopLeft({
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
            this.scroll.autoScrollIngTopLeft({
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
            this.scroll.autoScrollIngTopLeft({
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
        this.scroll.stopAutoScrollIngTopLeft()
        // 向下超出
        if (downBound) {
            this.scroll.autoScrollIngTop(24, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.endRowIndex, sheet.pointRange.boundEndCol]
                })
            })
        // 向上超出
        } else if (upBound) {
            this.scroll.autoScrollIngTop(-24, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.startRowIndex, sheet.pointRange.boundEndCol]
                })
            })
        } else {
            this.scroll.stopAutoScrollIngTop()
        }

        // 向右超出
        if (rightBound) {
            this.scroll.autoScrollIngLeft(80, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.boundEndRow, sheet.pointRange.endColIndex]
                })
            })
        // 向左超出
        } else if (leftBound) {
            this.scroll.autoScrollIngLeft(-80, 100, () => {
                sheet.calcCellSelectedRange({
                    range: [sheet.pointRange.boundEndRow, sheet.pointRange.startColIndex]
                })
            })
        } else {
            this.scroll.stopAutoScrollIngLeft()
        }
    }
    // 创建底部SheetTab
    private createSheetTabs = () => {
        const tabBox = domCore.createDom('div', {
            class: 'mg-footer-tab',
        })
        tabBox.innerHTML = `
            <div class='mg-tabs'>
                <div class='mg-tabs-arrow'>
                    <span class='mg-tabs-arrow-left'>
                        <div class='mg-tabs-arrow-left-item'></div>
                    </span>
                    <span class='mg-tabs-arrow-right'>
                        <div class='mg-tabs-arrow-right-item'></div>
                    </span>
                </div>
                <div class='mg-tabs-wapper'>
                    <div class='mg-tabs-inner'></div>
                </div>
                <div class='mg-tabs-add' id='mgTabsAddBtn'>
                    <span class='mg-tabs-add-line1'></span>
                    <span class='mg-tabs-add-line2'></span>
                </div>
            </div>
        `
        const footerScrollBox = domCore.createDom('div', {
            class: 'mg-footer-scroll',
        })
        this.layout.footerBox.appendChild(tabBox)
        this.layout.footerBox.appendChild(footerScrollBox)
        this.layout.tabBox = tabBox
        this.layout.footerScrollBox = footerScrollBox

        const mgTabsAddBtn:any = document.getElementById('mgTabsAddBtn')
        mgTabsAddBtn.addEventListener('click', () => {
            this.addSheet({
                name: getDefaultSheetName(this.sheets),
                rowCount: 20,
                colCount: 10
            })
        })

        const arrowLeft = document.querySelector('.mg-tabs-arrow-left')
        arrowLeft.addEventListener('click', () => {
            console.log('left')
        })

        const arrowRight = document.querySelector('.mg-tabs-arrow-right')
        arrowRight.addEventListener('click', () => {
            console.log('right')
        })
    }
    private onClickTab = (e) => {
        const index = Number(e.target.getAttribute('data-index'))
        let preSlectedSheetIndex = this.selectedSheetIndex;
        this.selectedSheetIndex = index
        const sheet = this.sheets[index]
        sheet.active = true;
        if (preSlectedSheetIndex >= 0) {
            this.sheets[preSlectedSheetIndex].active = false;
            
            this.scroll.resetScrollBar(sheet.getScrollHeight(), sheet.getScrollWidth(), sheet.scrollBar.vertical, sheet.scrollBar.horizontal)
        } else {
            sheet.point()
        } 
        this.updateTabs()
    }
    private updateTabs = () => {
        const tabsInner = document.querySelectorAll('.mg-tabs-inner')[0];
        if (tabsInner) {
            let html = ''
            this.sheets.forEach((sheet, index) => {
                html += `<div class='mg-tabs-item' data-index=${index}>${sheet.name}</div>`
            })
            tabsInner.innerHTML = html
            tabsInner.removeEventListener('click', this.onClickTab)
            tabsInner.addEventListener('click', this.onClickTab)
        }
        this.updateTabsClass()
    }
    private updateTabsClass = () => {
        if (this.sheets.length === 0) return
        const items = document.querySelectorAll('.mg-tabs-item')

        items.forEach((item, index) => {
            item.className = 'mg-tabs-item'
            if(index === this.selectedSheetIndex) {
                item.className += ' mg-tabs-item-active'
            }
        })
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