import { EthereumMethodType, PayloadEditor, type ChainId, type RequestArguments } from '@masknet/web3-shared-evm'
import type { TransactionSerializable } from 'viem'
import { Composer } from './ComposerAPI.js'
import { evm } from '../../../Manager/registry.js'
import { ConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { EVMRequestReadonlyAPI } from './RequestReadonlyAPI.js'
import { createContext } from '../helpers/createContext.js'
import { EVMWalletProviders } from '../providers/index.js'
import type { EVMConnectionOptions } from '../types/index.js'
import { createWeb3ProviderFromRequest } from '../../../helpers/createWeb3ProviderFromRequest.js'
import { chainIdToChain, createViemClient } from '../../../helpers/createViemClient.js'

function assertTransactionChainId(transaction: TransactionSerializable | undefined, chainId: ChainId | undefined) {
    if (chainId === undefined) return
    if (!transaction) return
    if (transaction.chainId !== undefined && transaction.chainId !== chainId)
        throw new Error('Transaction chain id does not match current chain id.')
}

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
                // eslint-disable-next-line @eslint-react/no-missing-context-display-name
                const context = createContext(requestArguments, options)

                try {
                    await Composer.compose().dispatch(context, async () => {
                        if (!context.writable) return
                        try {
                            switch (context.method) {
                                case EthereumMethodType.MASK_LOGIN:
                                    context.write(
                                        await this.Provider?.connect(
                                            options.providerType,
                                            options.chainId,
                                            options.account,
                                            options.silent,
                                        ),
                                    )
                                    break
                                case EthereumMethodType.MASK_LOGOUT:
                                    context.write(await this.Provider?.disconnect(options.providerType))
                                    break
                                default: {
                                    const payloadEditor = PayloadEditor.fromPayload(context.request)
                                    if (payloadEditor.readonly) {
                                        context.write(
                                            await this.Request.request(context.requestArguments, {
                                                account: options.account,
                                                chainId: options.chainId,
                                            }),
                                        )
                                    } else {
                                        assertTransactionChainId(
                                            payloadEditor.signableTransaction,
                                            EVMWalletProviders[
                                                options.providerType
                                            ].subscription?.chainId.getCurrentValue(),
                                        )

                                        const web3Provider = EVMWalletProviders[
                                            options.providerType
                                        ].createWeb3Provider({
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
                    // eslint-disable-next-line no-unsafe-finally
                    if (context.error) throw context.error
                    // eslint-disable-next-line no-unsafe-finally
                    else return context.result as T
                }
            })()
        }
    }

    override getViem(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        if (options.readonly) return this.Request.getViem(options)
        return createViemClient(chainIdToChain(options.chainId), (requestArguments) =>
            this.request(requestArguments, options),
        )
    }

    override getWeb3Provider(initial?: EVMConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        if (options.readonly) return this.Request.getWeb3Provider(options)
        return createWeb3ProviderFromRequest((requestArguments) => this.request(requestArguments, options))
    }
}
export const EVMRequest = EVMRequestAPI.Default
