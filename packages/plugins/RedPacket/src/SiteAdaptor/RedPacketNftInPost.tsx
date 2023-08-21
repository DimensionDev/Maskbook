import { useEffect } from 'react'
import { RedPacketRPC } from '../messages.js'
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { DefaultWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RedPacketNft } from './RedPacketNft.js'

export interface RedPacketNftInPostProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNftInPost({ payload }: RedPacketNftInPostProps) {
    useEffect(() => {
        RedPacketRPC.updateRedPacketNft({
            id: payload.txid,
            type: 'red-packet-nft',
            password: payload.privateKey,
            contract_version: payload.contractVersion,
        })
    }, [payload])
    return (
        <DefaultWeb3ContextProvider value={{ chainId: payload.chainId }}>
            <RedPacketNft payload={payload} />
        </DefaultWeb3ContextProvider>
    )
}
