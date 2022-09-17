import type { CollectibleJSON_Payload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Card/hooks/useContext.js'

export interface PostInspectorProps {
    payload: CollectibleJSON_Payload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <Context.Provider
            initialState={{
                chainId: token.chain_id,
                tokenId: token.token_id,
                contractAddress: token.address,
                provider: token.provider,
            }}>
            <Collectible />
        </Context.Provider>
    )
}
