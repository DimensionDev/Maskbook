import { Composer as EVMComposer } from '@masknet/web3-shared-evm'
import { Nonce } from '../middleware/Nonce.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

let instance: EVMComposer<ConnectionContext> | undefined
export class Composer {
    static compose() {
        if (instance) return instance

        instance = EVMComposer.from<ConnectionContext>(Nonce)
        return instance
    }
}
