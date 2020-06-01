import { Vertical } from './ScrollInterface'
import { calcVerticalSliderTop } from './calc'

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