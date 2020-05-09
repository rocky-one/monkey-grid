import  * as domCore from '../utils/dom'

export function layout(container: HTMLElement){
    container.appendChild(createContainer())
}

function createContainer(): HTMLElement {
    const mgContainer = domCore.createDom('div', {
        class: 'm-g-container'
    })
    return mgContainer
}