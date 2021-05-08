// 绑定鼠标按下事件
export function mouseDown(ele: HTMLElement, cb?: Function) {
  ele.addEventListener('mousedown', (event) => {
    cb && cb(event)
  })
}

// 鼠标move事件
export function mouseMove(ele: HTMLElement, cb?: Function) {
  ele.addEventListener('mousemove', (event) => {
    cb && cb(event)
  })
}

// 鼠标up事件
export function mouseUp(ele: HTMLElement, cb?: Function) {
  ele.addEventListener('mouseup', (event) => {
    cb && cb(event)
  })
}

export function mouseEvent(ele: HTMLElement, fn?: Function) {
  mouseDown(ele, fn)
  mouseMove(ele, fn)
  mouseUp(ele, fn)
}