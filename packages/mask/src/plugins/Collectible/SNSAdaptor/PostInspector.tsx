import type { CollectibleJSON_Payload } from '../types/index.js'
import { Collectible } from './Collectible.js'
import { CollectibleState } from '../hooks/useCollectibleState.js'

export interface PostInspectorProps {
    payload: CollectibleJSON_Payload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <CollectibleState.Provider
            initialState={{
                chainId: token.chain_id,
                tokenId: token.token_id,
                contractAddress: token.address,
                provider: token.provider,
            }}>
            <Collectible />
        </CollectibleState.Provider>
    )
}
