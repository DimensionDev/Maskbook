import { first } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import { Web3Modal } from '@web3modal/standalone'
import { UniversalProvider, type IUniversalProvider } from '@walletconnect/universal-provider'
import type { SessionTypes } from '@walletconnect/types'
import {
    ProviderType,
    type ChainId,
    type Web3,
    type Web3Provider,
    isValidAddress,
    chainResolver,
    isValidChainId,
} from '@masknet/web3-shared-evm'
import type { WalletAPI } from '../../../entry-types.js'
import { BaseProvider } from './Base.js'

const DEFAULT_LOGGER = process.env.NODE_ENV === 'production' ? 'error' : 'debug'
const DEFAULT_RELAY_URL = 'wss://relay.walletconnect.com'
const DEFAULT_PROJECT_ID = '8f1769933420afe8873860925fcca14f'

export default class WalletConnectV2Provider
    extends BaseProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    private provider: IUniversalProvider | undefined
    private web3Modal: Web3Modal | undefined

    constructor() {
        super(ProviderType.WalletConnectV2)
    }

    override get connected() {
        return !!this.provider?.session
    }

    private async setupClient() {
        if (!this.web3Modal) {
            this.web3Modal = new Web3Modal({
                projectId: DEFAULT_PROJECT_ID,
                walletConnectVersion: 2,
            })
        }

        if (!this.provider) {
            this.provider = await UniversalProvider.init({
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

            // @ts-expect-error the provider type mismatch
            this.provider.on('display_uri', (uri: string) => {
                this.web3Modal?.openModal({ uri })
            })

            // @ts-expect-error the provider type mismatch
            this.provider.on('connect', (session: SessionTypes.Struct) => {
                const encodedAccount = first(session.namespaces.eip155.accounts)
                if (!encodedAccount) return

                const [, chainId, account] = encodedAccount.split(':')
                const chainId_ = Number.parseInt(chainId, 10)

                if (isValidAddress(account) && isValidChainId(chainId_)) {
                    this.emitter.emit('connect', {
                        chainId: chainId_,
                        account,
                    })
                }
            })

            this.provider.on('accountsChanged', (accounts) => {
                if (!this.connected) return
                this.emitter.emit('accounts', accounts)
            })

            this.provider.on('chainChanged', (chainId) => {
                if (!this.connected) return
                this.emitter.emit('chainId', chainId)
            })
        }
    }

    private async login(chainId: ChainId) {
        await this.setupClient()

        await this.provider?.connect({
            namespaces: {
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
                    rpcMap: {},
                },
            },
        })

        const accounts = await this.provider?.enable()
        this.web3Modal?.closeModal()

        const account = first(accounts)
        if (!isValidAddress(account)) return

        return {
            account,
            chainId,
        }
    }

    private async logout() {
        if (!this.provider) throw new Error('WalletConnect is not initialized')
        this.provider.disconnect()
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
