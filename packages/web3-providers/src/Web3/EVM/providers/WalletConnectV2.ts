import { first } from 'lodash-es'
import { toHex } from 'web3-utils'
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
    type Web3,
    type Web3Provider,
} from '@masknet/web3-shared-evm'
import { ChainResolver } from '../apis/ResolverAPI.js'
import { BaseProvider } from './Base.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import type { WalletAPI } from '../../../entry-types.js'

class Client {
    constructor(private emitter: Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>) {}

    client: UnboxPromise<ReturnType<typeof SignClient.init>> | undefined

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
            projectId: Flags.wc_v2_project_id,
            logger: Flags.wc_v2_mode,
            relayUrl: Flags.wc_v2_relay_url,
            metadata: {
                name: 'Mask Network',
                description: 'Your Portal To The New, Open Internet.',
                url: 'https://mask.io',
                icons: ['https://dimensiondev.github.io/Mask-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg'],
            },
        })

        this.client.on('session_update', () => {
            if (!this.account) return
            this.emitter.emit('chainId', toHex(this.account.chainId))
            this.emitter.emit('accounts', [this.account.account])
        })

        this.client.on('session_delete', () => {
            this.emitter.emit('disconnect', ProviderType.WalletConnectV2)
        })
    }

    async destroy() {
        if (!this.client) return
        this.client.removeAllListeners('session_update')
        this.client.removeAllListeners('session_delete')
    }
}

export default class WalletConnectV2Provider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private signClient = new Client(this.emitter)

    constructor() {
        super(ProviderType.WalletConnectV2)

        if (Flags.wc_v2_enabled) this.resume()
    }

    private get currentChainId() {
        return Web3StateRef.value.Provider?.chainId?.getCurrentValue() ?? ChainId.Mainnet
    }

    override get connected() {
        return !!this.signClient.session
    }

    private async resume() {
        if (!this.signClient.client) await this.signClient.setup()
        if (this.signClient.account) await this.login(this.signClient.account.chainId)
    }

    private async login(chainId: ChainId) {
        const editor = EIP155Editor.fromChainId(chainId)
        if (!editor) throw new Error('Invalid chain id.')

        if (this.signClient.account) return this.signClient.account

        const connected = await this.signClient.client?.connect({
            requiredNamespaces: {
                eip155: editor.eip155Namespace,
            },
        })
        if (!connected) throw new Error('Failed to create connection.')

        const { uri, approval } = connected
        if (uri) this.context?.openWalletConnectDialog(uri)

        await approval()

        if (uri) this.context?.closeWalletConnectDialog()

        return this.signClient.account
    }

    private async logout() {
        if (!this.signClient.session?.topic) return
        await this.signClient.client?.disconnect({
            topic: this.signClient.session.topic,
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
        await this.signClient.destroy()
        await this.signClient.setup()

        const account = await this.login(chainId)
        if (!account) throw new Error(`Failed to connect to ${ChainResolver.chainFullName(chainId)}.`)

        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        const editor = EIP155Editor.fromChainId(this.currentChainId)
        if (!editor) throw new Error('Invalid chain id.')

        if (!this.signClient.client) await this.signClient.setup()
        if (!this.signClient.session) await this.login(this.currentChainId)
        if (!this.signClient.client || !this.signClient.session) throw new Error('The client is not initialized')

        return this.signClient.client.request<T>({
            topic: this.signClient.session.topic,
            chainId: editor.eip155ChainId,
            request: {
                method: requestArguments.method,
                params: requestArguments.params,
            },
        })
    }
}
