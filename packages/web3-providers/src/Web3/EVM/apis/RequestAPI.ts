import { memoize } from 'lodash-es'
import Web3 from 'web3'
import type { HttpProvider, RequestArguments } from 'web3-core'
import {
    EthereumMethodType,
    PayloadEditor,
    ProviderType,
    createWeb3,
    createWeb3Provider,
    ProviderURL,
    createWeb3Request,
} from '@masknet/web3-shared-evm'
import { Web3StateRef } from './Web3StateAPI.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { ConnectionOptions } from '../types/index.js'
import { Composers } from '../middleware/index.js'
import { Providers } from '../providers/index.js'
import { createContext } from '../helpers/createContext.js'

const createWeb3SDK = memoize(
    (url: string) => new Web3(url),
    (url) => url.toLowerCase(),
)

export class RequestAPI {
    constructor(private options?: ConnectionOptions) {}

    private ConnectionOptions = new ConnectionOptionsAPI(this.options)

    private get Provider() {
        return Web3StateRef.value.Provider
    }

    // Hijack RPC requests and process them with koa like middleware
    get request() {
        return <T>(requestArguments: RequestArguments, initial?: ConnectionOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const options = this.ConnectionOptions.fill(initial)
                const context = createContext(requestArguments, options)

                try {
                    await Composers.dispatch(context, async () => {
                        if (!context.writeable) return
                        try {
                            switch (context.method) {
                                case EthereumMethodType.MASK_LOGIN:
                                    context.write(
                                        await this.Provider?.connect(
                                            options.providerType,
                                            options.chainId,
                                            options.account,
                                            options.owner
                                                ? {
                                                      account: options.owner,
                                                      identifier: options.identifier,
                                                  }
                                                : undefined,
                                            options.silent,
                                        ),
                                    )
                                    break
                                case EthereumMethodType.MASK_LOGOUT:
                                    context.write(await this.Provider?.disconnect(options.providerType))
                                    break
                                default: {
                                    const provider =
                                        Providers[
                                            PayloadEditor.fromPayload(context.request).readonly
                                                ? ProviderType.MaskWallet
                                                : options.providerType
                                        ]

                                    const web3Provider = provider.createWeb3Provider({
                                        account: options.account,
                                        chainId: options.chainId,
                                    })

                                    // send request and set result in the context
                                    context.write((await web3Provider.request(context.requestArguments)) as T)
                                    break
                                }
                            }
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
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        if (options.readonly) return createWeb3SDK(ProviderURL.from(options.chainId))
        return createWeb3(
            createWeb3Provider((requestArguments: RequestArguments) => this.request(requestArguments, options)),
        )
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        if (options.readonly) {
            const provider = this.getWeb3(options).currentProvider as HttpProvider
            return createWeb3Provider(createWeb3Request(provider.send.bind(provider)))
        }
        return createWeb3Provider((requestArguments: RequestArguments) => this.request(requestArguments, options))
    }
}
