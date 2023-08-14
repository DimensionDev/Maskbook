import { useEffect } from 'react'
import { RedPacketRPC } from '../messages.js'
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
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
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: payload.chainId }}>
            <RedPacketNft payload={payload} />
        </Web3ContextProvider>
    )
}
