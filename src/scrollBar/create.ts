import { createDom, setDomCss } from '../utils/dom'
import { calcVerticalSliderSize, calcVerticalSliderTop } from './utils'
import { ContainerV } from './ScrollInterface'

export function createVerticalScroll(ele: HTMLElement, container: ContainerV, scrollBarContainer: ContainerV) {
    const vScrollBox = createDom('div')
    setDomCss(vScrollBox, {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '14px',
        height: `${container.clientHeight}px`,
        zIndex: 20,
        border: '1px solid red'
    })
    const sliderSize = calcVerticalSliderSize(container, scrollBarContainer)
    const vSlider = createDom('div')
    setDomCss(vSlider, {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '10px',
        height: `${sliderSize.sliderHeight}px`,
        border: '1px solid red'
    })
    vScrollBox.appendChild(vSlider)
    ele.appendChild(vScrollBox)
    
    return {
        viewScroll: vScrollBox,
        viewSlider: vSlider,
        maxScrollTop: container.scrollHeight - container.clientHeight,
        ...sliderSize
    }
}

export function updateVerticalSliderPos(
    container: ContainerV,
    scrollBarContainer: ContainerV,
    slider: HTMLElement,
    scrollTop: number = 0
):object{
    const sliderTop = calcVerticalSliderTop(container, scrollBarContainer, slider, scrollTop)
    slider.style.top = `${sliderTop}px`
    return {
        sliderTop
    }
}