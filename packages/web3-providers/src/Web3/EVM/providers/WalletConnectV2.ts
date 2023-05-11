import { first } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import { getSdkError } from '@walletconnect/utils'
import { Web3Modal } from '@web3modal/standalone'
import { SignClient } from '@walletconnect/sign-client'
import {
    ProviderType,
    ChainId,
    type Web3,
    type Web3Provider,
    isValidAddress,
    chainResolver,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import type { WalletAPI } from '../../../entry-types.js'
import { BaseProvider } from './Base.js'
import type { UnboxPromise } from '@masknet/shared-base'
import type { SessionTypes } from '@walletconnect/types'

const DEFAULT_LOGGER = process.env.NODE_ENV === 'production' ? 'error' : 'debug'
const DEFAULT_RELAY_URL = 'wss://relay.walletconnect.com'
const DEFAULT_PROJECT_ID = '8f1769933420afe8873860925fcca14f'

export default class WalletConnectV2Provider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private session: SessionTypes.Struct | undefined
    private client: UnboxPromise<ReturnType<typeof SignClient.init>> | undefined
    private web3Modal: Web3Modal | undefined

    constructor() {
        super(ProviderType.WalletConnectV2)
    }

    override get connected() {
        return !!this.session
    }

    private async setupClient() {
        if (!this.web3Modal) {
            this.web3Modal = new Web3Modal({
                projectId: DEFAULT_PROJECT_ID,
                walletConnectVersion: 2,
            })
        }

        if (!this.client) {
            const client = await SignClient.init({
                projectId: DEFAULT_PROJECT_ID,
                logger: DEFAULT_LOGGER,
                relayUrl: DEFAULT_RELAY_URL,
                metadata: {
                    name: 'Mask Network',
                    description: 'Your Portal To The New, Open Internet.',
                    url: 'https://mask.io',
                    icons: ['https://dimensiondev.github.io/Mask-VI/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg'],
                },
            })

            client.on('session_ping', (args) => {
                console.log('EVENT', 'session_ping', args)
            })

            client.on('session_event', (args) => {
                console.log('EVENT', 'session_event', args)
            })

            client.on('session_update', ({ topic, params }) => {
                console.log('EVENT', 'session_update', { topic, params })
                // const { namespaces } = params
                // const _session = client.session.get(topic)
                // const updatedSession = { ..._session, namespaces }
                // onSessionConnected(updatedSession);
            })

            client.on('session_delete', () => {
                console.log('EVENT', 'session_delete')
                // reset()
            })

            this.client = client

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

        this.web3Modal.openModal({
            uri,
            standaloneChains: [`eip155:${chainId}`],
        })

        const session = await approval()

        console.log('DEBUG: session')
        console.log(session)

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
        if (!this.client || !this.session) throw new Error('WalletConnect is not initialized')

        try {
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
        throw new Error('To be implemented.')
    }
}
