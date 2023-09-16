import { ValueRefWithReady } from '@masknet/shared-base'
import { BaseContextAPI } from './BaseAPI.js'
import type { WalletAPI } from '../../entry-types.js'

type Context = Pick<WalletAPI.IOContext, 'signWithPersona' | 'send'>

export const SharedContextRef = new ValueRefWithReady<Context>()

export class SharedContextAPI extends BaseContextAPI<Context> {
    constructor() {
        super(SharedContextRef)
    }
}
