import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { EthereumMethodType, ProviderType, RequestOptions, SendOverrides } from '@masknet/web3-shared-evm'
import { createExternalProvider } from './provider'
import { createContext, dispatch, use } from './composer'

// #region middleware
import { Squash } from './middleware/Squash'
import { Nonce } from './middleware/Nonce'
import { Interceptor } from './middleware/Interceptor'
import { Popup } from './middleware/Popup'
import { Translator } from './middleware/Translator'
import { RecentTransaction } from './middleware/Transaction'
import { TransactionNotifier } from './middleware/TransactionNotifier'
import { TransactionWatcher } from './middleware/TransactionWatcher'
import { ExtensionSite } from '@masknet/shared-base'

use(new Squash())
use(new Nonce())
use(new Translator())
use(new Popup())
use(new TransactionNotifier())
use(new TransactionWatcher())
use(new RecentTransaction())
use(new Interceptor())
// #endregion

function isUniversalPayload(payload: JsonRpcPayload) {
    return [
        EthereumMethodType.ETH_GET_CODE,
        EthereumMethodType.ETH_GAS_PRICE,
        EthereumMethodType.ETH_BLOCK_NUMBER,
        EthereumMethodType.ETH_GET_BALANCE,
        EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
        EthereumMethodType.ETH_GET_FILTER_CHANGES,
        EthereumMethodType.ETH_NEW_PENDING_TRANSACTION_FILTER,
        EthereumMethodType.ETH_ESTIMATE_GAS,
        EthereumMethodType.ETH_CALL,
        EthereumMethodType.ETH_GET_LOGS,
    ].includes(payload.method as EthereumMethodType)
}

export async function request<T extends unknown>(
    requestArguments: RequestArguments,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return new Promise<T>(async (resolve, reject) => {
        const context = createContext(requestArguments, overrides, {
            site: ExtensionSite.Popup,
            popupsWindow: true,
            ...options,
        })

        try {
            await dispatch(context, async () => {
                if (!context.writeable) return
                try {
                    // create request provider
                    const externalProvider = await createExternalProvider(
                        context.site,
                        context.chainId,
                        isUniversalPayload(context.request) ? ProviderType.MaskWallet : context.providerType,
                    )
                    if (!externalProvider?.request) throw new Error('Failed to create provider.')

                    // send request and set result in the context
                    const result = (await externalProvider?.request?.(context.requestArguments)) as T
                    context.write(result)
                } catch (error) {
                    context.abort(error)
                }
            })
        } catch (error) {
            context.abort(error)
        } finally {
            if (context.error) reject(context.error)
            else resolve(context.result as T)
        }
    })
}
