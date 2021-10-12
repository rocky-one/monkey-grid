import {
    ContainerV,
    ContainerH,
    Vertical, Horizontal,
    VerticalEventRecord,
    HorizontalEventRecord
} from './ScrollInterface'
/**
 * @desc 计算纵向滚动条滑块大小
 */
export function calcVerticalSliderSize(vertival: Vertical) {
    // 计算方式 可视区域高/内容高 = 滚动条区域高/滚动条内容总高
    // scrollBarContainer.clientHeight是创建scrollBarContainer是容器的高度，这个高度可以和container容器一样高，也可以自定义，公式是成立的
    // container.clientHeight / container.scrollHeight = bar.height / scrollBarContainer.clientHeight
    // container.clientHeight / container.scrollHeight = x / scrollBarContainer.clientHeight  //求x的值
    // x = container.clientHeight * scrollBarContainer.clientHeight / container.scrollHeight
    const scrollClientHeight = vertival.scrollClientHeight
    let sliderHeight = 0
    // 当内容高度大于可视区域高度时才会有滚动条
    if (vertival.scrollHeight > vertival.clientHeight) {
        sliderHeight = vertival.clientHeight * scrollClientHeight / vertival.scrollHeight
    }
    // 滑块要给一个最小值
    if (sliderHeight > 0 && sliderHeight < 20) {
        sliderHeight = 20
    }
    return {
        sliderHeight,
        sliderMaxTop: scrollClientHeight - sliderHeight,
        maxScrollTop: vertival.scrollHeight - vertival.clientHeight,
    }
}

/**
 * @desc 计算纵向slider位置
 * @param {*} container 
 * @param {*} scrollBarContainer 
 * @param {*} slider 
 * @param {*} scrollTop 
 */
export function calcVerticalSliderTop(container, scrollBarContainer, slider, scrollTop = 0) {
    const canScrollTopPx = container.scrollHeight - container.clientHeight
    const scrollPercentage = scrollTop / canScrollTopPx
    const canScrollBarPx = scrollBarContainer.clientHeight - slider.clientHeight
    const top = canScrollBarPx * scrollPercentage
    return top
}

/**
 * @desc 计算横行滚动条滑块大小
 */
export function calcHorizontalSliderSize(horizontal: Horizontal) {
    const scrollClientWidth = horizontal.scrollClientWidth
    let sliderWidth = 0
    if (horizontal.scrollWidth > horizontal.clientWidth) {
        sliderWidth = horizontal.clientWidth * scrollClientWidth / horizontal.scrollWidth
    }
    if (sliderWidth > 0 && sliderWidth < 20) {
        sliderWidth = 20
    }
    return {
        sliderWidth,
        sliderMaxLeft: scrollClientWidth - sliderWidth,
        maxScrollLeft: horizontal.scrollWidth - horizontal.clientWidth,
    }
}

/**
 * @desc 计算横行滚动条slider位置
 * @param {*} container 
 * @param {*} scrollBarContainer 
 * @param {*} slider 
 * @param {*} scrollLeft 
 */
export function calcHorizontalSliderLeft(container, scrollBarContainer, slider, scrollLeft = 0) {
    const canScrollLeftPx = container.scrollWidth - container.clientWidth
    const scrollPercentage = scrollLeft / canScrollLeftPx
    const canScrollBarPx = scrollBarContainer.clientWidth - slider.clientWidth
    const left = canScrollBarPx * scrollPercentage
    return left
}

export function getScrollTopBySliderMoveY(vertical: Vertical, verticalEventRecord: VerticalEventRecord, mouseMoveY: number) {
    const p = mouseMoveY / vertical.sliderMaxTop
    const scrollTop = vertical.maxScrollTop * p + verticalEventRecord.scrollTop

    return scrollTop
}


export function getScrollLeftBySliderMoveX(horizontal: Horizontal, horizontalEventRecord: HorizontalEventRecord, mouseMoveX: number) {
    const p = mouseMoveX / horizontal.sliderMaxLeft
    const scrollLeft = horizontal.maxScrollLeft * p + horizontalEventRecord.scrollLeft

    return scrollLeft
}