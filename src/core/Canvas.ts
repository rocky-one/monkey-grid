import  * as domCore from '../utils/dom'
import { getPixelRatio} from '../utils/helper'
interface CanvasOptions {
    container: HTMLElement;
    width: number;
    height: number;
}

interface PaintLine {
    x: number;
    y: number;
    x2: number;
    y2: number;
    strokeStyle?: string
}

interface PaintRect {
    x: number;
    y: number;
    width: number;
    height: number;
    fillStyle?: string;
}

interface PaintText {
    x: number;
    y: number;
    text: string;
    font: string;
}
class Canvas {
    constructor(options: CanvasOptions) {
        this.width = options.width
        this.height = options.height
        this.canvas = domCore.createCanvas({
            width: this.width,
            height: this.height
        })
        options.container.appendChild(this.canvas)
        this.setRatio()
    }
    width: number
    height: number
    canvas: HTMLCanvasElement
    eventMap: any = {}
    ratio: number = 1
    canvasContext: any
    public on = (type: string, handler: EventListener) => {
        this.eventMap[type] = handler
        this.canvas.addEventListener(type, this.eventMap[type])
    }
    public off = (type: string) => {
        this.canvas.removeEventListener(type, this.eventMap[type])
        delete this.eventMap[type]
    }
    public scale = () => {
        this.canvas.width = this.canvas.width
        this.canvasContext.scale(this.ratio, this.ratio)
        // this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height)
    }
    public getCanvasRect = () => {
        return this.canvas.getBoundingClientRect()
    }
    public paintLine = (attrs: PaintLine) => {
        this.canvasContext.moveTo(attrs.x, attrs.y)
        this.canvasContext.lineTo(attrs.x2, attrs.y2)
    }
    public paintRect = (attrs: PaintRect) => {
        this.canvasContext.fillStyle = attrs.fillStyle || '#FFFFFF'
        this.canvasContext.fillRect(attrs.x, attrs.y, attrs.width, attrs.height)
    }
    public setFont = (font: any) => {
        this.canvasContext.font = font
    }
    public paintText = (attrs: PaintText) => {
        this.canvasContext.fillText(attrs.text, attrs.x, attrs.y)
    }
    public clearCanvas = () => {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    public setSize = (width: number, height: number) => {
        this.width = width
        this.height = height
        this.clearCanvas()
        this.setRatio(this.width, this.height)
    }
    private setRatio = (width?: number, height?: number) => {
        const canvasContext = this.canvas.getContext('2d')
        this.ratio = getPixelRatio(canvasContext)
        const oldWidth = width || this.canvas.width
        const oldHeight = height || this.canvas.height
        this.canvas.width = Math.round(oldWidth * this.ratio)
        this.canvas.height = Math.round(oldHeight * this.ratio)
        this.canvas.style.width = oldWidth + 'px'
        this.canvas.style.height = oldHeight + 'px'
        canvasContext.scale(this.ratio, this.ratio)
        // canvasContext.translate(ratio, ratio)
        this.canvasContext = canvasContext
    }
}

export default Canvas