import type { ChainId, ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import type { TokenInfo } from '../types'
import { NFTListPage } from './NFTListPage'

interface NFTListProps {
    address: string
    tokenInfo?: TokenInfo
    chainId: ChainId
    onSelect: (token: ERC721TokenDetailed) => void
    tokens?: ERC721TokenDetailed[]
    children?: React.ReactElement
}

export function NFTList(props: NFTListProps) {
    const { address, onSelect, tokenInfo, tokens = [], children, chainId } = props

    if (!address) return null
    return (
        <NFTListPage
            tokens={tokens.filter((y) => y.contractDetailed.chainId === chainId) ?? []}
            tokenInfo={tokenInfo}
            chainId={chainId}
            address={address}
            onSelect={onSelect}
            children={children}
        />
    )
}
