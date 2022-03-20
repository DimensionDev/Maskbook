import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    NetworkType,
    NonFungibleAssetProvider,
    ProviderType,
    ChainOptions,
    FungibleAssetProvider,
    DomainProvider,
    CurrencyType,
} from '@masknet/web3-shared-evm'
import {
    createConstantSubscription,
    getEnhanceableSiteType,
    getExtensionSiteType,
    mapSubscription,
} from '@masknet/shared-base'
import { EVM_RPC } from '../../../messages'

async function createSubscriptionFromChainOptions<T>(getter: (value: ChainOptions | undefined) => T) {
    const enhanceableSiteType = getEnhanceableSiteType()
    const extensionSiteType = getExtensionSiteType()
    return mapSubscription(await EVM_RPC.getStorageSubscription('memory', 'chainOptions'), (chainOptions) => {
        return getter(
            enhanceableSiteType
                ? chainOptions[enhanceableSiteType]
                : extensionSiteType
                ? chainOptions[extensionSiteType]
                : undefined,
        )
    })
}

export async function createSharedState(): Promise<Web3Plugin.ObjectCapabilities.SharedState> {
    return {
        allowTestnet: createConstantSubscription(process.env.NODE_ENV === 'development'),
        chainId: await createSubscriptionFromChainOptions((chainOptions) => chainOptions?.chainId ?? ChainId.Mainnet),
        account: await createSubscriptionFromChainOptions((chainOptions) => chainOptions?.account ?? ''),
        networkType: await createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.networkType ?? NetworkType.Ethereum,
        ),
        providerType: await createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.providerType ?? ProviderType.MaskWallet,
        ),
        assetType: await createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.assetType ?? FungibleAssetProvider.DEBANK,
        ),
        nameType: await createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.nameType ?? DomainProvider.ENS,
        ),
        collectibleType: await createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.nameType ?? NonFungibleAssetProvider.OPENSEA,
        ),
        currencyType: await createSubscriptionFromChainOptions(
            (chainOptions) => chainOptions?.currencyType ?? CurrencyType.USD,
        ),
    }
}
