
export interface SheetOptions {
    name?: string
    rowCount: number
    colCount: number
    layout: any
    canvas: any
    height: number
    width: number
    order?: boolean
    headerOrder?: boolean
    xOffset?: number
    yOffset?: number
    ratio: number
    frozenRowCount?: number
    frozenColCount?: number
    rowHeight?: number
    colWidth?: number
    getScroll?: Function
    active: boolean
}

export interface PaintRange {
    startRowIndex: number
    endRowIndex: number
    startColIndex: number
    endColIndex: number
    boundEndCol: 0
	boundEndRow: 0
}


export interface sheetParams {
    name?: string
    rowCount?: number
    colCount?: number
    frozenRowCount?: number
    frozenColCount?: number
}