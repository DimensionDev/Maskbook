import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
import { defer } from '@masknet/kit'
import { Flags } from '@masknet/flags'
import WalletConnect from '@walletconnect/client'
import type { Account } from '@masknet/shared-base'
import {
    EthereumMethodType,
    isValidAddress,
    ProviderType,
    type RequestArguments,
    type ChainId,
    type Web3Provider,
    type Web3,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import { ChainResolverAPI } from '../apis/ResolverAPI.js'
import { BaseProvider } from './Base.js'
import { parseJSON } from '../../../helpers/parseJSON.js'
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
    private connector: WalletConnect | undefined

    /**
     * The ongoing walletconnect connection which the listeners use to resolve later.
     */
    private connection: {
        deferred: Promise<Account<ChainId>>
        resolve: (account: Account<ChainId>) => void
        reject: (error: unknown) => void
    } | null = null

    constructor() {
        super(ProviderType.WalletConnect)
        this.resumeConnector()
    }

    override get connected() {
        return this.connector?.connected ?? false
    }

    private createConnection() {
        // delay to return the result until session is updated or connected
        const [deferred, resolve, reject] = defer<Account<ChainId>>()

        return {
            deferred,
            resolve,
            reject,
        }
    }

    private createConnector() {
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

        connector.on('connect', this.onConnect.bind(this))
        connector.on('disconnect', this.onDisconnect.bind(this))
        connector.on('session_update', this.onSessionUpdate.bind(this))
        connector.on('modal_closed', this.onModalCloseByUser.bind(this))

        return connector
    }

    private resumeConnector() {
        const json = globalThis.localStorage?.getItem('walletconnect')
        const connection = parseJSON<{ connected: boolean }>(json)
        if (connection?.connected) this.connector = this.createConnector()
    }

    private async destroyConnector() {
        try {
            if (this.connector?.session.connected) await this.connector.killSession(new Error('Destroy Connection'))
            this.connector?.transportClose()
            this.connector?.off('connect')
            this.connector?.off('disconnect')
            this.connector?.off('session_update')
            this.connector?.off('modal_closed')
        } catch {
            this.onDisconnect(new Error('disconnect'), {
                event: 'disconnect',
                params: [
                    {
                        message: 'disconnect',
                    },
                ],
            })
        } finally {
            window.localStorage.removeItem('walletconnect')
        }
    }

    private onConnect(error: Error | null, payload: SessionPayload) {
        if (error) {
            this.connection?.reject(error)
        } else {
            this.connection?.resolve({
                chainId: payload.params[0].chainId,
                account: first(payload.params[0].accounts) ?? '',
            })
        }
    }

    private async onDisconnect(error: Error | null, payload: DisconnectPayload) {
        await this.destroyConnector()

        if (this.connection) {
            this.connection.reject(error || new Error('User rejected'))
            return
        }

        if (!error) {
            this.emitter.emit('disconnect', ProviderType.WalletConnect)
        }
    }

    private async onSessionUpdate(error: Error | null, payload: SessionPayload) {
        if (this.connection) {
            this.onConnect(error, payload)
            return
        }

        if (!error) {
            this.emitter.emit('chainId', toHex(payload.params[0].chainId))
            this.emitter.emit('accounts', payload.params[0].accounts)
        }
    }

    private async onModalCloseByUser(error: Error | null, payload: ModalClosePayload) {
        if (!this.connector?.connected) await this.destroyConnector()
        this.connection?.reject(error || new Error('User rejected'))
    }

    private async login(expectedChainId?: ChainId) {
        // it fails to remove storage when use rainbow wallet
        if (this.connector?.peerMeta?.url === 'https://rainbow.me') {
            window.localStorage.removeItem('walletconnect')
        }

        this.connector = this.createConnector()
        this.connection = this.createConnection()

        if (this.connector?.connected) {
            const { chainId: actualChainId, accounts } = this.connector
            const account = first(accounts)
            if (actualChainId !== 0 && actualChainId === expectedChainId && isValidAddress(account)) {
                this.connection.resolve({
                    chainId: actualChainId,
                    account,
                })
            } else {
                await this.connector.connect({
                    chainId: expectedChainId,
                })
            }
        } else {
            await this.connector.connect({
                chainId: expectedChainId,
            })
        }

        return this.connection.deferred.finally(() => {
            this.connection = null
        })
    }

    private async logout() {
        await this.destroyConnector()
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
        if (!isValidAddress(account.account))
            throw new Error(`Failed to connect to ${new ChainResolverAPI().chainFullName(chainId)}.`)
        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        if (!this.connector) throw new Error('No connector found.')

        switch (requestArguments.method) {
            case EthereumMethodType.ETH_CHAIN_ID:
                return Promise.resolve(this.connector.chainId) as Promise<T>
            case EthereumMethodType.ETH_ACCOUNTS:
                return Promise.resolve(this.connector.accounts) as Promise<T>
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                return this.connector.sendTransaction(requestArguments.params[0]) as Promise<T>
            case EthereumMethodType.ETH_SIGN_TRANSACTION:
                return this.connector.signTransaction(requestArguments.params[0]) as Promise<T>
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
