import  { layout } from './layout'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { initSheetData } from './utils/sheetUtils'
import { getPixelRatio, calcStartRowIndex, calcStartColIndex } from '../utils/helper'
import '../style/app.less'
class MonkeyGrid {
    constructor(options: OptionsInterface){
        this.options = options
        this.optContainer = options.container
        this.width = options.width || options.container.offsetWidth
        this.height = options.height || options.container.offsetHeight
        const layoutObj = layout(this.optContainer, this.width, this.height)
        this.container = layoutObj.container
        this.canvas = layoutObj.canvas

        this.init()
        
    }
    options: OptionsInterface
    optContainer: HTMLElement
    container: HTMLElement
    width: number
    height: number
    sheets: any[] = []
    canvas: HTMLCanvasElement
    canvasContext: any
    scrollBar: ScrollBar = null
    hooks: Object = {}
    private verticalScrollCb = (vertical) => {
        const sheet = this.sheets[0]
        // const startRowIndex = calcStartRowIndex(vertical.scrollTop, sheet.getSheetData())
        // sheet.setPointStartRow(startRowIndex)
        sheet.point()
    }
    private horizontalScrollCb = (horizontal) => {
        const sheet = this.sheets[0]
        // const startColIndex = calcStartColIndex(horizontal.scrollLeft, sheet.getSheetData())
        // sheet.setPoinStartCol(startColIndex)
        sheet.point()
    }
    public addSheet = (name: string, rowCount: number, colCount: number) => {
        const sheet = new Sheet({
            name,
            rowCount,
            colCount,
            canvas: this.canvas,
            canvasContext: this.canvasContext,
            clientHeight: this.height,
            clientWidth: this.width,
        })
        if(this.scrollBar){
            this.scrollBar.resetScrollBar(sheet.getScrollHeight(), sheet.getScrollWidth())
        }else {
            this.scrollBar = new ScrollBar({
                ele: this.container,
                clientHeight: this.height,
                scrollHeight: sheet.getScrollHeight(),
                clientWidth: this.width,
                scrollWidth: sheet.getScrollWidth(),
                eventBindEle:  this.container,
                verticalScrollCb: this.verticalScrollCb,
                horizontalScrollCb: this.horizontalScrollCb
            })
            sheet.setScrollBar(this.scrollBar)
        }
        this.sheets.push(sheet)
        return sheet
    }
    public getSheet = (name: string) => {
        // return this.sheets[index]
    }
    public removeSheet = (name: string) => {

    }
    public setSelectSheet = () => {

    }
    private init = () => {
        const canvasContext = this.canvas.getContext('2d')
        const ratio = getPixelRatio(canvasContext)
        const oldWidth = this.canvas.width
        const oldHeight = this.canvas.height
        this.canvas.width = Math.round(oldWidth * ratio)
        this.canvas.height = Math.round(oldHeight * ratio)
        this.canvas.style.width = oldWidth + 'px'
        this.canvas.style.height = oldHeight + 'px'
        canvasContext.scale(ratio, ratio)
        // canvasContext.translate(ratio, ratio)
        this.canvasContext = canvasContext
    }
    public onHooks = (hookName, fn) => {

    }
}

export default MonkeyGrid;