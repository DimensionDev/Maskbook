import { first } from 'lodash-es'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { Emitter } from '@servie/events'
import { getSdkError } from '@walletconnect/utils'
import { SignClient } from '@walletconnect/sign-client'
import { Flags } from '@masknet/flags'
import type { UnboxPromise } from '@masknet/shared-base'
import {
    ProviderType,
    ChainId,
    EIP155Editor,
    isValidAddress,
    isValidChainId,
    type RequestArguments,
} from '@masknet/web3-shared-evm'
import { BaseEVMWalletProvider } from './Base.js'
import { EVMChainResolver } from '../apis/ResolverAPI.js'
import { evm } from '../../../Manager/registry.js'
import type { WalletAPI } from '../../../entry-types.js'

class Client {
    constructor(private emitter: Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>) {}

    public client: UnboxPromise<ReturnType<typeof SignClient.init>> | undefined

    get session() {
        const key = this.client?.session.keys.at(-1)
        return key ? this.client?.session.get(key) : undefined
    }

    get account() {
        const account = EIP155Editor.from(first(this.session?.namespaces.eip155.accounts) ?? '')?.account
        if (isValidChainId(account?.chainId) && isValidAddress(account?.account)) return account
        return
    }

    async setup() {
        this.client = await SignClient.init({
            projectId: Flags.wc_project_id,
            logger: Flags.wc_mode,
            relayUrl: Flags.wc_relay_url,
            metadata: {
                name: 'Mask Network',
                description: 'Your Portal To The New, Open Internet.',
                url: 'https://mask.io',
                icons: ['https://dimensiondev.github.io/Mask-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg'],
            },
        })

        this.client.on('session_update', () => {
            if (!this.account) return
            this.emitter.emit('chainId', web3_utils.toHex(this.account.chainId))
            this.emitter.emit('accounts', [this.account.account])
        })

        this.client.on('session_delete', () => {
            this.emitter.emit('disconnect', ProviderType.WalletConnect)
        })
    }

    async destroy() {
        if (!this.client) return
        this.client.removeAllListeners('session_update')
        this.client.removeAllListeners('session_delete')
    }
}

export class WalletConnectProvider extends BaseEVMWalletProvider {
    private client: Client = null!

    constructor(private context: WalletAPI.WalletConnectIOContext) {
        super(ProviderType.WalletConnect)
        this.client = new Client(this.emitter)
        this.resume()
    }

    private get currentChainId() {
        return evm.state?.Provider?.chainId?.getCurrentValue() ?? ChainId.Mainnet
    }

    override get connected() {
        return !!this.client.session
    }

    private async resume() {
        if (!this.client.client) await this.client.setup()
        if (this.client.account) await this.login(this.client.account.chainId)
    }

    private async login(chainId: ChainId) {
        const editor = EIP155Editor.fromChainId(chainId)
        if (!editor) throw new Error('Invalid chain id.')

        if (this.client.account) return this.client.account

        const connected = await this.client.client?.connect({
            requiredNamespaces: {
                eip155: editor.proposalNamespace,
            },
        })
        if (!connected) throw new Error('Failed to create connection.')

        const { uri, approval } = connected
        if (uri) this.context?.openWalletConnectDialog(uri)

        await approval()

        if (uri) this.context?.closeWalletConnectDialog()

        return this.client.account
    }

    private async logout() {
        if (!this.client.session?.topic) return
        await this.client.client?.disconnect({
            topic: this.client.session.topic,
            reason: getSdkError('USER_DISCONNECTED'),
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
        await this.client.destroy()
        await this.client.setup()

        const account = await this.login(chainId)
        if (!account) throw new Error(`Failed to connect to ${EVMChainResolver.chainFullName(chainId)}.`)

        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        const editor = EIP155Editor.fromChainId(this.currentChainId)
        if (!editor) throw new Error('Invalid chain id.')

        if (!this.client.client) await this.client.setup()
        if (!this.client.session) await this.login(this.currentChainId)
        if (!this.client.client || !this.client.session) throw new Error('The client is not initialized')

        return this.client.client.request<T>({
            topic: this.client.session.topic,
            chainId: editor.eip155ChainId,
            request: {
                method: requestArguments.method,
                params: requestArguments.params,
            },
        })
    }
}
