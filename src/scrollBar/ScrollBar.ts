import {
    calcVerticalSliderSize,
    calcHorizontalSliderSize,
    getScrollTopBySliderMoveY,
    getScrollLeftBySliderMoveX
} from './calc'
import { createVerticalScroll, createHorizontalScroll, setNodeStyle } from './create'
import { updateVerticalScroll, updateHorizotalScroll } from './update'
import { addEvent, removeEvent } from '../utils/event'
import { mousewheel, removeMousewheel, mouseDownSlider, mouseDownSliderH } from './event'
import { ScrollBarOptions, Vertical, VerticalEventRecord, HorizontalEventRecord, Horizontal } from './ScrollInterface'
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
        this.onMouseDownVerticalSlider()
        this.onMouseDownHorizontalSlider()
        this.onMouseMoveSlider()
        this.onMouseUpSlider()
        this.onMouseUpSliderH()
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
        mouseDownFlag: false,
        mouseMoveY: 0,
        scrollTop: 0,
        preVY: 0,
        preMoveVY: 0
    }
    horizontalEventRecord: HorizontalEventRecord = {
        mouseDownPageX: 0,
        mouseDownPageY: 0,
        mouseDownFlag: false,
        mouseMoveY: 0,
        scrollLeft: 0,
        preHX: 0,
        preMoveHX: 0
    }

    mouseDownSlider: Function
    mouseDownSliderH: Function
    autoScrollInfo: any = {
        autoScrollTop: false,
        autoScrollLeft: false,
        autoScrollLeftTop: false,
        topTimer: null,
        leftTimer: null,
        topLeftTimer: null
    }
    
    private onMouse = (e: any, { deltaX, deltaY }) => {
        e.preventDefault()
        // sliderHeight > 0 说明有滚动条，只有 有滚动的时候事件才能被触发
        if (this.vertical.sliderHeight > 0) {
            // 是否超出边界标记
            let verticalBoundary = false
            if (deltaY < 0) {
                // console.log('向下滚动')
                if (this.vertical.sliderTop >= this.vertical.sliderMaxTop) {
                    verticalBoundary = true
                }
            } else if (deltaY > 0) {
                // console.log('向上滚动')
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
                // console.log('向右滚动')
                if (this.horizontal.sliderLeft >= this.horizontal.sliderMaxLeft) {
                    horitovalBoundary = true
                }
            } else if (deltaX > 0) {
                // console.log('向左滚动')
                if (this.horizontal.sliderLeft <= 0) {
                    horitovalBoundary = true
                }
            }
            if (deltaX !== 0 && !horitovalBoundary) {
                this.horizontal = updateHorizotalScroll(this.horizontal, -deltaX * 40)
                this.options.horizontalScrollCb(this.horizontal)
            }
        }
    }
    private onMousewheel = () => {
        // 需要判断是否有滚动条 如果没有滚动条 事件需要不触发 throllte(this.onMouse, 40)
        mousewheel(this.options.eventBindEle, this.onMouse)
    }
    public resetScrollBar = (scrollHeight: number, scrollWidth: number) => {

        this.vertical.scrollHeight = scrollHeight
        this.updateVertical(calcVerticalSliderSize(this.vertical))
        // setNodeStyle(this.vertical.viewSlider, {
        //     height: `${this.vertical.sliderHeight}px`,
        //     top: '0'
        // })

        this.horizontal.scrollWidth = scrollWidth
        this.updateHorizontal(calcHorizontalSliderSize(this.horizontal))
        // setNodeStyle(this.horizontal.viewSlider, {
        //     innerWidth: `${this.horizontal.sliderWidth}px`,
        //     left: '0'
        // })
    }
    public getVertical = () => {
        return this.vertical
    }
    public getHorizontal = () => {
        return this.horizontal
    }
    public verticalScrollTo = (scrollTop: number) => {
        this.vertical = updateVerticalScroll(this.vertical, scrollTop, true)
        this.options.verticalScrollCb(this.vertical)
    }
    public horizontalScrollTo = (scrollLeft: number) => {
        this.horizontal = updateHorizotalScroll(this.horizontal, scrollLeft, true)
        this.options.horizontalScrollCb(this.horizontal)
    }
    // 是否超出边界
    // 上边界
    public getVerticalUpBoundary = () => {
        return this.vertical.sliderTop < 0
    }
    // 下边界
    public getVerticalDownBoundary = () => {
        return this.vertical.sliderTop >= this.vertical.sliderMaxTop
    }
    // 左边界
    public getHorizontalLeftBoundary = () => {
        return this.horizontal.sliderLeft < 0
    }
    public getHorizontalRightBoundary = () => {
        return this.horizontal.sliderLeft >= this.horizontal.sliderMaxLeft
    }
    /**
     * 自动滚动
     * @param speed 滚动速度 像素
     * @param time 滚动间隔时间
     * @param cb 回调
     */
    public autoScrollIngTop = (speed: number, time: number, cb?: Function) => {
        
        if (!this.autoScrollInfo.autoScrollTop) {
            this.autoScrollInfo.topTimer = setInterval(() => {
                if (this.getVerticalUpBoundary() || this.getVerticalDownBoundary()) {
                    this.stopAutoScrollIngTop()
                    return
                }
                if (cb && typeof cb === 'function') {
                    cb()
                }
                const scrollTop = this.getVertical().scrollTop
                this.verticalScrollTo(scrollTop + speed)
                this.autoScrollInfo.autoScrollTop = true
            }, time)
        }
    }
    public stopAutoScrollIngTop = () => {
        // if (!this.autoScrollInfo.autoScrollTop) return
        this.autoScrollInfo.topTimer && clearInterval(this.autoScrollInfo.topTimer)
        this.autoScrollInfo.topTimer = null
        this.autoScrollInfo.autoScrollTop = false
    }
    public autoScrollIngLeft = (speed: number, time: number, cb?: Function) => {
        if (!this.autoScrollInfo.autoScrollLeft) {
            this.autoScrollInfo.leftTimer = setInterval(() => {
                if (this.getHorizontalLeftBoundary() || this.getHorizontalRightBoundary()) {
                    this.stopAutoScrollIngLeft()
                    return
                }
                this.autoScrollInfo.autoScrollLeft = true
                if (cb && typeof cb === 'function') {
                    cb()
                }
                const scrollLeft = this.getHorizontal().scrollLeft
                this.horizontalScrollTo(scrollLeft + speed)
            }, time)
        }
    }
    public stopAutoScrollIngLeft = () => {
        // if (!this.autoScrollInfo.autoScrollLeft) return
        this.autoScrollInfo.leftTimer && clearInterval(this.autoScrollInfo.leftTimer)
        this.autoScrollInfo.leftTimer = null
        this.autoScrollInfo.autoScrollLeft = false
    }
    public autoScrollIngTopLeft = (params: any, cb: Function) => {
        if (!this.autoScrollInfo.autoScrollLeftTop) {
            this.autoScrollInfo.autoScrollLeftTop = true
            this.stopAutoScrollIngTop()
            this.stopAutoScrollIngLeft()
            this.autoScrollIngTop(params.topSpeed, params.time, cb)
            this.autoScrollIngLeft(params.leftSpeed, params.time, cb)
        }
    }
    public stopAutoScrollIngTopLeft = () => {
        if (!this.autoScrollInfo.autoScrollLeftTop) return
        this.autoScrollInfo.autoScrollLeftTop = false
        this.stopAutoScrollIngTop()
        this.stopAutoScrollIngLeft()
    }
    private updateVertical = (vertical: Vertical = {}) => {
        this.vertical = Object.assign(this.vertical, vertical)
    }
    private updateHorizontal = (horizontal: Horizontal) => {
        this.horizontal = Object.assign(this.horizontal, horizontal)
    }

    private onMouseDownVerticalSlider = () => {
        this.mouseDownSlider = mouseDownSlider(this.verticalEventRecord, this.vertical)
        addEvent(this.vertical.viewSlider, 'mousedown', this.mouseDownSlider)
    }
    private removeMouseDownVerticalSlider = () => {
        removeEvent(this.vertical.viewSlider, 'mousedown', this.mouseDownSlider)
    }

    private onMouseDownHorizontalSlider = () => {
        this.mouseDownSliderH = mouseDownSliderH(this.horizontalEventRecord, this.horizontal)
        addEvent(this.horizontal.viewSlider, 'mousedown', this.mouseDownSliderH)
    }
    private removeMouseDownHorizontalSlider = () => {
        removeEvent(this.horizontal.viewSlider, 'mousedown', this.mouseDownSliderH)
    }


    private mouseMoveSlider = (event: MouseEvent) => {
        // 纵向滚动条被按下
        if (this.verticalEventRecord.mouseDownFlag) {
            // sliderHeight > 0 说明有滚动条，只有 有滚动的时候事件才能被触发
            this.verticalEventRecord.preVY = this.verticalEventRecord.preMoveVY
            this.verticalEventRecord.preMoveVY = event.pageY
            if (this.vertical.sliderHeight > 0) {
                // 是否超出边界标记
                let verticalBoundary = false
                let moveY = event.pageY - this.verticalEventRecord.mouseDownPageY
                if (this.verticalEventRecord.preVY <= this.verticalEventRecord.preMoveVY) {
                    // console.log('向下')
                    verticalBoundary = this.getVerticalUpBoundary()
                } else {
                    // console.log('向上')
                    verticalBoundary = this.getVerticalDownBoundary()
                }
                const scrollTop = getScrollTopBySliderMoveY(this.vertical, this.verticalEventRecord, moveY)
                if (moveY !== 0 && !verticalBoundary) {
                    this.vertical = updateVerticalScroll(this.vertical, scrollTop, true)
                    this.options.verticalScrollCb(this.vertical)
                }
            }
        }
        if (this.horizontalEventRecord.mouseDownFlag) {
            this.horizontalEventRecord.preHX = this.horizontalEventRecord.preMoveHX
            this.horizontalEventRecord.preMoveHX = event.pageX

            if (this.horizontal.sliderWidth > 0) {
                let horitovalBoundary = false
                let moveX = event.pageX - this.horizontalEventRecord.mouseDownPageX
                if (this.horizontalEventRecord.preHX <= this.horizontalEventRecord.preMoveHX) {
                    // console.log('向右滚动')
                    if (this.horizontal.sliderLeft >= this.horizontal.sliderMaxLeft) {
                        horitovalBoundary = true
                    }
                } else {
                    // console.log('向左滚动')
                    if (this.horizontal.sliderLeft <= 0) {
                        horitovalBoundary = true
                    }
                }
                if (moveX !== 0 && !horitovalBoundary) {
                    const scrollLeft = getScrollLeftBySliderMoveX(this.horizontal, this.horizontalEventRecord, moveX)
                    this.horizontal = updateHorizotalScroll(this.horizontal, scrollLeft, true)
                    this.options.horizontalScrollCb(this.horizontal)
                }
            }
        }
    }
    private onMouseMoveSlider = () => {
        addEvent(document.body, 'mousemove', this.mouseMoveSlider)
    }
    private removeMouseMoveSlider = () => {
        removeEvent(document.body, 'mousemove', this.mouseMoveSlider)
    }

    private mouseUpSlider = (event) => {
        this.verticalEventRecord.mouseDownFlag = false
    }
    private onMouseUpSlider = () => {
        addEvent(document.body, 'mouseup', this.mouseUpSlider)
    }
    private removeMouseUpSlider = () => {
        removeEvent(document.body, 'mouseup', this.mouseUpSlider)
    }

    private mouseUpSliderH = () => {
        this.horizontalEventRecord.mouseDownFlag = false
    }
    private onMouseUpSliderH = () => {
        addEvent(document.body, 'mouseup', this.mouseUpSliderH)
    }
    private removeMouseUpSliderH = () => {
        removeEvent(document.body, 'mouseup', this.mouseUpSliderH)
    }

    destroy = () => {
        removeMousewheel(this.options.eventBindEle, () => { })
        this.removeMouseDownVerticalSlider()
        this.removeMouseDownHorizontalSlider()
        this.removeMouseMoveSlider()
        this.removeMouseUpSlider()
        this.removeMouseUpSliderH()
        this.options.ele.removeChild(this.vertical.viewScroll)
        // this.vertical = null
    }
}

export default ScrollBar