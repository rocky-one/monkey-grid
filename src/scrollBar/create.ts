import { createDom, setDomCss } from '../utils/dom'
import { calcVerticalSliderSize, calcVerticalSliderTop, calcHorizontalSliderSize } from './calc'
import { Vertical, Horizontal } from './ScrollInterface'

export function createVerticalScroll(ele: HTMLElement, vertical: Vertical) {
    const sliderSize = calcVerticalSliderSize(vertical)
    const vScrollBox = createDom('div')
    setDomCss(vScrollBox, {
        display: sliderSize.sliderHeight > 0 ? 'block' : 'none',
        position: 'absolute',
        right: 0,
        top: 0,
        width: '14px',
        height: `${vertical.clientHeight}px`,
        zIndex: 20,
        border: '1px solid #ccc'
    })
    const vSlider = createDom('div')
    setDomCss(vSlider, {
        position: 'absolute',
        right: "1px",
        top: 0,
        width: '10px',
        height: `${sliderSize.sliderHeight}px`,
        border: '1px solid #ccc'
    })
    vScrollBox.appendChild(vSlider)
    ele.appendChild(vScrollBox)
    
    return {
        viewScroll: vScrollBox,
        viewSlider: vSlider,
        maxScrollTop: vertical.scrollHeight - vertical.clientHeight,
        ...sliderSize
    }
}

export function createHorizontalScroll(ele: HTMLElement, horizontal: Horizontal) {
    const sliderSize = calcHorizontalSliderSize(horizontal)
    const hScrollBox = createDom('div')
    setDomCss(hScrollBox, {
        display: sliderSize.sliderWidth > 0 ? 'block' : 'none',
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${horizontal.clientWidth}px`,
        height: '14px',
        zIndex: 20,
        border: '1px solid #ccc'
    })
    const hSlider = createDom('div')
    setDomCss(hSlider, {
        position: 'absolute',
        left: "1px",
        top: 0,
        width: `${sliderSize.sliderWidth}px`,
        height: '10px',
        border: '1px solid #ccc'
    })
    hScrollBox.appendChild(hSlider)
    ele.appendChild(hScrollBox)
    
    return {
        viewScroll: hScrollBox,
        viewSlider: hSlider,
        maxScrollLeft: horizontal.scrollWidth - horizontal.clientWidth,
        ...sliderSize
    }

}
export function setNodeStyle(node: HTMLElement, style: object) {
    Object.keys(style).forEach(key => {
        node.style[key] = style[key]
    })
}
