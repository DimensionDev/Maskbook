import { type GeneratedIcon, Icons } from '@masknet/icons'
import { ChainId } from '@masknet/web3-shared-evm'

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
