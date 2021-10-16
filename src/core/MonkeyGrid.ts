import { layout } from './layout'
import * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { mouseDown, mouseMove, mouseUp, removeMouseDown, removeMouseMove, removeMouseUp } from '../event/mouseEvent'
import { getPixelRatio, getObjectAttrDefault, findCellByXY, inFrozenRowByXY, inFrozenColByXY, throllte } from '../utils/helper'
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
    isDbClick: boolean = false
    public addSheet = (name: string, rowCount: number, colCount: number) => {
        const sheet = new Sheet({
            name,
            rowCount,
            colCount,
            layout: this.layout,
            canvas: this.layout.canvas,
            canvasContext: this.canvasContext,
            height: this.height,
            width: this.width,
            order: getObjectAttrDefault(this.options, 'order', true),
            headerOrder: getObjectAttrDefault(this.options, 'headerOrder', true),
            ratio: this.ratio,
            frozenRowCount: this.options.frozenRowCount,
            frozenColCount: this.options.frozenColCount
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

        this.moveFn = this.onMouseMove()
        mouseDown(this.layout.canvas, this.onMouseDown)
        mouseMove(this.layout.canvas, this.moveFn)
        mouseUp(this.layout.canvas, this.onMouseUp)
    }
    private onMouseDown = (event: Event) => {
        setTimeout(() => {
            const now = new Date().getTime()
            const sheet = this.sheets[this.selectedSheetIndex]
            this.isDbClick = false
            this.mouseDownFlag = true
            if (now - this.mouseDownTime < 300) {
                this.isDbClick = true
                this.mouseDownFlag = false
                console.log('双击')
            }
            this.mouseDownTime = now
            const { offsetX, offsetY }: any = event
            const { sheetData, frozenRowCount, frozenColCount } = sheet
            const inFrozenRow = inFrozenRowByXY(offsetY, frozenRowCount, sheetData, sheet.getCellInfo)
            const inFrozenCol = inFrozenColByXY(offsetX, frozenColCount, sheetData, sheet.getCellInfo)
            sheet.selectedRangeInFrozenRow = inFrozenRow
            sheet.selectedRangeInFrozenCol = inFrozenCol
            const cell = findCellByXY(offsetX, offsetY, sheet)
            if (cell) {
                // 避免同一个引用，否则后面修改 sheet.selectedRange 会影响初始的sheet.selectedCell.range
                sheet.selectedRange = [...cell.range]
                sheet.selectedCell = cell
            }
            sheet.point()
        }, 0)
    }
    private onMouseMove = () => {
        return throllte((event: Event) => {
            if (this.mouseDownFlag) {
                const { offsetX, offsetY }: any = event
                const sheet = this.sheets[this.selectedSheetIndex]
                const cell = findCellByXY(offsetX, offsetY, sheet)
                if (cell) {
                    sheet.calcCellSelectedRange(cell)
                    sheet.point()
                }
            }
        }, 100)
    }
    private onMouseUp = (event: Event) => {
        setTimeout(() => {
            this.mouseDownFlag = false
            // const sheet = this.sheets[this.selectedSheetIndex]
            // sheet.setMergeCellsByRange()
            // setTimeout(() => {
            //     sheet.removeMergeCellsByRange()
            // }, 2000)
        }, 100)

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
        removeMouseMove(this.layout.canvas, this.moveFn)
        removeMouseUp(this.layout.canvas, this.onMouseUp)
        this.sheets.forEach(s => s.destroy())
        this.sheets = null
        this.options = null
        this.layout = null
    }
}

export default MonkeyGrid;