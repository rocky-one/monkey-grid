export interface ContainerV {
    clientHeight: number
    verticalScrollCb: Function
    scrollHeight?: number
}

export interface ContainerH {
    clientWidth: number
    horizontalScrollCb: Function
    scrollWidth?: number
}

export interface ScrollBarOptions extends ContainerV,ContainerH {
    ele: HTMLElement,
    eventBindEle: HTMLElement
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
    mouseMoveIng: Boolean,
    mouseMoveY: number
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