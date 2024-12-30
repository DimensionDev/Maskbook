import { MaskLightTheme } from '@masknet/theme'
import { EVMWeb3ContextProvider, useNetworkContext } from '@masknet/web3-hooks-base'
import { ThemeProvider } from '@mui/material'
import { useEffect } from 'react'
import { RedPacketRPC } from '../messages.js'
import { NftRedPacket, type NftRedPacketProps } from './NftRedPacket/index.js'

export function NftRedPacketInPost({ payload }: Omit<NftRedPacketProps, 'currentPluginID'>) {
    const { pluginID } = useNetworkContext()
    useEffect(() => {
        RedPacketRPC.updateRedPacketNft({
            id: payload.txid,
            type: 'red-packet-nft',
            password: payload.privateKey,
            contract_version: payload.contractVersion,
        })
    }, [payload])

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <EVMWeb3ContextProvider>
                <NftRedPacket payload={payload} currentPluginID={pluginID} />
            </EVMWeb3ContextProvider>
        </ThemeProvider>
    )
}
