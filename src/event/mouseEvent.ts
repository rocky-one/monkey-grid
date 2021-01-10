// 绑定鼠标按下事件
export function mouseDown(ele: HTMLElement, cb?: Function) {
  ele.addEventListener('mouseDown', (event) => {
    cb && cb(event)
  })
}

// 鼠标move事件
export function mouseMove(ele: HTMLElement, cb?: Function) {
  ele.addEventListener('mouseMove', (event) => {
    cb && cb(event)
  })
}

// 鼠标up事件
export function mouseUp(ele: HTMLElement, cb?: Function) {
  ele.addEventListener('mouseUp', (event) => {
    cb && cb(event)
  })
}

export function mouseEvent(ele: HTMLElement) {
  mouseDown(ele)
  mouseMove(ele)
  mouseUp(ele)
}