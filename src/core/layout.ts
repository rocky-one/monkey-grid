import  * as domCore from '../utils/dom'
import { FOOTER_HEIGHT } from './const'
export function layout(container: HTMLElement, width: number, height: number){
    const containerBox = createContainer({
        style:`width:${width}px;height:${height}px`
    })
    const footerBox = domCore.createDom('div', {
        class: 'mg-footer',
        style: `height:${FOOTER_HEIGHT}px`,
    })
    const canvas = domCore.createCanvas({width, height: height - FOOTER_HEIGHT})
    containerBox.appendChild(canvas)
    containerBox.appendChild(footerBox)
    container.appendChild(containerBox)

    return {
        container: containerBox,
        canvas,
        footerBox
    }
}

function createContainer(attrs: Object): HTMLElement {
    const mgContainer = domCore.createDom('div', {
        class: 'mg-container',
        ...attrs
    })
    return mgContainer
}