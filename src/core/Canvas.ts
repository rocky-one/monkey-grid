import  * as domCore from '../utils/dom';
import { getPixelRatio, throllte} from '../utils/helper';
import { guid } from '../utils/guid';

interface CanvasOptions {
    container: HTMLElement;
    width: number;
    height: number;
    mouseDown: (event: MouseEvent) => void;
    mouseMove: (event: MouseEvent) => void;
    mouseUp: (event: MouseEvent) => void;
    doubleClick: (event: MouseEvent) => void;
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
        this.options = options;
        this.width = options.width;
        this.height = options.height;
        this.canvas = domCore.createCanvas({
            width: this.width,
            height: this.height,
            id: this.id
        });
        options.container.appendChild(this.canvas);
        this.setRatio();
        this.bindEvent();
    }
    options: CanvasOptions;
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    ratio: number = 1;
    canvasContext: any;
    isDoubleClick: boolean = false;
    mouseDownTime: number = 0;
    id: string = guid();
    private bindEvent = () => {
        this.onMouseMove = this.onMouseMoveThrollte();
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        document.body.addEventListener('mousemove', this.onMouseMove);
        document.body.addEventListener('mouseup', this.onMouseUp);
    }
    private unBindEvent = () => {
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        document.body.removeEventListener('mousemove', this.onMouseMove);
        document.body.removeEventListener('mouseup', this.onMouseUp);
    }
    private onMouseDown = (event: MouseEvent) => {
        const now = new Date().getTime();
        this.isDoubleClick = false;
        this.options.mouseDown(event);
        if (now - this.mouseDownTime < 200) {
            this.isDoubleClick = true;
            this.options.doubleClick && this.options.doubleClick(event);
        }
        this.mouseDownTime = now;
    }
    private onMouseMoveThrollte = () => {
        return throllte((event: MouseEvent) => {
            // const target = event.target as EventTarget & { id: string };
            // if (target.id === this.id) {
            this.options.mouseMove(event);
            // }
        }, 80);
    }
    private onMouseMove = () => {};
    private onMouseUp = (event: MouseEvent) => {
        this.options.mouseUp(event);
    }
    public scale = () => {
        this.canvas.width = this.canvas.width;
        this.canvasContext.scale(this.ratio, this.ratio);
        // this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height)
    }
    public getCanvasRect = () => {
        return this.canvas.getBoundingClientRect();
    }
    public getContext = () => this.canvasContext;

    public paintLine = (attrs: PaintLine) => {
        this.canvasContext.moveTo(attrs.x, attrs.y);
        this.canvasContext.lineTo(attrs.x2, attrs.y2);
    }
    public paintRect = (attrs: PaintRect) => {
        this.canvasContext.fillStyle = attrs.fillStyle || '#FFFFFF';
        this.canvasContext.fillRect(attrs.x, attrs.y, attrs.width, attrs.height);
    }
    public setFont = (font: any) => {
        this.canvasContext.font = font;
    }
    public paintText = (attrs: PaintText) => {
        this.canvasContext.fillText(attrs.text, attrs.x, attrs.y);
    }
    public clearCanvas = () => {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    public setSize = (width: number, height: number) => {
        this.width = width;
        this.height = height;
        this.clearCanvas();
        this.setRatio(this.width, this.height);
    }
    private setRatio = (width?: number, height?: number) => {
        const canvasContext = this.canvas.getContext('2d');
        this.ratio = getPixelRatio(canvasContext);
        const oldWidth = width || this.canvas.width;
        const oldHeight = height || this.canvas.height;
        this.canvas.width = Math.round(oldWidth * this.ratio);
        this.canvas.height = Math.round(oldHeight * this.ratio);
        this.canvas.style.width = oldWidth + 'px';
        this.canvas.style.height = oldHeight + 'px';
        canvasContext.scale(this.ratio, this.ratio);
        // canvasContext.translate(ratio, ratio)
        this.canvasContext = canvasContext;
    }
    public getId = () => this.id;
    public destroy = () => {
        this.unBindEvent();
    }
}

export default Canvas;