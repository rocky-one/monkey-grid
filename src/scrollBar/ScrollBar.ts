import {
    calcVerticalSliderSize,
    calcHorizontalSliderSize,
} from './calc'
import { explorerType } from '../utils/helper'
import { createVerticalScroll } from './create'
import { updateVerticalScrollTop, updateVerticalSliderTop, } from './update'
import { ScrollBarOptions, Vertical } from './ScrollInterface'
class ScrollBar {
    constructor(options: ScrollBarOptions) {
        this.options = options
        this.updateVertical(createVerticalScroll(
            this.options.ele, 
            {
                scrollHeight: this.options.scrollHeight,
                clientHeight: this.options.clientHeight
            },
            {
                clientHeight: this.options.clientHeight
            }
        ))
        this.bind()
    }
    options: ScrollBarOptions
    vertical: Vertical = {
        scrollTop: 0,
        maxScrollTop: 0
    }
    verticalScrollView: any
    private bind = () => {
        this.options.eventBindEle.addEventListener(explorerType === 'Firefox' ? 'DOMMouseScroll' : 'mousewheel', (e: WheelEvent) => {
            const { deltaX, deltaY } = e
            if(deltaY < 0){
                console.log('向上滚动')
                if(this.vertical.sliderTop <= 0) return
            }else if(deltaY > 0){
                console.log('向下滚动')
                if(this.vertical.sliderTop >= this.vertical.sliderMaxTop) {
                    return
                }

            }
            // if(deltaX < 0){
            //     console.log('向右滚动')
            // }else if(deltaX > 0){
            //     console.log('向左滚动')
            // }
            // this.vertical.scrollTop = this.vertical.scrollTop + deltaY * 10;
            updateVerticalScrollTop(this.vertical, deltaY * 10)
            const sliderTop = updateVerticalSliderTop(
                {
                scrollHeight: this.options.scrollHeight,
                clientHeight: this.options.clientHeight
                },
                {
                    clientHeight: this.options.clientHeight
                },
                this.vertical
            )
            this.updateVertical(sliderTop)
            console.log(this.vertical)

        })
    }
    private updateVertical = (vertical: Vertical = {}) => {
        this.vertical = Object.assign(this.vertical, vertical);
    }
}

export default ScrollBar