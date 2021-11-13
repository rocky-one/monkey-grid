import { explorerType } from '../utils/helper'
import { addEvent, removeEvent } from '../utils/event'
import { VerticalEventRecord, HorizontalEventRecord } from './ScrollInterface'

/**
 * @desc 鼠标滚轮事件
 * @param ele 事件绑定给的元素
 * @param cb 回调
 */
export function mousewheel(ele: HTMLElement, cb: Function): void {
    const evetType = explorerType === 'Firefox' ? 'DOMMouseScroll' : 'mousewheel'
    ele.addEventListener(evetType, (e: any) => {
        let deltaX = 0
        let deltaY = 0
        deltaX = (e.wheelDeltaX) ? e.wheelDeltaX / 120 : - (e.detailX || 0) / 3
        deltaY = (e.wheelDeltaY) ? e.wheelDeltaY / 120 : - (e.detailY || 0) / 3
        cb && cb(e, { deltaX, deltaY })
    })
}

export function removeMousewheel(ele: HTMLElement, cb: Function): void {
    const evetType = explorerType === 'Firefox' ? 'DOMMouseScroll' : 'mousewheel'
    ele.removeEventListener(evetType, (e: any) => {
        let deltaX = 0
        let deltaY = 0
        deltaX = (e.wheelDeltaX) ? e.wheelDeltaX / 120 : - (e.detailX || 0) / 3
        deltaY = (e.wheelDeltaY) ? e.wheelDeltaY / 120 : - (e.detailY || 0) / 3
        cb && cb(e, { deltaX, deltaY })
    })
}

export function mouseDownSlider(verticalEventRecord: VerticalEventRecord, vertical): Function {
    return function (e: MouseEvent) {
        verticalEventRecord.mouseDownFlag = true
        verticalEventRecord.mouseDownPageX = e.pageX
        verticalEventRecord.mouseDownPageY = e.pageY
        verticalEventRecord.scrollTop = vertical.scrollTop
        vertical.viewSlider.className += ' mg-scroll-bar-active-v';
    }
}

export function mouseDownSliderH(horizontalEventRecord: HorizontalEventRecord, horizontal): Function {
    return function (e: MouseEvent) {
        horizontalEventRecord.mouseDownFlag = true
        horizontalEventRecord.mouseDownPageX = e.pageX
        horizontalEventRecord.mouseDownPageY = e.pageY
        horizontalEventRecord.scrollLeft = horizontal.scrollLeft
        horizontal.viewSlider.className += ' mg-scroll-bar-active-h';
    }
}