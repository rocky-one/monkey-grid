// 绑定鼠标按下事件
export function mouseDown(ele: HTMLElement, cb: Function) {
  ele.addEventListener('mousedown', cb)
}
// 鼠标按下移除事件
export function removeMouseDown(ele: HTMLElement, cb: Function) {
  ele.removeEventListener('mousedown', cb)
}

// 鼠标move事件
export function mouseMove(ele: HTMLElement, cb: Function) {
  ele.addEventListener('mousemove', cb)
}
export function removeMouseMove(ele: HTMLElement, cb: Function) {
  ele.removeEventListener('mousemove', cb)
}

// 鼠标up事件
export function mouseUp(ele: HTMLElement, cb: Function) {
  ele.addEventListener('mouseup', cb)
}
export function removeMouseUp(ele: HTMLElement, cb: Function) {
  ele.removeEventListener('mouseup', cb)
}

export function mouseEvent(ele: HTMLElement, fn?: Function) {
  mouseDown(ele, fn)
  mouseMove(ele, fn)
  mouseUp(ele, fn)
}