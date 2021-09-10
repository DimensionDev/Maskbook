import { useEffect } from 'react'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { RedPacketRPC } from '../messages'
import type { RedPacketNftJSONPayload } from '../types'
import { RedPacketNft } from './RedPacketNft'

export interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    useEffect(() => {
        RedPacketRPC.updateRedPacketNft({
            type: 'red-packet-nft',
            id: payload.txid,
            password: payload.privateKey,
            contract_version: payload.contractVersion,
        })
    }, [payload])
    return (
        <EthereumChainBoundary chainId={payload.chainId}>
            <RedPacketNft payload={payload} />
        </EthereumChainBoundary>
    )
}
