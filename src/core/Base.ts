import  { layout } from './layout'
import { OptionsInterface } from '../interface/BaseInterface'
import '../style/app.less'
class Base {
    constructor(options: OptionsInterface){
        this.options = options;
        this.container = options.container
        this.init()
    }
    options: OptionsInterface
    container: HTMLElement
    private init() {
        layout(this.container, this.options.width, this.options.height)
    }
}

export default Base;