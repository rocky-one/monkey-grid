import  { layout } from './layout'
import { OptionsInterface } from '../interface/BaseInterface'
import ScrollBar from '../scrollBar/ScrollBar'
import { initData } from '../utils/helper'
import '../style/app.less'
class Base {
    constructor(options: OptionsInterface){
        this.options = options
        this.optContainer = options.container
        this.init()
        const data = initData(this.options.data)
    }
    options: OptionsInterface
    optContainer: HTMLElement
    container: HTMLElement
    private init = () => {
        this.container = layout(this.optContainer, this.options.width, this.options.height)
        new ScrollBar({
            ele: this.container,
            direction: ['vertical', 'horizontal'],
            vertical: {
                ele: this.container,
                containerPx: 400,
                contentPx: 1000,
                width: 14,
                height: 400,
                style: {
                    top: `${40}px`,
                }
            },
            horizontal: {
                containerPx: 400,
                contentPx: 1000,
                height: 14,
                style: {
                    left: `${100}px`,
                    // bottom: '-17px'
                }
            },
            eventBindEle:  this.container,
            verticalScrollCb: this.verticalScrollCb,
            // horizontalScrollCb: horizontalScrollCb
        })
    }
    private verticalScrollCb = (top) => {
        // console.log(top, 'top')
    }
}

export default Base;