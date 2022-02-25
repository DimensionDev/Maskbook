import type { RequestArguments } from 'web3-core'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { isReadOnlyPayload, ProviderType, RequestOptions, SendOverrides } from '@masknet/web3-shared-evm'
import { createExternalProvider } from './provider'
import { createContext, dispatch, use } from './composer'

// #region middleware
import { Logger } from './middlewares/Logger'
import { Squash } from './middlewares/Squash'
import { Nonce } from './middlewares/Nonce'
import { Interceptor } from './middlewares/Interceptor'
import { Popup } from './middlewares/Popup'
import { Translator } from './middlewares/Translator'
import { RecentTransaction } from './middlewares/Transaction'
import { TransactionNotifier } from './middlewares/TransactionNotifier'
import { TransactionWatcher } from './middlewares/TransactionWatcher'
import { hasNativeAPI, nativeAPI } from '../../../../shared/native-rpc'

use(new Logger())
use(new Squash())
use(new Nonce())
use(new Translator())
use(new Popup())
use(new Interceptor())
use(new RecentTransaction())
use(new TransactionNotifier())
use(new TransactionWatcher())
// #endregion

export async function request<T extends unknown>(
    requestArguments: RequestArguments,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return new Promise<T>(async (resolve, reject) => {
        const context = createContext(requestArguments, overrides, options)

        try {
            await dispatch(context, async () => {
                if (!context.writeable) return
                try {
                    // redirect rpc to native API
                    if (hasNativeAPI && nativeAPI) {
                        const response =
                            nativeAPI.type == 'Android'
                                ? (JSON.parse(
                                      await nativeAPI.api.sendJsonString(JSON.stringify(context.request)),
                                  ) as JsonRpcResponse)
                                : await nativeAPI.api.send(context.request)

                        context.end(new Error(response.error), response.result)
                        return
                    }

                    // create request provider
                    const externalProvider = await createExternalProvider(
                        context.chainId,
                        isReadOnlyPayload(context.request) ? ProviderType.MaskWallet : context.providerType,
                    )
                    if (!externalProvider?.request) throw new Error('Failed to create provider.')

                    // send request and set result in the context
                    const result = (await externalProvider?.request?.(context.requestArguments)) as T
                    context.write(result)
                } catch (error) {
                    context.abort(error, 'Failed to send request.')
                }
            })
        } catch (error) {
            context.abort(error, 'Failed to send request.')
        } finally {
            if (context.error) reject(context.error)
            else resolve(context.result as T)
        }
    })
}
