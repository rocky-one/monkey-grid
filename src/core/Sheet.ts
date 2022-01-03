import Paint from './Paint'
import { SheetOptions } from '../interface/SheetInterface'
export default class Sheet extends Paint{
  constructor(options: SheetOptions) {
    super(options)
  }
}