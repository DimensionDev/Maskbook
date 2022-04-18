import { first } from 'lodash-unified'
import { delay, getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { ProviderState, ProviderStorage, Web3Plugin } from '@masknet/plugin-infra/web3'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import {
    ChainId,
    getNetworkTypeFromChainId,
    isSameAddress,
    isValidAddress,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared-evm'
import { Providers } from './Protocol/provider'
import { createConnection } from './Protocol/connection'
import type { Provider as BaseProvider } from './Protocol/types'

export class Provider
    extends ProviderState<ChainId, NetworkType, ProviderType>
    implements Web3Plugin.ObjectCapabilities.ProviderState<ChainId, NetworkType, ProviderType>
{
    constructor(context: Plugin.Shared.SharedContext) {
        const defaultValue: ProviderStorage<Web3Plugin.Account<ChainId>, ProviderType> = {
            accounts: getEnumAsArray(ProviderType).reduce((accumulator, providerType) => {
                accumulator[providerType.value] = {
                    account: '',
                    chainId: ChainId.Mainnet,
                }
                return accumulator
            }, {} as Record<ProviderType, Web3Plugin.Account<ChainId>>),
            providers: [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
                (accumulator, site) => {
                    accumulator[site.value] = ProviderType.MaskWallet
                    return accumulator
                },
                {} as Record<EnhanceableSite | ExtensionSite, ProviderType>,
            ),
        }

        super(context, defaultValue, {
            isSameAddress,
            getNetworkTypeFromChainId: (chainId: ChainId) => getNetworkTypeFromChainId(chainId) ?? NetworkType.Ethereum,
        })

        // bind account and changed changing listeners
        Object.entries(Providers).forEach((entry) => {
            const [providerType, provider] = entry as [ProviderType, BaseProvider]

            provider.emitter.on('chainId', async (chainId: string) => {
                await this.setChainId(providerType, Number.parseInt(chainId, 16))
            })

            provider.emitter.on('accounts', async (accounts: string[]) => {
                const account = first(accounts)
                if (account && isValidAddress(account)) await this.setAccount(providerType, account)
            })

            provider.emitter.on('discconect', async () => {
                await this.setAccount(providerType, '')
                await this.setChainId(providerType, ChainId.Mainnet)
            })
        })
    }

    async connect(chainId: ChainId, providerType: ProviderType) {
        const provider = Providers[providerType]

        // compose the connection result
        const account = await provider.connect(chainId)

        // switch the sub-network to the expected one
        if (chainId !== account.chainId) {
            const isChainSwitchable =
                // the coin98 wallet cannot handle add/switch RPC provider correctly
                // it will always add a new RPC provider even if the network exists
                providerType !== ProviderType.Coin98 &&
                // to switch chain with walletconnect is not implemented widely
                providerType !== ProviderType.WalletConnect

            if (!isChainSwitchable) return account

            const connection = createConnection(providerType)

            await Promise.race([
                (async () => {
                    await delay(30 /* seconds */ * 1000 /* milliseconds */)
                    throw new Error('Timeout!')
                })(),
                chainId === ChainId.Mainnet
                    ? connection.switchChain?.(ChainId.Mainnet)
                    : connection.addChain?.(chainId),
            ])
        }

        provider.emitter.emit('connect', account)
        return account
    }

    async discconect(providerType: ProviderType) {
        await Providers[providerType].disconnect()
    }
}
