
interface Describe {
    fn: Function,
    data: any[],
    key: string,
    [attr: string]: any
}
interface Options {
    sheet: any
}

class Record {
    constructor(options: Options) {
        this.sheet = options.sheet
    }
    sheet: any
    queue: any[] = []
    current: number = -1
    // 标记是否在回撤中做了新的修改，如果是 则从当前的修改位置开始记录，后面的记录截取掉
    editFlag: boolean = false
    add = (describe: Describe) => {
        if (this.editFlag && this.current > -1) {
            this.queue.splice(this.current + 1)
            this.editFlag = false
        }
        this.current++
        this.queue.push(describe)
    }
    undo = () => {
        if (this.current === -1 || this.queue.length === 0) return
        const item = this.queue[this.current]
        this.run(item.undo)
        this.current--
        this.editFlag = true
    }
    redo = () => {
        if (this.current === this.queue.length - 1 || this.queue.length === 0) return
        this.current++
        const item = this.queue[this.current]
        this.run(item.redo)
        this.editFlag = true
    }
    run = (item: any) => {
        Object.keys(item).forEach(key => {
            // 当前实例上有这个方法，说明是需要被包装的
            if (this[key]) {
                this[key](item[key])
            // 当前实例没有此方法，调用sheet实例上的方法
            } else {
                this.sheet[key](item[key])
            }
        })
    }
    setCellValue = (data: any) => {
        setTimeout(() => {
            // 注意：回撤时input框也会响应键盘的快捷键，会把值设置为错误，当input失去焦点时错误的值赋给了sheet，所以在此把input中的value设置成正确的
            this.sheet.textareaInstance.setValue(this.sheet.selectedCell.value)
            
            data.forEach((cur: any) => {
                this.sheet.setCellValue(cur.row, cur.col, cur.value, cur.extend)
            })
        }, 20)
    }
}

export default Record