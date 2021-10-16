import Point from './Point'
import { SheetOptions } from '../interface/SheetInterface'
export default class Sheet extends Point{
  constructor(options: SheetOptions) {
    super(options)
  }
}