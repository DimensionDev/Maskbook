import type { CollectibleJSON_Payload } from '../types'
import { Collectible } from './Collectible'
import { CollectibleState } from '../hooks/useCollectibleState'
import { ChainState } from '../../../web3/state/useChainState'

export interface PostInspectorProps {
    payload: CollectibleJSON_Payload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <ChainState.Provider>
            <CollectibleState.Provider
                initialState={{
                    tokenId: token.token_id,
                    contractAddress: token.address,
                }}>
                <Collectible />
            </CollectibleState.Provider>
        </ChainState.Provider>
    )
}
