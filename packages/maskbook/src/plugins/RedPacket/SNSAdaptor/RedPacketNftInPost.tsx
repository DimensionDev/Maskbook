import type { RedPacketNftJSONPayload } from '../types'
import { RedPacketNft } from './RedPacketNft'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

export interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    return (
        <EthereumChainBoundary chainId={payload.chainId}>
            <RedPacketNft payload={payload} />
        </EthereumChainBoundary>
    )
}
