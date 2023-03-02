import { Composer, type ConnectionContext } from '@masknet/web3-shared-evm'
import { AddressBook } from './middleware/AddressBook.js'
import { Interceptor } from './middleware/Interceptor.js'
import { Nonce } from './middleware/Nonce.js'
import { Squash } from './middleware/Squash.js'
import { RecentTransaction } from './middleware/RecentTransaction.js'
import { Translator } from './middleware/Translator.js'
import { TransactionWatcher } from './middleware/TransactionWatcher.js'

const composer = Composer.from<ConnectionContext>([
    new Squash(),
    new Nonce(),
    new Translator(),
    new Interceptor(),
    new RecentTransaction(),
    new TransactionWatcher(),
    new AddressBook(),
])

export function dispatch(context: ConnectionContext, next: () => Promise<void>) {
    return composer.dispatch(context, next)
}
