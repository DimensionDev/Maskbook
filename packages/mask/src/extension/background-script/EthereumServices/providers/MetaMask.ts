import type { RequestArguments } from 'web3-core'
import { first } from 'lodash-unified'
import createMetaMaskProvider, { MetaMaskInpageProvider } from '@dimensiondev/metamask-extension-provider'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { delay } from '@dimensiondev/kit'
import { updateAccount } from '../../../../plugins/Wallet/services'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'
import { replaceRecentTransaction } from '../../../../plugins/Wallet/services/transaction/database'
import { BaseProvider } from './Base'
import type { Provider } from '../types'

export class MetaMaskProvider extends BaseProvider implements Provider {
    private provider: MetaMaskInpageProvider | null = null

    private async createProviderInstance() {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (this.provider && this.provider.chainId !== null) return this.provider
        this.provider = createMetaMaskProvider()

        // wait for building the connection
        await delay(1000)

        if (!this.provider || this.provider.chainId === null) {
            this.provider = null
            throw new Error('Unable to create provider.')
        }

        this.provider.on('accountsChanged', this.onAccountsChanged as (...args: unknown[]) => void)
        this.provider.on('chainChanged', this.onChainIdChanged as (...args: unknown[]) => void)
        this.provider.on('message', this.onMessage as (...args: unknown[]) => void)
        return this.provider
    }

    async onMessage(message: {
        type: 'tx_replacement'
        data: {
            oldTx: string
            newTx: string
            nonce: string
            from: string
        }
    }) {
        if (message.type !== 'tx_replacement') return
        await replaceRecentTransaction(
            currentChainIdSettings.value,
            message.data.from,
            message.data.oldTx,
            message.data.newTx,
        )
    }

    async onAccountsChanged(accounts: string[]) {
        if (currentProviderSettings.value !== ProviderType.MetaMask) return
        await updateAccount({
            account: first(accounts),
            providerType: ProviderType.MetaMask,
            chainId:
                typeof this.provider?.chainId === 'string' ? Number.parseInt(this.provider.chainId, 16) : undefined,
        })
    }

    async onChainIdChanged(id: string) {
        if (currentProviderSettings.value !== ProviderType.MetaMask) return

        // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
        const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
        if (currentChainIdSettings.value === chainId) return
        await updateAccount({
            chainId,
        })
    }

    override async request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        const instance = await this.createProviderInstance()
        return instance.request?.(requestArguments) as Promise<T>
    }

    async ensureConnectedAndUnlocked() {
        try {
            const web3 = await this.createWeb3()
            const accounts = await web3.eth.requestAccounts()
            throw accounts
        } catch (error: string[] | any) {
            const accounts = error
            if (Array.isArray(accounts)) {
                if (accounts.length === 0) throw new Error('MetaMask is locked or it has not connected any accounts.')
                else if (accounts.length > 0) return // valid
            }
            // Any other error means failed to connect MetaMask
            throw new Error('Failed to connect to MetaMask.')
        }
    }

    async requestAccounts() {
        const web3 = await this.createWeb3()
        const chainId = await web3.eth.getChainId()
        const accounts = await web3.eth.requestAccounts()
        return {
            chainId,
            accounts,
        }
    }
}
