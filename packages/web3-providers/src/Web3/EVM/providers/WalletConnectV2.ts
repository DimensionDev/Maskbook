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
import { ChainResolverAPI } from '../apis/ResolverAPI.js'
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
    private SignClient = new Client(this.emitter)
    private ChainResolver = new ChainResolverAPI()

    constructor() {
        super(ProviderType.WalletConnectV2)

        if (Flags.wc_v2_enabled) this.resume()
    }

    private get currentChainId() {
        return Web3StateRef.value.Provider?.chainId?.getCurrentValue() ?? ChainId.Mainnet
    }

    override get connected() {
        return !!this.SignClient.session
    }

    private async resume() {
        if (!this.SignClient.client) await this.SignClient.setup()
        if (this.SignClient.account) await this.login(this.SignClient.account.chainId)
    }

    private async login(chainId: ChainId) {
        const editor = EIP155Editor.fromChainId(chainId)
        if (!editor) throw new Error('Invalid chain id.')

        if (this.SignClient.account) return this.SignClient.account

        const connected = await this.SignClient.client?.connect({
            requiredNamespaces: {
                eip155: editor.eip155Namespace,
            },
        })
        if (!connected) throw new Error('Failed to create connection.')

        const { uri, approval } = connected
        if (uri) this.context?.openWalletConnectDialog(uri)

        await approval()

        if (uri) this.context?.closeWalletConnectDialog()

        return this.SignClient.account
    }

    private async logout() {
        if (!this.SignClient.session?.topic) return
        await this.SignClient.client?.disconnect({
            topic: this.SignClient.session.topic,
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
        await this.SignClient.destroy()
        await this.SignClient.setup()

        const account = await this.login(chainId)
        if (!account) throw new Error(`Failed to connect to ${this.ChainResolver.chainFullName(chainId)}.`)

        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        const editor = EIP155Editor.fromChainId(this.currentChainId)
        if (!editor) throw new Error('Invalid chain id.')

        if (!this.SignClient.client) await this.SignClient.setup()
        if (!this.SignClient.session) await this.login(this.currentChainId)
        if (!this.SignClient.client || !this.SignClient.session) throw new Error('The client is not initialized')

        return this.SignClient.client.request<T>({
            topic: this.SignClient.session.topic,
            chainId: editor.eip155ChainId,
            request: {
                method: requestArguments.method,
                params: requestArguments.params,
            },
        })
    }
}
