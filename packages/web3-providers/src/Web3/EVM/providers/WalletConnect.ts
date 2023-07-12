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

export default class WalletConnectProvider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private connectorId = 0
    private connector: WalletConnect | undefined

    /**
     * The ongoing walletconnect connection which the listeners use to resolve later.
     */
    private connection: {
        resolve: (account: Account<ChainId>) => void
        reject: (error: unknown) => void
    } | null = null

    constructor() {
        super(ProviderType.WalletConnect)

        if (Flags.wc_v1_enabled) this.resume()
    }

    override get connected() {
        return this.connector?.connected ?? false
    }

    private resume() {
        this.connector = this.createConnector()
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
        })

        connector.on('connect', createListener(this.onConnect.bind(this)))
        connector.on('disconnect', createListener(this.onDisconnect.bind(this)))
        connector.on('session_update', createListener(this.onSessionUpdate.bind(this)))

        return connector
    }

    private async onConnect(error: Error | null, payload: SessionPayload) {
        if (error) return

        await this.context?.closeWalletConnectDialog('Connected')

        const account = {
            chainId: payload.params[0].chainId,
            account: first(payload.params[0].accounts) ?? '',
        }

        this.connection?.resolve(account)
        this.emitter.emit('connect', account)
    }

    private async onDisconnect(error: Error | null, payload: DisconnectPayload) {
        if (error) return
        if (payload.params[0].message === 'cleanup') return

        await this.context?.closeWalletConnectDialog('Disconnected')

        this.connection?.reject(new Error(payload.params[0].message))
        this.emitter.emit('disconnect', ProviderType.WalletConnect)
    }

    private onSessionUpdate(error: Error | null, payload: SessionPayload) {
        if (error) return

        this.emitter.emit('chainId', toHex(payload.params[0].chainId))
        this.emitter.emit('accounts', payload.params[0].accounts)
    }

    private async login(expectedChainId?: ChainId) {
        // delay to return the result until session is updated or connected
        const [deferred, resolve, reject] = defer<Account<ChainId>>()

        this.connection = {
            resolve,
            reject,
        }

        const connector = (this.connector ??= this.createConnector())

        const openQRCodeModal = async () => {
            const reason = await this.context?.openWalletConnectDialog(connector.uri)
            if (reason === 'UserRejected') this.connection?.reject(new Error('User rejected'))
        }

        if (connector.connected) {
            const { chainId: actualChainId, accounts } = connector
            const account = first(accounts)

            if (actualChainId !== 0 && actualChainId === expectedChainId && isValidAddress(account)) {
                this.connection.resolve({
                    chainId: actualChainId,
                    account,
                })
            } else {
                await openQRCodeModal()
            }
        } else {
            // try {
            //     // to kill a unconnected session will throw an error
            //     await connector?.killSession()
            //     await connector.createSession()
            // } catch {

            // }

            if (connector.session.handshakeId === 0) await connector.createSession()
            else connector.rejectSession(new Error('cleanup'))

            await openQRCodeModal()
        }

        return deferred.finally(() => {
            this.connection = null
        })
    }

    private async logout() {
        try {
            // to kill a unconnected session will throw an error
            await this.connector?.killSession()
        } catch {}

        this.onDisconnect(new Error('disconnect'), {
            event: 'disconnect',
            params: [
                {
                    message: 'disconnect',
                },
            ],
        })
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
        if (!this.connector) throw new Error('No connection.')
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
