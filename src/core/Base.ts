import  { layout } from './layout'
import { OptionsInterface } from '../interface/BaseInterface'
import '../style/app.less'
class Base {
    constructor(options: OptionsInterface){
        this.container = options.container
        this.init()
    }
    container: HTMLElement
    private init() {
        layout(this.container)
    }
}

export default Base;