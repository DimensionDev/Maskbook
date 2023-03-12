import { Composer, type ConnectionContext } from '@masknet/web3-shared-evm'
import { AddressBook } from './AddressBook.js'
import { Interceptor } from './Interceptor.js'
import { Nonce } from './Nonce.js'
import { Squash } from './Squash.js'
import { RecentTransaction } from './RecentTransaction.js'
import { Translator } from './Translator.js'
import { TransactionWatcher } from './TransactionWatcher.js'

const composer = Composer.from<ConnectionContext>(
    new Squash(),
    new Nonce(),
    new Translator(),
    new Interceptor(),
    new RecentTransaction(),
    new TransactionWatcher(),
    new AddressBook(),
)

export function dispatch(context: ConnectionContext, next: () => Promise<void>) {
    return composer.dispatch(context, next)
}
