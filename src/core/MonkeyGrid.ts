import { layout } from './layout'
import * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { mouseDown, mouseEvent, mouseMove, mouseUp, removeMouseMove } from '../event/mouseEvent'
import { getPixelRatio, getObjectAttrDefault, findCellByXY, inFrozenRowByXY, inFrozenColByXY, throllte } from '../utils/helper'
// import { FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH, LEFT_ORDER_WIDTH, HEADER_ORDER_HEIGHT } from './const'
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
    selectedSheetIndex: number = 0
    mouseDownFlag: boolean = false
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
    public getSheet = (name: string) => {
        // return this.sheets[index]
    }
    public removeSheet = (name: string) => {
        const index = this.sheets.find(item => item.sheetName === name)
        const sheet: any = this.sheets.splice(index, 1)
        if(sheet) {
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
        mouseDown(this.layout.canvas, (event: Event) => {
            this.mouseDownFlag = true
            const {offsetX, offsetY}: any = event
            const sheet = this.sheets[this.selectedSheetIndex]
            const {sheetData, pointRange, frozenRowCount, frozenColCount} = sheet
            const inFrozenRow = inFrozenRowByXY(offsetY, frozenRowCount, sheetData)
            const inFrozenCol = inFrozenColByXY(offsetX, frozenColCount, sheetData)
            sheet.selectedRangeInFrozenRow = inFrozenRow
            sheet.selectedRangeInFrozenCol = inFrozenCol
            const cell = findCellByXY(offsetX, offsetY, sheet)
            if(cell) {
                sheet.selectedRange = cell.range
                sheet.selectedCell = cell
            }
            sheet.point()
        })
        const moveFn = this.onMouseMove()
        mouseMove(this.layout.canvas, moveFn)

        mouseUp(this.layout.canvas, (event: Event) => {
            this.mouseDownFlag = false
        })
    }
    private onMouseMove = () => {
        return throllte((event: Event) => {
            if(this.mouseDownFlag) {
                const {offsetX, offsetY}: any = event
                const sheet = this.sheets[this.selectedSheetIndex]
                const cell = findCellByXY(offsetX, offsetY, sheet)
                if(cell) {
                    let selectedCellRange = sheet.selectedCell.range
                    const selectedRange = sheet.selectedRange
                    const row = cell.range[0]
                    const col = cell.range[1]
                    if(selectedCellRange) {
                        // 反方向选中
                        if(row < selectedCellRange[0] || col < selectedCellRange[0]) {
                            // selectedRange[0] = row
                            // selectedRange[1] = col
                            // selectedRange[2] = selectedCellRange[0]
                            // selectedRange[3] = selectedCellRange[1]
                        }else {
                            selectedRange[2] = row
                            selectedRange[3] = col
                        }
                    }
                    sheet.selectedRange = selectedRange
                }
                console.log(sheet.selectedRange, 12)
                sheet.point()
            }
        }, 100)
    }
    private calcMouseMoveXY = () => {

    }
    private onRemoveMouseMode = (fn: Function) => {
        removeMouseMove(this.layout.canvas, fn)
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
        this.sheets.forEach(s => s.destroy())
        this.sheets = null
        this.options = null
        this.layout = null
    }
}

export default MonkeyGrid;