import { type GeneratedIcon, Icons } from '@masknet/icons'
import { SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const ENS_CONTRACT_ADDRESS = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'

export const SUPPORTED_SOURCE_TYPES = [
    SourceType.OpenSea,
    SourceType.NFTScan,
    SourceType.Gem,
    SourceType.Rarible,
    // SourceType.X2Y2,
    // SourceType.NFTScan,
    // SourceType.Zora,
    // SourceType.LooksRare,
]

export const SuffixToChainIconMap: Record<string, GeneratedIcon> = {
    eth: Icons.ENS,
    bnb: Icons.SpaceId,
    csb: Icons.Crossbell,
    avax: Icons.Avalanche,
    arb: Icons.Arbitrum,
    bit: Icons.Bit,
    x: Icons.Unstoppable,
    dao: Icons.Unstoppable,
    crypto: Icons.Unstoppable,
    wallet: Icons.Unstoppable,
    bitcoin: Icons.Unstoppable,
    '888': Icons.Unstoppable,
    blockchain: Icons.Unstoppable,
    lens: Icons.Lens,
}

export const SuffixToChainIdMap: Record<string, ChainId> = {
    eth: ChainId.Mainnet,
    bnb: ChainId.BSC,
    csb: ChainId.Mainnet,
    avax: ChainId.Avalanche,
    arb: ChainId.Arbitrum,
    bit: ChainId.Mainnet,
    x: ChainId.Mainnet,
    dao: ChainId.Mainnet,
    crypto: ChainId.Mainnet,
    wallet: ChainId.Mainnet,
    bitcoin: ChainId.Mainnet,
    '888': ChainId.Mainnet,
    blockchain: ChainId.Mainnet,
    lens: ChainId.Mainnet,
}
