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
    const canvas = domCore.createCanvas({width: width - 2, height: height - FOOTER_HEIGHT - 2})
    containerBox.appendChild(canvas)
    containerBox.appendChild(footerBox)
    container.innerHTML = ''
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

export function createDragColLine(container: HTMLElement) {
    const colLine = domCore.createDom('div', {
        class: 'mg-drag-col-line'
    })
    container.appendChild(colLine)
    return colLine
}

export function createDragRowLine(container: HTMLElement) {
    const rowLine = domCore.createDom('div', {
        class: 'mg-drag-row-line'
    })
    container.appendChild(rowLine)
    return rowLine
}

export function updateLine(ele: HTMLElement, attrs: any) {
    Object.keys(attrs).forEach(key => {
        ele.style[key] = attrs[key]
    })
}