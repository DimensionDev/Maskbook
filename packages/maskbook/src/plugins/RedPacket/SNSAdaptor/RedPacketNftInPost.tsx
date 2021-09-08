import { useEffect } from 'react'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { RedPacketNftRPC } from '../messages'
import type { RedPacketNftJSONPayload } from '../types'
import { RedPacketNft } from './RedPacketNft'

export interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    useEffect(() => {
        RedPacketNftRPC.updateRedPacketNftPassword(payload.txid, payload.privateKey)
    }, [payload.txid, payload.privateKey])
    return (
        <EthereumChainBoundary chainId={payload.chainId}>
            <RedPacketNft payload={payload} />
        </EthereumChainBoundary>
    )
}
