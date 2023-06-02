import { first } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import type { Emitter } from '@servie/events'
import { getSdkError } from '@walletconnect/utils'
import { SignClient } from '@walletconnect/sign-client'
import { Flags } from '@masknet/flags'
import type { UnboxPromise } from '@masknet/shared-base'
import {
    ProviderType,
    ChainId,
    type Web3,
    type Web3Provider,
    chainResolver,
    EIP155Editor,
    isValidAddress,
    isValidChainId,
} from '@masknet/web3-shared-evm'
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
        const account = first(this.session?.namespaces.eip155.accounts)
        const account_ = account ? EIP155Editor.from(account).account : undefined
        if (isValidChainId(account_?.chainId) && isValidAddress(account_?.account)) return account_
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

        this.client.on('session_ping', (args) => {
            console.log('[DEBUG EVENT]', 'session_ping', args)
        })

        this.client.on('session_event', (args) => {
            console.log('[DEBUG EVENT]', 'session_event', args)
        })

        this.client.on('session_update', ({ topic, params }) => {
            console.log('[DEBUG EVENT]', 'session_update', { topic, params })
            // const { namespaces } = params
            // const _session = client.session.get(topic)
            // const updatedSession = { ..._session, namespaces }
            // onSessionConnected(updatedSession);
        })

        this.client.on('session_delete', () => {
            console.log('[DEBUG EVENT]', 'session_delete')
            // reset()
        })
    }

    reset() {
        if (!this.client) return
        this.client.removeAllListeners('session_ping')
        this.client.removeAllListeners('session_event')
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
    }

    get chainId() {
        return Web3StateRef.value.Provider?.chainId?.getCurrentValue() ?? ChainId.Mainnet
    }

    override get connected() {
        return !!this.signClient.session
    }

    private async login(chainId: ChainId) {
        if (!this.signClient.account) {
            const connected = await this.signClient.client?.connect({
                requiredNamespaces: {
                    eip155: EIP155Editor.fromChainId(chainId).eip155Namespace,
                },
            })
            if (!connected) throw new Error('Failed to create connection.')

            const { uri, approval } = connected
            if (uri) this.context?.openWalletConnectDialog(uri)

            await approval()

            if (uri) this.context?.closeWalletConnectDialog()
        }

        return this.signClient.account
    }

    private async logout() {
        if (!this.signClient.session) return
        await this.signClient.client?.disconnect({
            topic: this.signClient.session.topic,
            reason: getSdkError('USER_DISCONNECTED'),
        })
    }

    override async connect(chainId: ChainId) {
        this.signClient.reset()
        await this.signClient.setup()

        const account = await this.login(chainId)
        if (!account || !isValidAddress(account.account) || !isValidChainId(account.chainId))
            throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)
        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override async request<T>(requestArguments: RequestArguments): Promise<T> {
        if (!this.signClient.client) await this.signClient.setup()
        if (!this.signClient.session) await this.login(this.chainId)
        if (!this.signClient.client || !this.signClient.session) throw new Error('The client is not initialized')

        return this.signClient.client.request<T>({
            topic: this.signClient.session.topic,
            chainId: EIP155Editor.fromChainId(this.chainId).eip155ChainId,
            request: {
                method: requestArguments.method,
                params: requestArguments.params,
            },
        })
    }
}
