import type { CollectiblePayload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Context/index.js'

export interface PostInspectorProps {
    payload: CollectiblePayload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload

    return (
        <Context.Provider
            initialState={{
                pluginID: token.pluginID,
                chainId: token.chainId,
                tokenId: token.tokenId,
                tokenAddress: token.address,
            }}>
            <Collectible />
        </Context.Provider>
    )
}
