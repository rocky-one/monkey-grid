import { Vertical, Horizontal } from './ScrollInterface'
import { calcVerticalSliderTop, calcHorizontalSliderLeft } from '../utils/calcUtils'

export function updateVerticalSliderTop(vertical: Vertical): Vertical {
    const sliderTop = calcVerticalSliderTop(
        {
            scrollHeight: vertical.scrollHeight,
            clientHeight: vertical.clientHeight
        },
        {
            clientHeight: vertical.scrollClientHeight
        },
        // vertical.viewSlider,
        vertical.sliderHeight,
        vertical.scrollTop
    )
    // vertical.viewSlider.style.top = `${sliderTop}px`
    vertical.sliderTop = sliderTop;
    return vertical
}

export function updateVerticalScrollTop(vertical: Vertical, scrollTop: number = 0, cover: boolean = false): Vertical {
    if (cover) {
        vertical.scrollTop = scrollTop
    } else {
        vertical.scrollTop += scrollTop
    }
    if (vertical.scrollTop >= vertical.maxScrollTop) {
        vertical.scrollTop = vertical.maxScrollTop
    } else if (vertical.scrollTop <= 0) {
        vertical.scrollTop = 0
    }
    return vertical
}

/**
 * @desc 鼠标滚动后更新scroll信息
 */
export function updateVerticalScroll(vertical: Vertical, scrollTop: number, cover: boolean = false): Vertical {
    updateVerticalScrollTop(vertical, scrollTop, cover)
    updateVerticalSliderTop(vertical)
    return vertical
}



export function updateHorizotalSliderLeft(horizotal: Horizontal): Horizontal {
    const sliderLeft = calcHorizontalSliderLeft(
        {
            scrollWidth: horizotal.scrollWidth,
            clientWidth: horizotal.clientWidth
        },
        {
            clientWidth: horizotal.scrollClientWidth
        },
        // horizotal.viewSlider,
        horizotal.sliderWidth,
        horizotal.scrollLeft
    )
    // horizotal.viewSlider.style.left = `${sliderLeft}px`
    horizotal.sliderLeft = sliderLeft;
    return horizotal
}

export function updateHorizotalScrollLeft(horizotal: Horizontal, scrollLeft: number = 0, cover: boolean = false): Horizontal {
    if (cover) {
        horizotal.scrollLeft = scrollLeft
    } else {
        horizotal.scrollLeft += scrollLeft
    }

    if (horizotal.scrollLeft >= horizotal.maxScrollLeft) {
        horizotal.scrollLeft = horizotal.maxScrollLeft
    } else if (horizotal.scrollLeft <= 0) {
        horizotal.scrollLeft = 0
    }
    return horizotal
}

export function updateHorizotalScroll(horizotal: Horizontal, scrollLeft: number, cover: boolean = false): Horizontal {
    updateHorizotalScrollLeft(horizotal, scrollLeft, cover)
    updateHorizotalSliderLeft(horizotal)
    return horizotal
}