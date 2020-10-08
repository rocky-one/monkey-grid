import { Vertical, Horizontal } from './ScrollInterface'
import { calcVerticalSliderTop, calcHorizontalSliderLeft } from './calc'

export function updateVerticalSliderTop(vertical: Vertical):Vertical {
    const sliderTop = calcVerticalSliderTop(
        {
        scrollHeight: vertical.scrollHeight,
        clientHeight: vertical.clientHeight
        },
        {
            clientHeight: vertical.scrollClientHeight
        }, 
        vertical.viewSlider, 
        vertical.scrollTop
    )
    vertical.viewSlider.style.top = `${sliderTop}px`
    vertical.sliderTop = sliderTop;
    return vertical
}

export function updateVerticalScrollTop(vertical: Vertical, scrollTop: number = 0):Vertical {
    vertical.scrollTop += scrollTop
    if(vertical.scrollTop >= vertical.maxScrollTop){
        vertical.scrollTop = vertical.maxScrollTop
    }else if(vertical.scrollTop <= 0){
        vertical.scrollTop = 0
    }
    return vertical
}

/**
 * @desc 鼠标滚动后更新scroll信息
 */
export function updateVerticalScroll(vertical: Vertical, scrollTop: number):Vertical  {
    updateVerticalScrollTop(vertical, scrollTop)
    updateVerticalSliderTop(vertical)
    return vertical
}



export function updateHorizotalSliderLeft(horizotal: Horizontal):Horizontal {
    const sliderLeft = calcHorizontalSliderLeft(
        {
            scrollWidth: horizotal.scrollWidth,
            clientWidth: horizotal.clientWidth
        },
        {
            clientWidth: horizotal.scrollClientWidth
        }, 
        horizotal.viewSlider, 
        horizotal.scrollLeft
    )
    horizotal.viewSlider.style.left = `${sliderLeft}px`
    horizotal.sliderLeft = sliderLeft;
    return horizotal
}

export function updateHorizotalScrollLeft(horizotal: Horizontal, scrollLeft: number = 0):Horizontal {
    horizotal.scrollLeft += scrollLeft
    if(horizotal.scrollLeft >= horizotal.maxScrollLeft){
        horizotal.scrollLeft = horizotal.maxScrollLeft
    }else if(horizotal.scrollLeft <= 0){
        horizotal.scrollLeft = 0
    }
    return horizotal
}

export function updateHorizotalScroll(horizotal: Horizontal, scrollLeft: number): Horizontal {
    updateHorizotalScrollLeft(horizotal, scrollLeft)
    updateHorizotalSliderLeft(horizotal)
    return horizotal
}