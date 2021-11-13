import { createDom, setDomCss } from '../utils/dom'
import { calcVerticalSliderSize, calcVerticalSliderTop, calcHorizontalSliderSize } from './calc'
import { Vertical, Horizontal } from './ScrollInterface'

export function createVerticalScroll(vertical: Vertical, ele?: HTMLElement) {
    const sliderSize = calcVerticalSliderSize(vertical)
    const vScrollBox = createDom('div')
    setDomCss(vScrollBox, {
        display: sliderSize.sliderHeight > 0 ? 'block' : 'none',
        position: 'absolute',
        right: 0,
        top: 0,
        width: '14px',
        height: `${vertical.scrollClientHeight}px`,
        zIndex: 20,
        backgroundColor: '#f5f3f3'
    })
    const vSlider = createDom('div', {
        class: 'mg-scroll-bar mg-scroll-bar-v'
    })
    setDomCss(vSlider, {
        position: 'absolute',
        right: "1px",
        top: 0,
        width: '8px',
        height: `${sliderSize.sliderHeight}px`,
        borderRadius: '8px'
    })
    vScrollBox.appendChild(vSlider)
    ele && ele.appendChild(vScrollBox)

    return {
        viewScroll: vScrollBox,
        viewSlider: vSlider,
        maxScrollTop: vertical.scrollHeight - vertical.clientHeight,
        ...sliderSize
    }
}

export function createHorizontalScroll(horizontal: Horizontal, ele?: HTMLElement) {
    const sliderSize = calcHorizontalSliderSize(horizontal)
    const hScrollBox = createDom('div')
    setDomCss(hScrollBox, {
        display: sliderSize.sliderWidth > 0 ? 'block' : 'none',
        position: 'relative',
        width: `${horizontal.scrollClientWidth}px`,
        height: '14px',
        zIndex: 20,
        // backgroundColor: '#f5f3f3'
    })
    const hSlider = createDom('div', {
        class: 'mg-scroll-bar mg-scroll-bar-h'
    })
    setDomCss(hSlider, {
        position: 'absolute',
        left: '1px',
        top: '1px',
        width: `${sliderSize.sliderWidth}px`,
        height: '10px',
        borderRadius: '8px',
        marginTop: '1px'
    })
    hScrollBox.appendChild(hSlider)
    ele && ele.appendChild(hScrollBox)

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
