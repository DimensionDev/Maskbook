import { Composer, ConnectionContext } from '@masknet/web3-shared-evm'
import { AddressBook } from './middleware/AddressBook.js'
import { Interceptor } from './middleware/Interceptor.js'
import { Nonce } from './middleware/Nonce.js'
import { Squash } from './middleware/Squash.js'
import { RecentTransaction } from './middleware/RecentTransaction.js'
import { Translator } from './middleware/Translator.js'
import { TransactionWatcher } from './middleware/TransactionWatcher.js'

const composer = new Composer<ConnectionContext>()

composer.use(new Squash())
composer.use(new Nonce())
composer.use(new Translator())
composer.use(new Interceptor())
composer.use(new RecentTransaction())
composer.use(new TransactionWatcher())
composer.use(new AddressBook())

export function dispatch(context: ConnectionContext, next: () => Promise<void>) {
    return composer.dispatch(context, next)
}
