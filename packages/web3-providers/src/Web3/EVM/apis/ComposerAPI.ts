import { Composer as EVMComposer } from '@masknet/web3-shared-evm'
import { Nonce } from '../middleware/Nonce.js'
import { Translator } from '../middleware/Translator.js'
import { Interceptor } from '../middleware/Interceptor.js'
import { RecentTransaction } from '../middleware/RecentTransaction.js'
import { TransactionWatcher } from '../middleware/TransactionWatcher.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import type { WalletAPI } from '../../../entry-types.js'
import { Permit } from '../middleware/Permit.js'

let instance: EVMComposer<ConnectionContext> | undefined
export class Composer {
    static compose(signWithPersona: WalletAPI.SignWithPersona) {
        if (instance) return instance

        instance = EVMComposer.from<ConnectionContext>(
            new Permit(),
            Nonce,
            new Translator(),
            new Interceptor(signWithPersona),
            new RecentTransaction(),
            new TransactionWatcher(),
        )
        return instance
    }
}
