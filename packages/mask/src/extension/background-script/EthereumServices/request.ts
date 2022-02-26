import type { RequestArguments } from 'web3-core'
import { isReadOnlyPayload, ProviderType, RequestOptions, SendOverrides } from '@masknet/web3-shared-evm'
import { currentChainIdSettings, currentProviderSettings } from '../../../plugins/Wallet/settings'
import { createExternalProvider } from './provider'
import { createContext, dispatch, use } from './composer'
import { Logger } from './middlewares/Logger'
import { Squash } from './middlewares/Squash'
import { Nonce } from './middlewares/Nonce'
import { Interceptor } from './middlewares/Interceptor'
import { Translator } from './middlewares/Translator'
import { RecentTransaction } from './middlewares/Transaction'
import { TransactionNotifier } from './middlewares/TransactionNotifier'
import { TransactionWatcher } from './middlewares/TransactionWatcher'

use(new Logger())
use(new Squash())
use(new Nonce())
use(new Translator())
use(new Interceptor())
use(new RecentTransaction())
use(new TransactionNotifier())
use(new TransactionWatcher())

export async function request<T extends unknown>(
    requestArguments: RequestArguments,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    const { providerType = currentProviderSettings.value, chainId = currentChainIdSettings.value } = overrides ?? {}

    return new Promise<T>(async (resolve, reject) => {
        const context = createContext(requestArguments, overrides, options)

        await dispatch(context, async () => {
            try {
                // create request provider
                const externalProvider = await createExternalProvider(
                    chainId,
                    isReadOnlyPayload(context.request) ? ProviderType.MaskWallet : providerType,
                )
                if (!externalProvider?.request) throw new Error('Failed to create provider.')

                // send request and set result in the context
                const result = (await externalProvider?.request?.(requestArguments)) as T
                context.write(result)
            } catch (error) {
                context.abort(error, 'Failed to send request.')
            }
        })

        if (context.error) reject(context.error)
        else resolve(context.result as T)
    })
}
