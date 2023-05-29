import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Base } from './Base.js'

export class Celo extends Base {
    override async encode(context: ConnectionContext) {
        throw new Error('Method not implemented.')
    }
    override async decode(context: ConnectionContext) {
        throw new Error('Method not implemented.')
    }
}
