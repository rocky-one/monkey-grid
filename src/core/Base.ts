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
            clientHeight: 400,
            scrollHeight: 1200,
            clientWidth: 300,
            scrollWidth: 1200,
            eventBindEle:  this.container,
            // verticalScrollCb: this.verticalScrollCb,
            // horizontalScrollCb: horizontalScrollCb
        })
    }
    private verticalScrollCb = (top) => {
        // console.log(top, 'top')
    }
}

export default Base;