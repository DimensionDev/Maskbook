import type { CollectibleJSON_Payload } from '../types'
import { Collectible } from './Collectible'
import { CollectibleState } from '../hooks/useCollectibleState'
import { ChainState } from '../../../web3/state/useChainState'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

export interface PostInspectorProps {
    payload: CollectibleJSON_Payload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <EthereumChainBoundary chainId={token.chain_id}>
            <ChainState.Provider>
                <CollectibleState.Provider
                    initialState={{
                        chainId: token.chain_id,
                        tokenId: token.token_id,
                        contractAddress: token.address,
                    }}>
                    <Collectible />
                </CollectibleState.Provider>
            </ChainState.Provider>
        </EthereumChainBoundary>
    )
}
