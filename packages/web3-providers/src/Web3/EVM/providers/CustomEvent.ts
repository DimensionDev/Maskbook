import { type ChainId, ProviderType, type RequestArguments, EthereumMethodType } from '@masknet/web3-shared-evm'
import { BaseEVMWalletProvider } from './Base.js'
import { safeUnreachable } from '@masknet/kit'
import { EnhanceableSite, type Account, getSiteType } from '@masknet/shared-base'
import { first } from 'lodash-es'

export class EVMCustomEventProvider extends BaseEVMWalletProvider {
    constructor() {
        super(ProviderType.CustomEvent)
    }

    setup() {
        if (getSiteType() !== EnhanceableSite.Firefly) return

        // @ts-expect-error TODO: define the custom event
        document.addEventListener(
            'mask_custom_event_provider_event',
            (
                event: CustomEvent<{
                    type: 'accountsChanged' | 'chainChanged' | 'disconnect' | 'connect'
                    payload?: unknown
                }>,
            ) => {
                const { type, payload } = event.detail

                switch (type) {
                    case 'accountsChanged':
                        this.emitter.emit('accounts', payload as string[])
                        break
                    case 'chainChanged':
                        this.emitter.emit('chainId', payload as string)
                        break
                    case 'disconnect':
                        this.emitter.emit('disconnect', this.providerType)
                        break
                    case 'connect':
                        this.emitter.emit('connect', payload as Account<ChainId>)
                        break
                    default:
                        safeUnreachable(type)
                        break
                }
            },
        )
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        const id = crypto.randomUUID()
        const event = new CustomEvent('mask_custom_event_provider_request', {
            detail: {
                id,
                requestArguments,
            },
        })
        const defer = new Promise<T>((resolve, reject) => {
            const handler = (
                event: CustomEvent<{
                    id: string
                    result?: unknown
                    error?: Error
                }>,
            ) => {
                if (event.detail.id !== id) return

                if (event.detail.error) {
                    reject(event.detail.error)
                } else {
                    resolve(event.detail.result as T)
                }
            }
            // @ts-expect-error TODO: define the custom event
            document.addEventListener('mask_custom_event_provider_response', handler, {
                signal: AbortSignal.timeout(3 * 60 * 1000),
                once: true,
            })
        })

        document.dispatchEvent(event)
        return defer
    }

    override async connect(): Promise<Account<ChainId>> {
        const accounts = await this.request<string[]>({
            method: EthereumMethodType.eth_requestAccounts,
            params: [],
        })
        const chainId = await this.request<string>({
            method: EthereumMethodType.eth_chainId,
            params: [],
        })

        return {
            chainId: Number.parseInt(chainId, 16),
            account: first(accounts) ?? '',
        }
    }
}
