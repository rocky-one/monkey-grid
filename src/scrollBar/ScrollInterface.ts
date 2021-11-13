export interface ContainerV {
    // 内容可视区域高度
    clientHeight: number
    // 滚动条容器高度
    scrollClientHeight: number
    // 内容总高度
    scrollHeight?: number
    // verticalScrollCb: Function
}

export interface ContainerH {
    clientWidth: number
    scrollClientWidth: number
    // horizontalScrollCb: Function
    scrollWidth?: number
}

export interface ScrollBarOptions extends ContainerV,ContainerH {
    ele?: HTMLElement
    verticalEle?: HTMLElement
    horizontalEle?: HTMLElement
    eventBindEle: HTMLElement
    layout?: any
}

export interface Vertical {
    scrollTop?: number,
    maxScrollTop?: number,
    sliderTop?: number,
    sliderMaxTop?: number,
    viewScroll?: HTMLElement,
    viewSlider?: HTMLElement,
    scrollHeight?: number,
    clientHeight?: number,
    scrollClientHeight?: number,
    sliderHeight?: number
}

export interface VerticalEventRecord {
    mouseDownPageX: number,
    mouseDownPageY: number,
    mouseDownFlag: Boolean,
    mouseMoveY: number,
    scrollTop: number,
    preVY: number,
    preMoveVY: number
}

export interface HorizontalEventRecord {
    mouseDownPageX: number,
    mouseDownPageY: number,
    mouseDownFlag: Boolean,
    mouseMoveY: number,
    scrollLeft: number,
    preHX: number,
    preMoveHX: number
}

export interface Horizontal {
    scrollLeft?: number,
    maxScrollLeft?: number,
    sliderLeft?: number,
    sliderMaxLeft?: number,
    viewScroll?: HTMLElement,
    viewSlider?: HTMLElement,
    scrollWidth?: number,
    clientWidth?: number,
    scrollClientWidth?: number,
    sliderWidth?: number
}