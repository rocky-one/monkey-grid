
export interface TableOptions{
    name: string,
    row: number,
    col: number,
    dataSource: any,
    sheet: any
}
class Table {
    constructor(options: TableOptions) {
        this.name = options.name
        this.row = options.row
        this.col = options.col
        this.sheet = options.sheet
        this.dataSource = options.dataSource
    }
    name: string
    row: number
    col: number
    sheet: any
    dataSource: any[]
    public getData = () => {
        return this.dataSource
    }
    public destroy = () => {
        this.dataSource = null
    }
}

export default Table