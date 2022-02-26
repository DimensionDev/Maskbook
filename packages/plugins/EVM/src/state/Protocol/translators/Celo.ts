import type { Context } from '../types'
import { Base } from './Base'

export class Celo extends Base {
    override encode(context: Context) {
        throw new Error('Method not implemented.')
    }
    override decode(context: Context) {
        throw new Error('Method not implemented.')
    }
}
