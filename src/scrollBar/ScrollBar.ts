import {
    calcVerticalSliderSize,
    calcHorizontalSliderSize,
} from './calc'
import { explorerType } from '../utils/helper'
import { createVerticalScroll } from './create'
import { updateVerticalScroll } from './update'
import { addEvent, removeEvent } from '../utils/event'
import { mousewheel, mouseDownSlider } from './event'
import { ScrollBarOptions, Vertical, VerticalEventRecord } from './ScrollInterface'
class ScrollBar {
    constructor(options: ScrollBarOptions) {
        this.options = options
        this.vertical.clientHeight = this.options.clientHeight
        this.vertical.scrollHeight = this.options.scrollHeight
        this.vertical.scrollClientHeight = this.options.clientHeight
        this.updateVertical(createVerticalScroll(this.options.ele, this.vertical))
        this.onMousewheel()
        this.onMouseDownSlider()
    }
    options: ScrollBarOptions
    vertical: Vertical = {
        scrollTop: 0,
        maxScrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
        scrollClientHeight: 0,
    }
    verticalEventRecord: VerticalEventRecord = {
        mouseDownPageX: 0,
        mouseDownPageY: 0,
        mouseMoveIng: false,
        mouseMoveY: 0
    }
    mouseDownSlider: Function
    private onMousewheel = () => {
        mousewheel(this.options.eventBindEle, (e, {deltaX, deltaY}) => {
            // 是否超出边界标记
            let verticalBoundary = false
            if(deltaY < 0) {
                console.log('向下滚动')
                if(this.vertical.sliderTop >= this.vertical.sliderMaxTop) {
                    verticalBoundary = true
                }
            }else if(deltaY > 0) {
                console.log('向上滚动')
                if(this.vertical.sliderTop <= 0) {
                    verticalBoundary = true
                }
            }
            if(deltaY !== 0 && !verticalBoundary) {
                updateVerticalScroll(this.vertical, -deltaY * 40)
            }
        })
        // this.options.eventBindEle.addEventListener(evetType, (e: WheelEvent) => {
        //     const { deltaX, deltaY } = e
        //     let  delta = 0
        //     delta = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3
        //     console.log(delta,'delta')
        //     if(delta < 0){
        //         console.log('向下滚动')
        //         if(this.vertical.sliderTop >= this.vertical.sliderMaxTop) {
        //             return
        //         }
        //     }else if(delta > 0){
        //         console.log('向上滚动')
        //         if(this.vertical.sliderTop <= 0) return
        //     }
        //     // if(deltaX < 0){
        //     //     console.log('向右滚动')
        //     // }else if(deltaX > 0){
        //     //     console.log('向左滚动')
        //     // }
        //     // this.vertical.scrollTop = this.vertical.scrollTop + deltaY * 10;
            
    }
    private updateVertical = (vertical: Vertical = {}) => {
        this.vertical = Object.assign(this.vertical, vertical);
    }
    private onMouseDownSlider = () => {
        this.mouseDownSlider = mouseDownSlider(this.verticalEventRecord)
        addEvent(this.vertical.viewSlider, 'mousedown', this.mouseDownSlider)
    }
    private removeMouseDownSlider = () => {
        removeEvent(this.vertical.viewSlider,'mousedown', this.mouseDownSlider)
    }
    destroy = () => {
        this.vertical = null
        this.removeMouseDownSlider()
    }
}

export default ScrollBar