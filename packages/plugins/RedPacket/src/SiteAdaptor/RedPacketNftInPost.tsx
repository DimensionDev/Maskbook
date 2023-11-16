import { useEffect } from 'react'
import { RedPacketRPC } from '../messages.js'
import type { RedPacketNftJSONPayload } from '@masknet/web3-providers/types'
import { EVMWeb3ContextProvider } from '@masknet/web3-hooks-base'
import { RedPacketNft } from './RedPacketNft.js'
import { ThemeProvider } from '@mui/material'
import { MaskLightTheme } from '@masknet/theme'

interface RedPacketNftInPostProps {
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
        <EVMWeb3ContextProvider chainId={payload.chainId}>
            <ThemeProvider theme={MaskLightTheme}>
                <RedPacketNft payload={payload} />
            </ThemeProvider>
        </EVMWeb3ContextProvider>
    )
}
