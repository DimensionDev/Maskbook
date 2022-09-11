import type { PayloadType } from '../types/index.js'
import { Collectible } from './Collectible.js'
import { CollectibleState } from '../hooks/useCollectibleState.js'

export interface PostInspectorProps {
    payload: PayloadType
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <CollectibleState.Provider
            initialState={{
                chainId: token.chain_id,
                creator: token.creator,
                tokenId: token.token_id,
                contractAddress: token.contractAddress,
            }}>
            <Collectible />
        </CollectibleState.Provider>
    )
}
