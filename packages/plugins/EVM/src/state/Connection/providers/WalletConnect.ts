import { first } from 'lodash-unified'
import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { defer } from '@dimensiondev/kit'
import WalletConnect from '@walletconnect/client'
import type { ITxData } from '@walletconnect/types'
import { ChainId, chainResolver, EthereumMethodType, ProviderType } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base'
import type { EVM_Provider } from '../types'
import type { Account } from '@masknet/web3-shared-base'
import { SharedContextSettings } from '../../../settings'

interface SessionPayload {
    event: 'connect' | 'session_update'
    params: [
        {
            chainId: ChainId
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

export default class WalletConnectProvider extends BaseProvider implements EVM_Provider {
    private connectorId = 0
    private connector: WalletConnect = null!

    /**
     * The ongoing walletconnect connection which the listeners use to resolve later.
     */
    private connection: {
        resolve: (account: Account<ChainId>) => void
        reject: (error: unknown) => void
    } | null = null

    private async createConnector() {
        // disable legacy listeners
        this.connectorId += 1

        const connectorId = this.connectorId

        const createListener = <T>(listener: (error: Error | null, payload: T) => void) => {
            return (error: Error | null, payload: T) => {
                if (connectorId !== this.connectorId) return
                return listener(error, payload)
            }
        }

        const connector = new WalletConnect({
            bridge: 'https://bridge.walletconnect.org',
            qrcodeModal: {
                open(uri: string, cb) {
                    SharedContextSettings.value.openWalletConnectDialog(uri, cb)
                },
                close() {
                    SharedContextSettings.value.closeWalletConnectDialog()
                },
            },
        })

        if (connector.connected) await connector.killSession()

        connector.on('connect', createListener(this.onConnect.bind(this)))
        connector.on('disconnect', createListener(this.onDisconnect.bind(this)))
        connector.on('session_update', createListener(this.onSessionUpdate.bind(this)))
        connector.on('modal_closed', createListener(this.onModalClose.bind(this)))

        return connector
    }

    private onConnect(error: Error | null, payload: SessionPayload) {
        if (!this.connection) return

        if (error) {
            this.connection.reject(error)
            return
        }
        this.connection.resolve({
            chainId: payload.params[0].chainId,
            account: first(payload.params[0].accounts) ?? '',
        })
    }

    private onDisconnect(error: Error | null, payload: DisconnectPayload) {
        if (this.connection) {
            this.connection.reject(error || new Error('User rejected connection.'))
            return
        }

        if (error) return

        this.emitter.emit('disconnect', ProviderType.WalletConnect)
    }

    private onSessionUpdate(error: Error | null, payload: SessionPayload) {
        if (this.connection) {
            this.onConnect(error, payload)
            return
        }

        if (error) return

        this.emitter.emit('chainId', toHex(payload.params[0].chainId))
        this.emitter.emit('accounts', payload.params[0].accounts)
    }

    private onModalClose(error: Error | null, payload: ModalClosePayload) {
        if (!this.connection) return
        this.connection.reject(error || new Error('User closed modal.'))
    }

    private async login(chainId?: ChainId) {
        // delay to return the result until session is updated or connected
        const [deferred, resolve, reject] = defer<Account<ChainId>>()

        this.connector = await this.createConnector()

        await this.connector.createSession({
            chainId,
        })

        this.connection = {
            resolve,
            reject,
        }

        return deferred.finally(() => {
            this.connection = null
        })
    }

    private async logout() {
        await this.connector.killSession()
    }

    override request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        switch (requestArguments.method) {
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
                return this.connector.signPersonalMessage(requestArguments.params) as Promise<T>
            }
            case EthereumMethodType.ETH_SIGN: {
                return this.connector.signMessage(requestArguments.params) as Promise<T>
            }
            case EthereumMethodType.ETH_SIGN_TYPED_DATA: {
                return this.connector.signTypedData(requestArguments.params) as Promise<T>
            }
            default:
                return this.connector.sendCustomRequest(requestArguments)
        }
    }

    // It doesn't widely implement for switching chains with WalletConnect.
    override async switchChain(chainId?: ChainId | undefined): Promise<void> {
        throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)
    }

    override async connect(chainId: ChainId) {
        const account = await this.login(chainId)
        if (!account.account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)
        return account
    }

    override async disconnect() {
        await this.logout()
    }
}
