import  { layout } from './layout'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import Sheet from './Sheet'
import { initSheetData } from './utils/sheetUtils'
import { getPixelRatio, calcStartRowIndex } from '../utils/helper'

import '../style/app.less'
class MonkeyGrid {
    constructor(options: OptionsInterface){
        this.options = options
        this.optContainer = options.container
        this.init()
        this.point()
        this.sheets = [new Sheet({
            canvas: this.canvas,
            canvasContext: this.canvasContext
        })]
        // setTimeout(() => {
            
        // })
    }
    options: OptionsInterface
    optContainer: HTMLElement
    container: HTMLElement
    sheets: any[]
    canvas: HTMLCanvasElement
    canvasContext: any
    private init = () => {
        const layoutObj = layout(this.optContainer, this.options.width, this.options.height)
        this.container = layoutObj.container
        this.canvas = layoutObj.canvas
        new ScrollBar({
            ele: this.container,
            clientHeight: 400,
            scrollHeight: 1200,
            clientWidth: 300,
            scrollWidth: 1200,
            eventBindEle:  this.container,
            verticalScrollCb: this.verticalScrollCb,
            // horizontalScrollCb: horizontalScrollCb
        })
    }
    private verticalScrollCb = (vertical) => {
        // console.log(vertical, 'vertical')
        const sheet = this.sheets[0]
        const startRowIndex = calcStartRowIndex(vertical.scrollTop, sheet.getSheetData())
        sheet.setPointStartRow(startRowIndex)
        sheet.point()
    }
    public getSheet = index => {
        return this.sheets[index]
    }
    private point = () => {
        const canvasContext = this.canvas.getContext('2d')
        const ratio = getPixelRatio(canvasContext)
        const oldWidth = this.canvas.width
        const oldHeight = this.canvas.height
        this.canvas.width = Math.round(oldWidth * ratio)
        this.canvas.height = Math.round(oldHeight * ratio)
        this.canvas.style.width = oldWidth + 'px'
        this.canvas.style.height = oldHeight + 'px'
        canvasContext.scale(ratio, ratio)
        canvasContext.translate(ratio, ratio)
        this.canvasContext = canvasContext
    }
}

export default MonkeyGrid;