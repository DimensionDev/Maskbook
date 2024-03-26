import { difference } from 'lodash-es'
import { Flags } from '@masknet/flags'
import {
    type ChainDescriptor,
    type NetworkDescriptor,
    type ProviderDescriptor,
    TokenType,
} from '@masknet/web3-shared-base'
import {
    EnhanceableSite,
    EnhanceableSiteList,
    ExtensionSiteList,
    NetworkPluginID,
    Sniffings,
} from '@masknet/shared-base'
import CHAINS from './chains.json'
import { ChainId, NetworkType, ProviderType, SchemaType } from '../types/index.js'
import { ChainIdList, getTokenConstant } from './constants.js'
import { ZERO_ADDRESS } from './primitives.js'

const PLUGIN_ID = NetworkPluginID.PLUGIN_EVM

export const NETWORK_DESCRIPTORS: ReadonlyArray<NetworkDescriptor<ChainId, NetworkType>> = [
    {
        ID: `${PLUGIN_ID}_ethereum`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mainnet,
        type: NetworkType.Ethereum,
        name: 'Ethereum',
        shortName: 'ETH',
        icon: new URL('../assets/ethereum.png', import.meta.url).href,
        iconColor: 'rgb(28, 104, 243)',
        averageBlockDelay: 10,
        backgroundGradient:
            'linear-gradient(180deg, rgba(98, 126, 234, 0.15) 0%, rgba(98, 126, 234, 0.05) 100%), rgba(255, 255, 255, 0.2)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_ropsten`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Ropsten,
        type: NetworkType.Ethereum,
        name: 'Ropsten',
        icon: new URL('../assets/ethereum.png', import.meta.url).href,
        iconColor: 'rgb(255, 65, 130)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_kovan`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Kovan,
        type: NetworkType.Ethereum,
        name: 'Kovan',
        icon: new URL('../assets/ethereum.png', import.meta.url).href,
        iconColor: 'rgb(133, 89, 255)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_rinkeby`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Rinkeby,
        type: NetworkType.Ethereum,
        name: 'Rinkeby',
        icon: new URL('../assets/ethereum.png', import.meta.url).href,
        iconColor: 'rgb(133, 89, 255)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_gorli`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Gorli,
        type: NetworkType.Ethereum,
        name: 'G\u00F6rli',
        icon: new URL('../assets/ethereum.png', import.meta.url).href,
        iconColor: 'rgb(48, 153, 242)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_bsc`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.BSC,
        type: NetworkType.Binance,
        name: 'BNB Chain',
        icon: new URL('../assets/binance.png', import.meta.url).href,
        iconColor: 'rgb(240, 185, 10)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(243, 186, 47, 0.15) 0%, rgba(243, 186, 47, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_bsct`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.BSCT,
        type: NetworkType.Binance,
        name: 'BSCT',
        icon: new URL('../assets/binance.png', import.meta.url).href,
        iconColor: 'rgb(240, 185, 10)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_base`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Base,
        type: NetworkType.Base,
        name: 'Base',
        icon: new URL('../assets/base.png', import.meta.url).href,
        iconColor: 'rgb(0, 82, 255)',
        backgroundGradient: 'linear-gradient(180deg, rgba(130, 71, 229, 0.15) 0%, rgba(130, 71, 229, 0.05) 100%)',
        averageBlockDelay: 10,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_base_gorli`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Base_Goerli,
        type: NetworkType.Base,
        name: 'Base Gorli',
        icon: new URL('../assets/base.png', import.meta.url).href,
        iconColor: 'rgb(0, 82, 255)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_polygon`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Matic,
        type: NetworkType.Polygon,
        name: 'Polygon',
        icon: new URL('../assets/polygon.png', import.meta.url).href,
        iconColor: 'rgb(119, 62, 225)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(130, 71, 229, 0.15) 0%, rgba(130, 71, 229, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_mumbai`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Mumbai,
        type: NetworkType.Polygon,
        name: 'Mumbai',
        icon: new URL('../assets/polygon.png', import.meta.url).href,
        iconColor: 'rgb(119, 62, 225)',
        averageBlockDelay: 10,
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_arbitrum`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Arbitrum,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum One',
        shortName: 'Arbitrum',
        icon: new URL('../assets/arbitrum.png', import.meta.url).href,
        iconColor: 'rgb(36, 150, 238)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(40, 160, 240, 0.15) 0%, rgba(40, 160, 240, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_arbitrum_rinkeby`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Arbitrum_Rinkeby,
        type: NetworkType.Arbitrum,
        name: 'Arbitrum Rinkeby',
        icon: new URL('../assets/arbitrum.png', import.meta.url).href,
        iconColor: 'rgb(36, 150, 238)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(40, 160, 240, 0.15) 0%, rgba(40, 160, 240, 0.05) 100%)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_xdai`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.xDai,
        type: NetworkType.xDai,
        name: 'Gnosis',
        icon: new URL('../assets/xdai.png', import.meta.url).href,
        iconColor: 'rgb(73, 169, 166)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(72, 168, 166, 0.15) 0%, rgba(72, 168, 166, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_celo`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Celo,
        type: NetworkType.Celo,
        name: 'Celo',
        icon: new URL('../assets/celo.png', import.meta.url).href,
        iconColor: 'rgb(53, 208, 127)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(251, 204, 92, 0.15) 0%, rgba(251, 204, 92, 0.05) 100%)',
        isMainnet: false,
    },
    {
        ID: `${PLUGIN_ID}_scroll`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Scroll,
        type: NetworkType.Scroll,
        name: 'Scroll',
        icon: new URL('../assets/scroll.svg', import.meta.url).href,
        backgroundGradient:
            'linear-gradient(180deg, rgba(98, 126, 234, 0.15) 0%, rgba(98, 126, 234, 0.05) 100%), rgba(255, 255, 255, 0.2)',
        iconColor: 'rgb(255, 248, 243)',
        averageBlockDelay: 9,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_avalanche`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Avalanche,
        type: NetworkType.Avalanche,
        name: 'Avalanche',
        shortName: 'AVAX',
        icon: new URL('../assets/avalanche.png', import.meta.url).href,
        backgroundGradient: 'linear-gradient(180deg, rgba(232, 65, 66, 0.15) 0%, rgba(232, 65, 66, 0.05) 100%)',
        iconColor: 'rgb(232, 65, 66)',
        averageBlockDelay: 10,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_aurora`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Aurora,
        type: NetworkType.Aurora,
        name: 'Aurora',
        icon: new URL('../assets/aurora.png', import.meta.url).href,
        iconColor: 'rgb(112, 212, 74)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(112, 212, 75, 0.15) 0%, rgba(112, 212, 75, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_conflux`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Conflux,
        type: NetworkType.Conflux,
        name: 'Conflux',
        icon: new URL('../assets/conflux.png', import.meta.url).href,
        iconColor: 'rgb(112, 212, 74)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(72, 168, 166, 0.15) 0%, rgba(72, 168, 166, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_astar`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Astar,
        type: NetworkType.Astar,
        name: 'Astar',
        icon: new URL('../assets/astar.png', import.meta.url).href,
        iconColor: 'rgb(36, 150, 238)',
        averageBlockDelay: 10,
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_fantom`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Fantom,
        type: NetworkType.Fantom,
        name: 'Fantom',
        icon: new URL('../assets/fantom.png', import.meta.url).href,
        iconColor: 'rgb(73, 169, 166)',
        averageBlockDelay: 10,
        backgroundGradient: 'linear-gradient(180deg, rgba(24, 94, 255, 0.15) 0%, rgba(24, 94, 255, 0.05) 100%)',
        isMainnet: true,
    },
    {
        ID: `${PLUGIN_ID}_optimism`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Optimism,
        type: NetworkType.Optimism,
        name: 'Optimism',
        icon: new URL('../assets/optimism.png', import.meta.url).href,
        iconColor: 'rgb(232, 65, 66)',
        backgroundGradient: 'linear-gradient(180deg, rgba(232, 65, 66, 0.15) 0%, rgba(232, 65, 66, 0.05) 100%)',
        isMainnet: true,
        averageBlockDelay: 10,
    },
    {
        ID: `${PLUGIN_ID}_moonbeam`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Moonbeam,
        type: NetworkType.Moonbeam,
        icon: new URL('../assets/moonbeam.png', import.meta.url).href,
        iconColor: 'rgb(36, 150, 238)',
        name: 'Moonbeam',
        isMainnet: false,
        averageBlockDelay: 10,
    },
    {
        ID: `${PLUGIN_ID}_metis`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Metis,
        type: NetworkType.Metis,
        icon: new URL('../assets/metis.svg', import.meta.url).href,
        iconColor: 'rgb(36, 150, 238)',
        backgroundGradient: 'linear-gradient(180deg, rgba(130, 71, 229, 0.15) 0%, rgba(130, 71, 229, 0.05) 100%)',
        name: 'Metis',
        isMainnet: true,
        averageBlockDelay: 10,
    },
    {
        ID: `${PLUGIN_ID}_metis_sepolia`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.Metis_Sepolia,
        type: NetworkType.Metis,
        icon: new URL('../assets/metis.svg', import.meta.url).href,
        iconColor: 'rgb(36, 150, 238)',
        backgroundGradient: 'linear-gradient(180deg, rgba(130, 71, 229, 0.15) 0%, rgba(130, 71, 229, 0.05) 100%)',
        name: 'Metis Sepolia',
        isMainnet: false,
        averageBlockDelay: 10,
    },
    {
        ID: `${PLUGIN_ID}_x1_testnet`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.X1_Testnet,
        type: NetworkType.X1_Testnet,
        icon: new URL('../assets/x1.png', import.meta.url).href,
        iconColor: 'rgb(255, 255, 255)',
        name: 'X1 Testnet',
        isMainnet: true,
        averageBlockDelay: 10,
    },
    {
        ID: `${PLUGIN_ID}_x1`,
        networkSupporterPluginID: PLUGIN_ID,
        chainId: ChainId.X1,
        type: NetworkType.X1_Testnet,
        icon: new URL('../assets/x1.png', import.meta.url).href,
        iconColor: 'rgb(255, 255, 255)',
        name: 'X1',
        isMainnet: false,
        averageBlockDelay: 10,
    },
]

export const CHAIN_DESCRIPTORS: ReadonlyArray<ChainDescriptor<ChainId, SchemaType, NetworkType>> = CHAINS.map((x) => {
    const network = NETWORK_DESCRIPTORS.find((y) => y.chainId === x.chainId)
    return {
        ...x,
        ID: `${x.chainId}_${x.name}`,
        coinMarketCapChainId: '',
        coinGeckoChainId: '',
        coinGeckoPlatformId: '',
        type: (x.type as NetworkType | undefined) || NetworkType.Ethereum,
        color: network?.iconColor || x.color || 'rgb(138, 138, 138)',
        nativeCurrency: {
            id: getTokenConstant(x.chainId, 'NATIVE_TOKEN_ADDRESS', ZERO_ADDRESS)!,
            address: getTokenConstant(x.chainId, 'NATIVE_TOKEN_ADDRESS', ZERO_ADDRESS)!,
            type: TokenType.Fungible,
            schema: SchemaType.Native,
            ...x.nativeCurrency,
        },
        // not accessible
        rpcUrl: '',
        iconUrl: network?.icon || x.nativeCurrency.logoURL,
        explorerUrl: {
            url: x.explorers?.[0]?.url || x.infoURL,
        },
        isCustomized: false,
    }
})

export const PROVIDER_DESCRIPTORS: ReadonlyArray<ProviderDescriptor<ChainId, ProviderType>> = [
    {
        ID: `${PLUGIN_ID}_maskwallet`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MaskWallet,
        name: 'Mask Network',
        icon: new URL('../assets/maskwallet.png', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: difference(EnhanceableSiteList, [
                EnhanceableSite.Localhost,
                EnhanceableSite.Firefly,
            ]),
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://mask.io',
        shortenLink: 'mask.io',
        downloadLink: 'https://mask.io/download-links',
        iconFilterColor: 'rgba(28, 104, 243, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_browser`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Browser,
        name: 'Browser Wallet',
        icon: new URL('../assets/metamask.svg', import.meta.url).href,
        enableRequirements:
            process.env.NODE_ENV === 'development' ?
                {
                    supportedChainIds: ChainIdList,
                    supportedEnhanceableSites: EnhanceableSiteList,
                    supportedExtensionSites: ExtensionSiteList,
                }
            :   undefined,
        homeLink: '',
        shortenLink: '',
        downloadLink: '',
        iconFilterColor: 'rgba(216, 124, 48, 0.3)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(248, 156, 53, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_customEvent`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.CustomEvent,
        name: 'Custom Event Wallet',
        icon: new URL('../assets/metamask.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: [EnhanceableSite.Firefly],
            supportedExtensionSites: [],
        },
        homeLink: '',
        shortenLink: '',
        downloadLink: '',
        iconFilterColor: 'rgba(216, 124, 48, 0.3)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(248, 156, 53, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_metamask`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.MetaMask,
        name: 'MetaMask',
        icon: new URL('../assets/metamask.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://metamask.io',
        shortenLink: 'metamask.io',
        downloadLink: 'https://metamask.io/download/',
        iconFilterColor: 'rgba(216, 124, 48, 0.3)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(248, 156, 53, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_walletconnect`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.WalletConnect,
        name: 'WalletConnect',
        icon: new URL('../assets/walletconnect.png', import.meta.url).href,
        enableRequirements:
            Flags.wc_enabled ?
                {
                    supportedChainIds: ChainIdList,
                    supportedEnhanceableSites: difference(EnhanceableSiteList, [
                        EnhanceableSite.Localhost,
                        EnhanceableSite.Firefly,
                    ]),
                    supportedExtensionSites: Flags.wc_enabled ? ExtensionSiteList : [],
                }
            :   undefined,
        homeLink: 'https://walletconnect.com',
        shortenLink: 'walletconnect.com',
        downloadLink: 'https://walletconnect.com',
        iconFilterColor: 'rgba(59, 153, 252, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(59, 153, 252, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_coin98`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Coin98,
        name: 'Coin98',
        icon: new URL('../assets/coin98.png', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://coin98.com',
        shortenLink: 'coin98.com',
        downloadLink: 'https://coin98.com/wallet',
    },
    {
        ID: `${PLUGIN_ID}_coinbase`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Coinbase,
        name: 'Coinbase',
        icon: new URL('../assets/coinbase.png', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://www.coinbase.com/wallet',
        shortenLink: 'coinbase.com',
        downloadLink: 'https://www.coinbase.com/wallet/downloads',
    },
    {
        ID: `${PLUGIN_ID}_tokenpocket`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.TokenPocket,
        name: 'TokenPocket',
        icon: new URL('../assets/tokenpocket.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://tokenpocket.pro/',
        shortenLink: 'tokenpocket.pro',
        downloadLink: 'https://www.tokenpocket.pro/en/download/app',
    },
    {
        ID: `${PLUGIN_ID}_okx`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.OKX,
        name: 'OKX Wallet',
        icon: new URL('../assets/okx.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: [ChainId.Mainnet, ChainId.Arbitrum, ChainId.Avalanche, ChainId.Optimism, ChainId.Matic],
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: [],
        },
        homeLink: 'https://www.okx.com/web3',
        shortenLink: 'okx.com',
        downloadLink: 'https://www.okx.com/web3',
        iconFilterColor: 'rgba(0, 0, 0, 0.20)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_opera`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Opera,
        name: 'Opera',
        icon: new URL('../assets/opera.png', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: [ChainId.Mainnet, ChainId.BSC, ChainId.Matic],
            supportedEnhanceableSites: Sniffings.is_opera ? EnhanceableSiteList : [],
            supportedExtensionSites: [],
        },
        homeLink: 'https://www.opera.com/crypto/next',
        shortenLink: 'opera.com',
        downloadLink: 'https://www.opera.com/crypto/next',
        backgroundGradient:
            'linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_clover`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Clover,
        name: 'Clover',
        icon: new URL('../assets/clover.png', import.meta.url).href,
        backgroundGradient:
            'linear-gradient(90deg, rgba(52, 133, 196, 0.2) 0%, rgba(0, 239, 139, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
        enableRequirements: {
            supportedChainIds: Sniffings.is_firefox ? [] : ChainIdList,
            supportedEnhanceableSites: Sniffings.is_firefox ? [] : EnhanceableSiteList,
            supportedExtensionSites: [],
        },
        homeLink: 'https://clv.org',
        shortenLink: 'clv.org',
        downloadLink: 'https://clv.org/?type=wallet',
    },
    {
        ID: `${PLUGIN_ID}_fortmatic`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Fortmatic,
        name: 'Fortmatic',
        icon: new URL('../assets/fortmatic.png', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: Sniffings.is_firefox ? [] : [ChainId.Mainnet, ChainId.BSC],
            supportedEnhanceableSites: Sniffings.is_firefox ? [] : EnhanceableSiteList,
            supportedExtensionSites: Sniffings.is_firefox ? [] : ExtensionSiteList,
        },
        homeLink: 'https://fortmatic.com',
        shortenLink: 'fortmatic.com',
        downloadLink: 'https://fortmatic.com',
        iconFilterColor: 'rgba(104, 81, 255, 0.2)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_bitget`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.BitGet,
        name: 'BitGet',
        icon: new URL('../assets/bitget.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://web3.bitget.com/',
        shortenLink: 'web3.bitget.com',
        downloadLink: 'https://web3.bitget.com/en/wallet-download?type=2',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_onekey`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.OneKey,
        name: 'OneKey',
        icon: new URL('../assets/onekey.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://onekey.so/',
        shortenLink: 'onekey.so',
        downloadLink: 'https://onekey.so/download?client=browserExtension',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_rabby`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Rabby,
        name: 'Rabby',
        icon: new URL('../assets/rabby.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://rabby.io/',
        shortenLink: 'rabby.io',
        downloadLink: 'https://rabby.io/',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_rainbow`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Rainbow,
        name: 'Rainbow',
        icon: new URL('../assets/rainbow.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://rainbow.me/',
        shortenLink: 'rainbow.me',
        downloadLink: 'https://rainbow.me/download',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_trust`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Trust,
        name: 'Trust',
        icon: new URL('../assets/trust.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://trustwallet.com/',
        shortenLink: 'trustwallet.com',
        downloadLink: 'https://trustwallet.com/',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
    {
        ID: `${PLUGIN_ID}_zerion`,
        providerAdaptorPluginID: PLUGIN_ID,
        type: ProviderType.Zerion,
        name: 'Zerion',
        icon: new URL('../assets/zerion.svg', import.meta.url).href,
        enableRequirements: {
            supportedChainIds: ChainIdList,
            supportedEnhanceableSites: EnhanceableSiteList,
            supportedExtensionSites: ExtensionSiteList,
        },
        homeLink: 'https://zerion.io/',
        shortenLink: 'zerion.io',
        downloadLink: 'https://zerion.io/',
        iconFilterColor: 'rgba(41, 98, 239, 0.20)',
        backgroundGradient:
            'linear-gradient(90deg, rgba(104, 81, 255, 0.2) 0%, rgba(98, 126, 234, 0.2) 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)',
    },
]
