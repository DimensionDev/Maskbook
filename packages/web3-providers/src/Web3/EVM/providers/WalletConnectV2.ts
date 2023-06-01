import type { RequestArguments } from 'web3-core'
import { getSdkError } from '@walletconnect/utils'
import { SignClient } from '@walletconnect/sign-client'
import type { SessionTypes } from '@walletconnect/types'
import { Flags } from '@masknet/flags'
import type { UnboxPromise } from '@masknet/shared-base'
import { ProviderType, ChainId, type Web3, type Web3Provider, chainResolver } from '@masknet/web3-shared-evm'
import { BaseProvider } from './Base.js'
import type { WalletAPI } from '../../../entry-types.js'

export default class WalletConnectV2Provider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private session: SessionTypes.Struct | undefined
    private client: UnboxPromise<ReturnType<typeof SignClient.init>> | undefined

    constructor() {
        super(ProviderType.WalletConnectV2)
    }

    override get connected() {
        return !!this.session
    }

    private async setupClient() {
        if (this.client) return

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

    private async login(chainId: ChainId) {
        await this.setupClient()

        const connected = await this.client?.connect({
            requiredNamespaces: {
                eip155: {
                    methods: [
                        'eth_sendTransaction',
                        'eth_signTransaction',
                        'eth_sign',
                        'personal_sign',
                        'eth_signTypedData',
                    ],
                    chains: [`eip155:${chainId}`],
                    events: ['chainChanged', 'accountsChanged'],
                },
            },
        })

        if (!connected) return

        const { uri, approval } = connected

        console.log('DEBUG: uri')
        console.log({ uri })

        const session = await approval()

        console.log('DEBUG: session')
        console.log({ session })

        this.session = session

        return {
            chainId: ChainId.Mainnet,
            account: '',
        }

        // const accounts = await this.client?.enable()
        // this.web3Modal?.closeModal()

        // const account = first(accounts)
        // if (!isValidAddress(account)) return

        // return {
        //     account,
        //     chainId,
        // }
    }

    private async logout() {
        try {
            if (!this.client || !this.session) throw new Error('WalletConnect is not initialized')

            await this.client.disconnect({
                topic: this.session.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            })
        } catch (error) {
            // do nothing
        } finally {
            this.session = undefined
        }
    }

    override async connect(chainId: ChainId) {
        const account = await this.login(chainId)
        if (!account?.account) throw new Error(`Failed to connect to ${chainResolver.chainFullName(chainId)}.`)
        return account
    }

    override async disconnect() {
        await this.logout()
    }

    override request<T>(requestArguments: RequestArguments): Promise<T> {
        if (!this.client || !this.session) throw new Error('WalletConnect is not initialized')
        return this.client.request<T>({
            topic: this.session.topic,
            chainId: `eip155:${ChainId.Mainnet}`,
            request: {
                method: requestArguments.method,
                params: requestArguments.params,
            },
        })
    }
}
