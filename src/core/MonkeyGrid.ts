import  { layout } from './layout'
import  * as domCore from '../utils/dom'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { mouseEvent } from '../event/mouseEvent'
import { getPixelRatio, getObjectAttrDefault, calcStartRowIndex, calcStartColIndex } from '../utils/helper'
import { FOOTER_HEIGHT, RIGHT_SCROLL_WIDTH, LEFT_ORDER_WIDTH, HEADER_ORDER_WIDTH } from './const'
import '../style/app.less'

/**
 * @desc options参数描述
 * order 是否有序号 true | false
 */
class MonkeyGrid {
    constructor(options: OptionsInterface){
        this.options = options
        this.optContainer = options.container
        this.width = options.width || options.container.offsetWidth
        this.height = options.height || options.container.offsetHeight
        // 有序号时的偏移量
        this.xOffset = this.options.order ? LEFT_ORDER_WIDTH : 0  
        this.yOffset = this.options.headerOrder ? HEADER_ORDER_WIDTH : 0
        // 计算可视区域宽高
        this.viewWidth = this.width - RIGHT_SCROLL_WIDTH - this.xOffset
        this.viewHeight = this.height - FOOTER_HEIGHT - this.yOffset
        
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
    xOffset: number = 0
    yOffset: number = 0
    ratio: number = 1
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
            order: getObjectAttrDefault(this.options, 'order', true),
            headerOrder: getObjectAttrDefault(this.options, 'headerOrder', true),
            xOffset: this.xOffset,
            yOffset: this.yOffset,
            ratio: this.ratio
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
        mouseEvent(this.layout.canvas, () => {

        })
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