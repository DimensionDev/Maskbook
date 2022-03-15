import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { defer } from '@dimensiondev/kit'
import WalletConnect from '@walletconnect/client'
import type { ITxData } from '@walletconnect/types'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { ChainId, EIP1193Provider, EthereumMethodType } from '../types'

interface SessionPayload {
    event: 'connect' | 'session_update'
    params: [
        {
            chainId: string
            accounts: string[]
        },
    ]
}

interface DisconnectPayload {
    event: 'disconnect'
    params: [{ message: string }]
}

interface ModalClosePayload {
    event: 'modal_closed'
    params: []
}

export default class WalletConnectSDK implements EIP1193Provider {
    private connector = this.createConnector()
    private events = new Map<string, Set<(event?: any) => void>>()

    /**
     * The ongoing walletconnect connection which the listeners use to resolve later.
     */
    private connection: {
        resolve: (accounts: string[]) => void
        reject: (error: unknown) => void
    } | null = null

    private createConnector() {
        const connector = new WalletConnect({
            bridge: 'https://bridge.walletconnect.org',
            qrcodeModal: QRCodeModal,
        })

        connector.on('connect', this.onConnect.bind(this))
        connector.on('disconnect', this.onDisconnect.bind(this))
        connector.on('session_update', this.onSessionUpdate.bind(this))
        connector.on('modal_closed', this.onModalClose.bind(this))

        return connector
    }

    private onConnect(error: Error | null, payload: SessionPayload) {
        if (!this.connection) return

        if (error) {
            this.connection.reject(error)
            return
        }
        this.connection.resolve(payload.params[0].accounts)
    }

    private onDisconnect(error: Error | null, payload: DisconnectPayload) {
        if (this.connection) {
            this.connection.reject(error || new Error('User rejected connection.'))
            return
        }

        if (error) return

        const disconnectListeners = this.events.get('disconnect') ?? []
        disconnectListeners.forEach((x) => x())
    }

    private onSessionUpdate(error: Error | null, payload: SessionPayload) {
        if (this.connection) {
            this.onConnect(error, payload)
            return
        }

        if (error) return

        const accountChangedListeners = this.events.get('accountsChanged') ?? []
        const chianIdChangedListeners = this.events.get('chainChanged') ?? []

        chianIdChangedListeners.forEach((x) => x(toHex(payload.params[0].chainId)))
        accountChangedListeners.forEach((x) => x(payload.params[0].accounts))
    }

    private onModalClose(error: Error | null, payload: ModalClosePayload) {
        if (!this.connection) return
        this.connection.reject(error || new Error('User closed modal.'))
    }

    async login(chainId?: ChainId) {
        // delay to return the result until session is updated or connected
        const [deferred, resolve, reject] = defer<string[]>()

        this.connection = {
            resolve,
            reject,
        }

        this.connector = this.createConnector()

        if (this.connector.connected) await this.connector.killSession()
        await this.connector.createSession({
            chainId,
        })

        return deferred.finally(() => {
            this.connection = null
        })
    }

    async logout(chainId?: ChainId) {
        await this.connector.killSession()
    }

    request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        switch (requestArguments.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                return this.login() as Promise<T>
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                return this.logout() as Promise<T>
            case EthereumMethodType.ETH_CHAIN_ID:
                return Promise.resolve(this.connector.chainId) as Promise<T>
            case EthereumMethodType.ETH_SEND_TRANSACTION: {
                const [config] = requestArguments.params as [ITxData]
                return this.connector.sendTransaction(config) as Promise<T>
            }
            case EthereumMethodType.ETH_SIGN_TRANSACTION: {
                const [config] = requestArguments.params as [ITxData]
                return this.connector.signTransaction(config) as Promise<T>
            }
            case EthereumMethodType.PERSONAL_SIGN: {
                const [data, address] = requestArguments.params as [string, string]
                return this.connector.signPersonalMessage([data, address]) as Promise<T>
            }
            case EthereumMethodType.ETH_SIGN: {
                const [address, data] = requestArguments.params as [string, string]
                return this.connector.signMessage([address, data]) as Promise<T>
            }
            case EthereumMethodType.ETH_SIGN_TYPED_DATA: {
                const [address, data] = requestArguments.params as [string, string]
                return this.connector.signTypedData([address, data]) as Promise<T>
            }
            default:
                return this.connector.sendCustomRequest(requestArguments)
        }
    }

    on(name: string, listener: (event: any) => void): EIP1193Provider {
        if (!this.events.has(name)) this.events.set(name, new Set([listener]))
        else this.events.get(name)!.add(listener)
        return this
    }
    removeListener(name: string, listener: (event: any) => void): EIP1193Provider {
        this.events.get(name)?.delete(listener)
        return this
    }
}
