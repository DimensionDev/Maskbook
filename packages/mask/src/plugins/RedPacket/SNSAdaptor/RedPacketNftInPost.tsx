import { useEffect } from 'react'
import { RedPacketRPC } from '../messages.js'
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { RedPacketNft } from './RedPacketNft.js'
import { TransactionConfirmDialogProvider } from './context/TokenTransactionConfirmDialogContext.js'
import { ChainContextProvider } from '@masknet/web3-hooks-base'

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
        <TransactionConfirmDialogProvider>
            <ChainContextProvider value={{ chainId: payload.chainId }}>
                <RedPacketNft payload={payload} />
            </ChainContextProvider>
        </TransactionConfirmDialogProvider>
    )
}
