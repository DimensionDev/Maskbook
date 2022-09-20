import type { CollectiblePayload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Card/hooks/useContext.js'

export interface PostInspectorProps {
    payload: CollectiblePayload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <Context.Provider
            initialState={{
                chainId: token.chainId,
                tokenId: token.tokenId,
                contractAddress: token.address,
                provider: token.provider,
            }}>
            <Collectible />
        </Context.Provider>
    )
}
