export interface ContainerV {
    clientHeight: number,
    scrollHeight?: number,
}

export interface ContainerH {
    clientWidth: number,
    scrollWidth?: number,
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
    viewSlider?: HTMLElement
}