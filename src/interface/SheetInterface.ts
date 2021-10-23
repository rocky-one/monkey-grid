import ScrollBar from "scrollBar/ScrollBar";

export interface SheetOptions {
    name: string
    rowCount: number
    colCount: number
    layout: any
    canvas: HTMLCanvasElement
    canvasContext: any
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
}

export interface PointRange {
    startRowIndex: number;
    endRowIndex: number;
    startColIndex: number;
    endColIndex: number;
}


export interface sheetParams {
    name: string
    rowCount?: number
    colCount?: number
    frozenRowCount?: number
    frozenColCount?: number
}