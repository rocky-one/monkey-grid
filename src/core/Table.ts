import { initData } from '../utils/helper'


export interface TableOptions{
    name: string,
    row: number,
    col: number,
    dataSource: any,
    xOffset: number,
    yOffset: number
}
class Table {
    constructor(options: TableOptions) {
        this.name = options.name
        this.row = options.row
        this.col = options.col
        this.dataSource = initData(options.dataSource, options.xOffset, options.yOffset)
    }
    name: string
    row: number
    col: number
    dataSource: any[]
    public getData = () => {
        return this.dataSource
    }
    public destroy = () => {
        this.dataSource = null
    }
}

export default Table