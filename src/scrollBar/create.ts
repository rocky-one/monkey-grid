import { createDom, setDomCss } from '../utils/dom'
import { calcVerticalSliderSize, calcVerticalSliderTop } from './utils'

interface ContainerVertical {
    scrollHeight?: number,
    clientHeight?: number
}
export function createVerticalScroll(ele: HTMLElement, container: ContainerVertical, scrollBarContainer: ContainerVertical) {
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
        height: `${sliderSize.height}px`,
        border: '1px solid red'
    })
    vScrollBox.appendChild(vSlider)
    ele.appendChild(vScrollBox)
    
    return {
        vScroll: vScrollBox,
        vSlider: vSlider
    }
}

export function updateVerticalSliderPos(
    container: ContainerVertical,
    scrollBarContainer: ContainerVertical,
    slider: HTMLElement,
    scrollTop: Number = 0
){
    const top = calcVerticalSliderTop(container, scrollBarContainer, slider, scrollTop)
    console.log(top, scrollTop)
    slider.style.top = `${top}px`

}