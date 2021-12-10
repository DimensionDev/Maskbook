import type { PayloadType } from '../types'
import { Collectible } from './Collectible'
import { CollectibleState } from '../hooks/useCollectibleState'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

export interface PostInspectorProps {
    payload: PayloadType
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <EthereumChainBoundary chainId={token.chain_id}>
            <CollectibleState.Provider
                initialState={{
                    chainId: token.chain_id,
                    creator: token.creator,
                    tokenId: token.token_id,
                    contractAddress: token.contractAddress,
                }}>
                <Collectible />
            </CollectibleState.Provider>
        </EthereumChainBoundary>
    )
}
