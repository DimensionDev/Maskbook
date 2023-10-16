import { Composer } from '@masknet/web3-shared-evm'
import { Nonce } from '../middleware/Nonce.js'
import { Translator } from '../middleware/Translator.js'
import { Interceptor } from '../middleware/Interceptor.js'
import { RecentTransaction } from '../middleware/RecentTransaction.js'
import { TransactionWatcher } from '../middleware/TransactionWatcher.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import type { WalletAPI } from '../../../entry-types.js'

export class ComposerAPI {
    private instance: Composer<ConnectionContext> | undefined

    compose(signWithPersona: WalletAPI.IOContext['signWithPersona']) {
        if (this.instance) return this.instance

        const instance = Composer.from<ConnectionContext>(
            new Nonce(),
            new Translator(),
            new Interceptor(signWithPersona),
            new RecentTransaction(),
            new TransactionWatcher(),
        )

        this.instance = instance
        return instance
    }
}
