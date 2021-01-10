import {
    calcVerticalSliderSize,
    calcHorizontalSliderSize,
} from './calc'
import { explorerType } from '../utils/helper'
import { createVerticalScroll, createHorizontalScroll, setNodeStyle } from './create'
import { updateVerticalScroll, updateHorizotalScroll } from './update'
import { addEvent, removeEvent } from '../utils/event'
import { mousewheel, removeMousewheel, mouseDownSlider } from './event'
import { ScrollBarOptions, Vertical, VerticalEventRecord, Horizontal } from './ScrollInterface'
class ScrollBar {
    constructor(options: ScrollBarOptions) {
        this.options = options
        this.vertical.clientHeight = this.options.clientHeight
        this.vertical.scrollHeight = this.options.scrollHeight
        this.vertical.scrollClientHeight = this.options.scrollClientHeight

        this.horizontal.clientWidth = this.options.clientWidth
        this.horizontal.scrollWidth = this.options.scrollWidth
        this.horizontal.scrollClientWidth = this.options.scrollClientWidth

        this.updateVertical(createVerticalScroll(this.vertical, this.options.verticalEle || this.options.ele))
        this.updateHorizontal(createHorizontalScroll(this.horizontal, this.options.horizontalEle || this.options.ele))
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
        sliderHeight: 0
    }
    horizontal: Horizontal = {
        scrollLeft: 0,
        maxScrollLeft: 0,
        scrollWidth: 0,
        clientWidth: 0,
        scrollClientWidth: 0,
        sliderWidth: 0
    }
    verticalEventRecord: VerticalEventRecord = {
        mouseDownPageX: 0,
        mouseDownPageY: 0,
        mouseMoveIng: false,
        mouseMoveY: 0
    }
    mouseDownSlider: Function
    private onMousewheel = () => {
        // 需要判断是否有滚动条 如果没有滚动条 事件需要不触发
        mousewheel(this.options.eventBindEle, (e: any, { deltaX, deltaY }) => {
            // sliderHeight > 0 说明有滚动条，只有 有滚动的时候事件才能被触发
            if (this.vertical.sliderHeight > 0) {
                // 是否超出边界标记
                let verticalBoundary = false
                if (deltaY < 0) {
                    console.log('向下滚动')
                    if (this.vertical.sliderTop >= this.vertical.sliderMaxTop) {
                        verticalBoundary = true
                    }
                } else if (deltaY > 0) {
                    console.log('向上滚动')
                    if (this.vertical.sliderTop <= 0) {
                        verticalBoundary = true
                    }
                }
                if (deltaY !== 0 && !verticalBoundary) {
                    this.vertical = updateVerticalScroll(this.vertical, -deltaY * 40)
                    this.options.verticalScrollCb(this.vertical)
                }
            }
            if (this.horizontal.sliderWidth > 0) {
                let horitovalBoundary = false
                if (deltaX < 0) {
                    console.log('向右滚动')
                    if (this.horizontal.sliderLeft >= this.horizontal.sliderMaxLeft) {
                        horitovalBoundary = true
                    }
                } else if (deltaX > 0) {
                    console.log('向左滚动')
                    if (this.horizontal.sliderLeft <= 0) {
                        horitovalBoundary = true
                    }
                }
                if (deltaX !== 0 && !horitovalBoundary) {
                    this.horizontal = updateHorizotalScroll(this.horizontal, -deltaX * 40)
                    this.options.horizontalScrollCb(this.horizontal)
                }
            }
        })
    }
    public resetScrollBar = (scrollHeight: number, scrollWidth: number) => {
        this.vertical.scrollHeight = scrollHeight
        this.updateVertical(calcVerticalSliderSize(this.vertical))
        setNodeStyle(this.vertical.viewSlider, {
            height: `${this.vertical.sliderHeight}px`,
            top: '0'
        })
    }
    public getVertical = () => {
        return this.vertical
    }
    public getHorizontal = () => {
        return this.horizontal
    }
    private updateVertical = (vertical: Vertical = {}) => {
        this.vertical = Object.assign(this.vertical, vertical);
    }
    private updateHorizontal = (horizontal: Horizontal) => {
        this.horizontal = Object.assign(this.horizontal, horizontal)
    }
    private onMouseDownSlider = () => {
        this.mouseDownSlider = mouseDownSlider(this.verticalEventRecord)
        addEvent(this.vertical.viewSlider, 'mousedown', this.mouseDownSlider)
    }
    private removeMouseDownSlider = () => {
        removeEvent(this.vertical.viewSlider, 'mousedown', this.mouseDownSlider)
    }
    destroy = () => {
        removeMousewheel(this.options.eventBindEle, () => { })
        this.removeMouseDownSlider()
        this.options.ele.removeChild(this.vertical.viewScroll)
        // this.vertical = null
    }
}

export default ScrollBar