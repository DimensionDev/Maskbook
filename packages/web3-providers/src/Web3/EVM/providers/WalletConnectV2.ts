import type { RequestArguments } from 'web3-core'
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
import type { WalletAPI } from '../../../entry-types.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'

class Client {
    client: UnboxPromise<ReturnType<typeof SignClient.init>> | undefined

    get session() {
        if (!this.client?.session.length) return
        return this.client.session.get(this.client.session.keys.at(-1)!)
    }

    get account() {
        const account = this.session?.namespaces.eip155.accounts[0]
        return account ? EIP155Editor.from(account).account : undefined
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

        // // @ts-expect-error the client type mismatch
        // this.client.on('display_uri', (uri: string) => {
        //     this.web3Modal?.openModal({ uri })
        // })

        // // @ts-expect-error the client type mismatch
        // this.client.on('connect', (session: SessionTypes.Struct) => {
        //     const encodedAccount = first(session.namespaces.eip155.accounts)
        //     if (!encodedAccount) return

        //     const [, chainId, account] = encodedAccount.split(':')
        //     const chainId_ = Number.parseInt(chainId, 10)

        //     if (isValidAddress(account) && isValidChainId(chainId_)) {
        //         this.emitter.emit('connect', {
        //             chainId: chainId_,
        //             account,
        //         })
        //     }
        // })

        // this.client.on('accountsChanged', (accounts) => {
        //     if (!this.connected) return
        //     this.emitter.emit('accounts', accounts)
        // })

        // this.client.on('chainChanged', (chainId) => {
        //     if (!this.connected) return
        //     this.emitter.emit('chainId', chainId)
        // })
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
    private signClient = new Client()

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

            console.log('DEBUG: connected')
            console.log(connected)

            if (!connected) throw new Error('Failed to create connection.')

            const { uri, approval } = connected

            console.log('DEBUG: uri')
            console.log({ uri })

            if (uri) this.context?.openWalletConnectDialog(uri)

            await approval()

            this.context?.closeWalletConnectDialog()
        }

        return this.signClient.account
    }

    private async logout() {
        try {
            if (!this.signClient.session) return
            await this.signClient.client?.disconnect({
                topic: this.signClient.session.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            })
        } catch (error) {
            // do nothing
        } finally {
        }
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
