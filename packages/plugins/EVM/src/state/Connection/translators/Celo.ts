import type { Context } from '../types'
import { Base } from './Base'

export class Celo extends Base {
    override async encode(context: Context) {
        throw new Error('Method not implemented.')
    }
    override async decode(context: Context) {
        throw new Error('Method not implemented.')
    }
}
