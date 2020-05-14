import  * as domCore from '../utils/dom'

export function layout(container: HTMLElement, width: Number, height: Number){
    const containerBox = createContainer({
        style:`width:${width}px;height:${height}px`
    })
    const canvas = domCore.createCanvas({width, height})
    containerBox.appendChild(canvas)
    container.appendChild(containerBox)
}

function createContainer(attrs: Object): HTMLElement {
    const mgContainer = domCore.createDom('div', {
        class: 'm-g-container',
        ...attrs
    })
    return mgContainer
}