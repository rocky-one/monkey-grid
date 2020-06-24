import { initData } from '../utils/helper'

class Table {
    constructor(name: string, row: number, col: number, dataSource: any []) {
        this.name = name
        this.row = row
        this.col = col
        this.dataSource = initData(dataSource)
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