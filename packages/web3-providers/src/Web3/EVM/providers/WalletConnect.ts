import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import type { RequestArguments } from 'web3-core'
import { defer } from '@masknet/kit'
import { Flags } from '@masknet/flags'
import WalletConnect from '@walletconnect/client'
import type { Account } from '@masknet/shared-base'
import {
    type ChainId,
    chainResolver,
    EthereumMethodType,
    isValidAddress,
    ProviderType,
    type Web3Provider,
    type Web3,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

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
    params: [
        {
            message: string
        },
    ]
}

interface ModalClosePayload {
    event: 'modal_closed'
    params: []
}

export default class WalletConnectProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private connectorId = 0
    private connector: WalletConnect = this.createConnector()

    /**
     * The ongoing walletconnect connection which the listeners use to resolve later.
     */
    private connection: {
        resolve: (account: Account<ChainId>) => void
        reject: (error: unknown) => void
    } | null = null

    constructor() {
        super(ProviderType.WalletConnect)
    }

    override get connected() {
        return this.connector.connected
    }

    private createConnector() {
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
            bridge: Flags.wc_v1_bridge_url,
            qrcodeModal: {
                open: async (uri: string, callback) => {
                    await this.context?.openWalletConnectDialog(uri)
                    callback()
                },
                close: () => {
                    this.context?.closeWalletConnectDialog()
                },
            },
        })

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
            this.connection.reject(error || new Error('User rejected'))
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
        this.connection?.reject(error || new Error('User rejected'))
    }

    private async login(expectedChainId?: ChainId) {
        // delay to return the result until session is updated or connected
        const [deferred, resolve, reject] = defer<Account<ChainId>>()

        this.connection = {
            resolve,
            reject,
        }

        if (this.connector.connected) {
            const { chainId: actualChainId, accounts } = this.connector
            const account = first(accounts)
            if (actualChainId !== 0 && actualChainId === expectedChainId && account && isValidAddress(account)) {
                this.connection.resolve({
                    chainId: actualChainId,
                    account,
                })
            } else {
                await this.cleanup()
                await this.connector.createSession()
            }
        } else {
            await this.connector.createSession()
        }

        return deferred.finally(() => {
            this.connection = null
        })
    }

    private async logout() {
        await this.cleanup()

        this.onDisconnect(new Error('disconnect'), {
            event: 'disconnect',
            params: [
                {
                    message: 'disconnect',
                },
            ],
        })
    }

    private async cleanup() {
        try {
            await this.connector.killSession()
        } catch {
            window.localStorage.removeItem('walletconnect')
        }
    }

    override async switchChain(chainId: ChainId): Promise<void> {
        if (!isValidChainId(chainId)) throw new Error('Invalid chain id.')

        let clean: () => boolean | undefined
        return new Promise<void>((resolve, reject) => {
            super.switchChain(chainId).catch((error) => {
                reject(error)
            })
            clean = this.emitter.on('chainId', () => {
                resolve()
            })
        }).finally(() => {
            clean?.()
        })
    }

    override async connect(chainId: ChainId) {
        const account = await this.login(chainId)
        if (!account.account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)
        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override request<T>(requestArguments: RequestArguments): Promise<T> {
        switch (requestArguments.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                return Promise.resolve(this.connector.chainId) as Promise<T>
            case EthereumMethodType.ETH_SEND_TRANSACTION: {
                const [config] = requestArguments.params
                return this.connector.sendTransaction(config) as Promise<T>
            }
            case EthereumMethodType.ETH_SIGN_TRANSACTION: {
                const [config] = requestArguments.params
                return this.connector.signTransaction(config) as Promise<T>
            }
            case EthereumMethodType.PERSONAL_SIGN:
                return this.connector.signPersonalMessage(requestArguments.params) as Promise<T>
            case EthereumMethodType.ETH_SIGN:
                return this.connector.signMessage(requestArguments.params) as Promise<T>
            case EthereumMethodType.ETH_SIGN_TYPED_DATA:
                return this.connector.signTypedData(requestArguments.params) as Promise<T>
            default:
                return this.connector.sendCustomRequest(requestArguments)
        }
    }
}
