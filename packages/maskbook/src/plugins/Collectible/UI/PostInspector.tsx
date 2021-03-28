import type { CollectibleJSON_Payload } from '../types'
import { Collectible } from './Collectible'

export interface PostInspectorProps {
    payload: CollectibleJSON_Payload
}

export function PostInspector(props: PostInspectorProps) {
    const { token } = props.payload
    return <Collectible tokenId={token.tokenId} tokenAddress={token.address} />
}
