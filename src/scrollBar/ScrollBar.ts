import {
    calcVerticalSliderSize,
    calcHorizontalSliderSize
} from '../utils/calcUtils';

import { ScrollBarOptions, Vertical, Horizontal } from './ScrollInterface';
import './scrollBarStyle.less';

class ScrollBar {
    constructor(options: ScrollBarOptions) {
        this.options = options;
        this.vertical.clientHeight = this.options.clientHeight;
        this.vertical.scrollHeight = this.options.scrollHeight;
        this.vertical.scrollClientHeight = this.options.scrollClientHeight;

        this.horizontal.clientWidth = this.options.clientWidth;
        this.horizontal.scrollWidth = this.options.scrollWidth;
        this.horizontal.scrollClientWidth = this.options.scrollClientWidth;

        const sliderVSize = calcVerticalSliderSize(this.vertical);
        this.updateVertical(sliderVSize);
        const sliderHSize = calcHorizontalSliderSize(this.horizontal);
        this.updateHorizontal(sliderHSize);
    }
    options: ScrollBarOptions;
    vertical: Vertical = {
        scrollTop: 0,
        maxScrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
        scrollClientHeight: 0,
        sliderHeight: 0,
        sliderTop: 0
    };
    horizontal: Horizontal = {
        scrollLeft: 0,
        maxScrollLeft: 0,
        scrollWidth: 0,
        clientWidth: 0,
        scrollClientWidth: 0,
        sliderWidth: 0,
        sliderLeft: 0
    };
    public getVertical = () => {
        return this.vertical;
    }
    public getHorizontal = () => {
        return this.horizontal;
    }
    
    private updateVertical = (vertical: Vertical = {}) => {
        this.vertical = Object.assign(this.vertical, vertical);
    }
    private updateHorizontal = (horizontal: Horizontal) => {
        this.horizontal = Object.assign(this.horizontal, horizontal);
    }
    public destroy = () => {
        this.vertical = null;
        this.horizontal = null;
    }
}

export default ScrollBar;
