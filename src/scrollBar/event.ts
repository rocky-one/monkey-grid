import { explorerType } from '../utils/helper'
import { addEvent, removeEvent } from '../utils/event'
import { VerticalEventRecord } from './ScrollInterface'

/**
 * @desc 鼠标滚轮事件
 * @param ele 事件绑定给的元素
 * @param cb 回调
 */
export function mousewheel(ele: HTMLElement, cb: Function):void {
    const evetType = explorerType === 'Firefox' ? 'DOMMouseScroll' : 'mousewheel'
    ele.addEventListener(evetType, (e: WheelEvent) => {
        let deltaX = 0
        let deltaY = 0
        deltaY = (e.wheelDelta) ? e.wheelDelta / 120 : -(e.detail || 0) / 3
        cb && cb(e, {deltaX, deltaY})
    })
}

export function mouseDownSlider(verticalEventRecord: VerticalEventRecord): Function {
    return function(e: MouseEvent) {
        console.log('down')
        verticalEventRecord.mouseDownPageX = e.pageX
        verticalEventRecord.mouseDownPageY = e.pageY
        console.log(verticalEventRecord)
    }
}
