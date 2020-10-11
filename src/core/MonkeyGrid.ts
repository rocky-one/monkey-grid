import  { layout } from './layout'
import  * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { initSheetData } from './utils/sheetUtils'
import { getPixelRatio, calcStartRowIndex, calcStartColIndex } from '../utils/helper'
import { FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH } from './const'
import '../style/app.less'
class MonkeyGrid {
    constructor(options: OptionsInterface){
        this.options = options
        this.optContainer = options.container
        this.width = options.width || options.container.offsetWidth
        this.height = options.height || options.container.offsetHeight
        this.viewWidth = this.width - RIGHT_SCROLL_WIDTH
        this.viewHeight = this.height - FOOTER_HEIGHT
        this.layout = layout(this.optContainer, this.width, this.height)

        this.init()
        this.createSheetTabs()
        
    }
    options: OptionsInterface
    optContainer: HTMLElement
    width: number
    height: number
    viewWidth: number
    viewHeight: number
    sheets: any[] = []
    // canvas: HTMLCanvasElement
    canvasContext: any
    scrollBar: ScrollBar = null
    layout: any
    hooks: Object = {}
    public addSheet = (name: string, rowCount: number, colCount: number) => {
        const sheet = new Sheet({
            name,
            rowCount,
            colCount,
            layout: this.layout,
            canvas: this.layout.canvas,
            canvasContext: this.canvasContext,
            clientHeight: this.viewHeight,
            clientWidth: this.viewWidth,
        })
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
    public onChangeSheet = () => {

    }
    private init = () => {
        const canvasContext = this.layout.canvas.getContext('2d')
        const ratio = getPixelRatio(canvasContext)
        const oldWidth = this.layout.canvas.width
        const oldHeight = this.layout.canvas.height
        this.layout.canvas.width = Math.round(oldWidth * ratio)
        this.layout.canvas.height = Math.round(oldHeight * ratio)
        this.layout.canvas.style.width = oldWidth + 'px'
        this.layout.canvas.style.height = oldHeight + 'px'
        canvasContext.scale(ratio, ratio)
        // canvasContext.translate(ratio, ratio)
        this.canvasContext = canvasContext
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
}

export default MonkeyGrid;