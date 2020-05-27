import { ContainerV, Vertical } from './ScrollInterface'
import { calcVerticalSliderTop } from './calc'

export function updateVerticalSliderTop(
    container: ContainerV,
    scrollBarContainer: ContainerV,
    vertical: Vertical
):Vertical{
    const sliderTop = calcVerticalSliderTop(container, scrollBarContainer, vertical.viewSlider, vertical.scrollTop)
    vertical.viewSlider.style.top = `${sliderTop}px`
    vertical.sliderTop = sliderTop;
    return vertical
}

export function updateVerticalScrollTop(vertical: Vertical, scrollTop: number = 0): Vertical {
    vertical.scrollTop += scrollTop
    if(vertical.scrollTop >= vertical.maxScrollTop){
        vertical.scrollTop = vertical.maxScrollTop
    }else if(vertical.scrollTop <= 0){
        vertical.scrollTop = 0
    }
    return vertical
}