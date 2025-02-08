import { EthereumMethodType, PayloadEditor, type RequestArguments } from '@masknet/web3-shared-evm'
import { Composer } from './ComposerAPI.js'
import { evm } from '../../../Manager/registry.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import { createContext } from '../helpers/createContext.js'
import { EVMWalletProviders } from '../providers/index.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { createWeb3FromProvider } from '../../../helpers/createWeb3FromProvider.js'
import { createWeb3ProviderFromRequest } from '../../../helpers/createWeb3ProviderFromRequest.js'

export class EVMRequestAPI extends EVMRequestReadonlyAPI {
    static override Default = new EVMRequestAPI()
    private Request = new EVMRequestReadonlyAPI(this.options)
    protected override ConnectionOptions = new ConnectionOptionsAPI(this.options)

    private get Provider() {
        if (!evm.state?.Provider) throw new Error('The web3 state does not load yet.')
        return evm.state.Provider
    }

    // Hijack RPC requests and process them with koa like middleware
    override get request() {
        return <T>(requestArguments: RequestArguments, initial?: EVMConnectionOptions) => {
            return (async () => {
                const options = this.ConnectionOptions.fill(initial)
                const context = createContext(requestArguments, options)

                try {
                    await Composer.compose(this.Provider.signWithPersona).dispatch(context, async () => {
                        if (!context.writable) return
                        try {
                            switch (context.method) {
                                case EthereumMethodType.MASK_LOGIN:
                                    context.write(
                                        await this.Provider?.connect(
                                            options.providerType,
                                            options.chainId,
                                            options.account,
                                            options.owner ?
                                                {
                                                    account: options.owner,
                                                    identifier: options.identifier,
                                                }
                                            :   undefined,
                                            options.silent,
                                        ),
                                    )
                                    break
                                case EthereumMethodType.MASK_LOGOUT:
                                    context.write(await this.Provider?.disconnect(options.providerType))
                                    break
                                default: {
                                    if (!PayloadEditor.fromPayload(context.request).readonly) {
                                        const web3Provider = EVMWalletProviders[
                                            options.providerType
                                        ].createWeb3Provider({
                                            account: options.account,
                                            chainId: options.chainId,
                                        })

                                        // send request and set result in the context
                                        context.write((await web3Provider.request(context.requestArguments)) as T)
                                    } else {
                                        context.write(
                                            await this.Request.request(context.requestArguments, {
                                                account: options.account,
                                                chainId: options.chainId,
                                            }),
                                        )
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
                    // eslint-disable-next-line no-unsafe-finally
                    if (context.error) throw context.error
                    // eslint-disable-next-line no-unsafe-finally
                    else return context.result as T
                }
            })()
        }
    }

    override getWeb3(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        if (options.readonly) return this.Request.getWeb3(options)
        return createWeb3FromProvider(
            createWeb3ProviderFromRequest((requestArguments) => this.request(requestArguments, options)),
        )
    }

    override getWeb3Provider(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        if (options.readonly) return this.Request.getWeb3Provider(options)
        return createWeb3ProviderFromRequest((requestArguments) => this.request(requestArguments, options))
    }
}
export const EVMRequest = EVMRequestAPI.Default
