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
        console.log(JSON.parse(JSON.stringify(this.dataSource)), 'this.dataSource')
    }
    name: string
    row: number
    col: number
    dataSource: any[]
    public getData = () => {
        return this.dataSource
    }
}

export default Table