import { PayloadEditor, type RequestArguments } from '@masknet/web3-shared-evm'
import { Composer } from './ComposerAPI.js'
import { evm } from '../../../Manager/registry.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import { createContext } from '../helpers/createContext.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { createWeb3FromProvider } from '../../../helpers/createWeb3FromProvider.js'
import { createWeb3ProviderFromRequest } from '../../../helpers/createWeb3ProviderFromRequest.js'

export class EVMRequestAPI extends EVMRequestReadonlyAPI {
    static override Default = new EVMRequestAPI()
    private Request = new EVMRequestReadonlyAPI(this.options)
    protected override ConnectionOptions = new ConnectionOptionsAPI(this.options)

    // Hijack RPC requests and process them with koa like middleware
    override get request() {
        return <T>(requestArguments: RequestArguments, initial?: EVMConnectionOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const options = this.ConnectionOptions.fill(initial)
                const context = createContext(requestArguments, options)

                try {
                    await Composer.compose().dispatch(context, async () => {
                        if (!context.writable) return
                        try {
                            if (!PayloadEditor.fromPayload(context.request).readonly) {
                                const result = await evm.state?.Wallet?.request?.(context.requestArguments)

                                console.log('DEBUG: result')
                                console.log({
                                    result,
                                })

                                // send request and set result in the context
                                context.write(result as T)
                            } else {
                                context.write(
                                    await this.Request.request(context.requestArguments, {
                                        account: options.account,
                                        chainId: options.chainId,
                                    }),
                                )
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
