import type { RequestArguments } from 'web3-core'
import { Composer, EthereumMethodType, PayloadEditor, createWeb3, createWeb3Provider } from '@masknet/web3-shared-evm'
import { Web3StateRef } from './Web3StateAPI.js'
import { RequestReadonlyAPI } from './RequestReadonlyAPI.js'
import type { ConnectionOptions } from '../types/index.js'
import { Providers } from '../providers/index.js'
import { createContext } from '../helpers/createContext.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Squash } from '../middleware/Squash.js'
import { Nonce } from '../middleware/Nonce.js'
import { Translator } from '../middleware/Translator.js'
import { Interceptor } from '../middleware/Interceptor.js'
import { RecentTransaction } from '../middleware/RecentTransaction.js'
import { TransactionWatcher } from '../middleware/TransactionWatcher.js'
import { AddressBook } from '../middleware/AddressBook.js'

export class RequestAPI extends RequestReadonlyAPI {
    private Composers = Composer.from<ConnectionContext>(
        new Squash(),
        new Nonce(),
        new Translator(),
        new Interceptor(),
        new RecentTransaction(),
        new TransactionWatcher(),
        new AddressBook(),
    )

    private get Provider() {
        return Web3StateRef.value.Provider
    }

    // Hijack RPC requests and process them with koa like middleware
    override get request() {
        return <T>(requestArguments: RequestArguments, initial?: ConnectionOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const options = this.ConnectionOptions.fill(initial)
                const context = createContext(requestArguments, options)

                try {
                    await this.Composers.dispatch(context, async () => {
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
                                    if (PayloadEditor.fromPayload(context.request).readonly) {
                                        context.write(
                                            await super.request(context.requestArguments, {
                                                account: options.account,
                                                chainId: options.chainId,
                                            }),
                                        )
                                    } else {
                                        const web3Provider = Providers[options.providerType].createWeb3Provider({
                                            account: options.account,
                                            chainId: options.chainId,
                                        })

                                        // send request and set result in the context
                                        context.write((await web3Provider.request(context.requestArguments)) as T)
                                    }

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

    override getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        if (options.readonly) return super.getWeb3(options)
        return createWeb3(
            createWeb3Provider((requestArguments: RequestArguments) => this.request(requestArguments, options)),
        )
    }

    override getWeb3Provider(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)

        if (options.readonly) return super.getWeb3Provider(options)
        return createWeb3Provider((requestArguments: RequestArguments) => this.request(requestArguments, options))
    }
}
