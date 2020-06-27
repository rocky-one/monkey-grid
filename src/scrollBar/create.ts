import { createDom, setDomCss } from '../utils/dom'
import { calcVerticalSliderSize, calcVerticalSliderTop } from './calc'
import { Vertical } from './ScrollInterface'

export function createVerticalScroll(ele: HTMLElement, vertical: Vertical) {
    const vScrollBox = createDom('div')
    setDomCss(vScrollBox, {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '14px',
        height: `${vertical.clientHeight}px`,
        zIndex: 20,
        border: '1px solid #ccc'
    })
    const sliderSize = calcVerticalSliderSize(vertical)
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

export function setNodeStyle(node: HTMLElement, style: object) {
    Object.keys(style).forEach(key => {
        node.style[key] = style[key]
    })
}
