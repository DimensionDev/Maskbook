import { createWalletClient, defineChain, type Chain, custom, publicActions } from 'viem'
import {
    CHAIN_DESCRIPTORS,
    ChainId,
    createJsonRpcRequest,
    ErrorEditor,
    type RequestArguments,
} from '@masknet/web3-shared-evm'
import { fetchJsonRpcResponse } from './fetchJsonRpcResponse.js'
import * as chains from 'viem/chains'

export function createViemClient(chain: Chain | undefined, request: (arg: RequestArguments) => Promise<any>) {
    const client = createWalletClient({
        chain,
        transport: custom({ request }),
        pollingInterval: Number.MAX_SAFE_INTEGER,
    }).extend(publicActions)
    return client
}

export function createViemClientFromURL(chain: ChainId, url: string) {
    return createViemClient(chainIdToChain(chain), async (requestArguments) => {
        const response = await fetchJsonRpcResponse(url, createJsonRpcRequest(0, requestArguments))
        const editor = ErrorEditor.from(null, response)
        if (editor.presence) throw editor.error
        if ('result' in response) return response.result
        return undefined
    })
}

export function chainIdToChain(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return chains.mainnet
        case ChainId.Ropsten:
            return createChainFromDescriptor(chainId)
        case ChainId.Rinkeby:
            return createChainFromDescriptor(chainId)
        case ChainId.Gorli:
            return chains.goerli
        case ChainId.Kovan:
            return createChainFromDescriptor(chainId)
        case ChainId.Base:
            return chains.base
        case ChainId.Base_Goerli:
            return chains.baseGoerli
        case ChainId.BSC:
            return chains.bsc
        case ChainId.BSCT:
            return chains.bscTestnet
        case ChainId.Polygon:
            return chains.polygon
        case ChainId.Mumbai:
            return chains.polygonMumbai
        case ChainId.Arbitrum:
            return chains.arbitrum
        case ChainId.Arbitrum_Rinkeby:
            return createChainFromDescriptor(chainId)
        case ChainId.Arbitrum_Nova:
            return chains.arbitrumNova
        case ChainId.xDai:
            return chains.gnosis
        case ChainId.Avalanche:
            return chains.avalanche
        case ChainId.Avalanche_Fuji:
            return chains.avalancheFuji
        case ChainId.Celo:
            return chains.celo
        case ChainId.Fantom:
            return chains.fantom
        case ChainId.Aurora:
            return chains.aurora
        case ChainId.Aurora_Testnet:
            return chains.auroraTestnet
        case ChainId.Fuse:
            return chains.fuse
        case ChainId.Boba:
            return chains.boba
        case ChainId.Metis:
            return chains.metis
        case ChainId.Metis_Sepolia:
            return chains.metisSepolia
        case ChainId.Sei:
            return chains.sei
        case ChainId.Optimism:
            return chains.optimism
        case ChainId.Optimism_Kovan:
            return createChainFromDescriptor(chainId)
        case ChainId.Optimism_Goerli:
            return chains.optimismGoerli
        case ChainId.Conflux:
            return chains.confluxESpace
        case ChainId.Astar:
            return chains.astar
        case ChainId.Scroll:
            return chains.scroll
        case ChainId.ZKSync_Alpha_Testnet:
            return createChainFromDescriptor(chainId)
        case ChainId.Crossbell:
            return chains.crossbell
        case ChainId.Moonbeam:
            return chains.moonbeam
        case ChainId.Pulse:
            return createChainFromDescriptor(chainId)
        case ChainId.Klaytn:
            return createChainFromDescriptor(chainId)
        case ChainId.Harmony:
            return chains.harmonyOne
        case ChainId.Moonriver:
            return createChainFromDescriptor(chainId)
        case ChainId.Cronos:
            return chains.cronos
        case ChainId.Brise:
            return createChainFromDescriptor(chainId)
        case ChainId.Canto:
            return chains.canto
        case ChainId.DFK:
            return chains.dfk
        case ChainId.Doge:
            return createChainFromDescriptor(chainId)
        case ChainId.Evmos:
            return chains.evmos
        case ChainId.HuobiEco:
            return createChainFromDescriptor(chainId)
        case ChainId.IoTex:
            return createChainFromDescriptor(chainId)
        case ChainId.Kava:
            return chains.kava
        case ChainId.Kcc:
            return createChainFromDescriptor(chainId)
        case ChainId.Milkomeda:
            return createChainFromDescriptor(chainId)
        case ChainId.OKXChain:
            return createChainFromDescriptor(chainId)
        case ChainId.Palm:
            return createChainFromDescriptor(chainId)
        case ChainId.RSK:
            return createChainFromDescriptor(chainId)
        case ChainId.SmartBitcoinCash:
            return createChainFromDescriptor(chainId)
        case ChainId.Shiden:
            return chains.shiden
        case ChainId.SongbirdCanary:
            return createChainFromDescriptor(chainId)
        case ChainId.Step:
            return createChainFromDescriptor(chainId)
        case ChainId.Telos:
            return createChainFromDescriptor(chainId)
        case ChainId.Wanchain:
            return createChainFromDescriptor(chainId)
        case ChainId.XLayer:
            return chains.xLayer
        case ChainId.XLayer_Testnet:
            return chains.xLayerTestnet
        case ChainId.BitTorrent:
            return chains.bitTorrent
        case ChainId.Zora:
            return chains.zora
        case ChainId.Invalid:
            return undefined
    }
}

function createChainFromDescriptor(chainId: ChainId): Chain | undefined {
    const descriptor = CHAIN_DESCRIPTORS.find((x) => x.chainId === chainId)
    if (!descriptor) return undefined

    return defineChain({
        id: descriptor.chainId,
        name: descriptor.fullName || descriptor.name,
        nativeCurrency: descriptor.nativeCurrency,
        rpcUrls: {
            default: { http: [] },
            public: { http: [] },
        },
        blockExplorers:
            descriptor.explorerUrl?.url ?
                {
                    default: {
                        name: 'Explorer',
                        url: descriptor.explorerUrl.url,
                    },
                }
            :   undefined,
        testnet: descriptor.network !== 'mainnet',
    })
}
