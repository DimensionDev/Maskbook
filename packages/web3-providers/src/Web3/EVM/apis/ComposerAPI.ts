import { Composer as EVMComposer } from '@masknet/web3-shared-evm'
import { Nonce } from '../middleware/Nonce.js'
import { Translator } from '../middleware/Translator.js'
import { Interceptor } from '../middleware/Interceptor.js'
import { TransactionWatcher } from '../middleware/TransactionWatcher.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import type { WalletAPI } from '../../../entry-types.js'

let instance: EVMComposer<ConnectionContext> | undefined
export class Composer {
    static compose(signWithPersona: WalletAPI.SignWithPersona) {
        if (instance) return instance

        instance = EVMComposer.from<ConnectionContext>(
            Nonce,
            new Translator(),
            new Interceptor(signWithPersona),
            new TransactionWatcher(),
        )
        return instance
    }
}
