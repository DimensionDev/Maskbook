import { useCurrentVisitingIdentity } from '@masknet/plugin-infra/content-script'
import { PluginWalletStatusBar, useCurrentLinkedPersona } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { type NftRedPacketJSONPayload, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TabPanel } from '@mui/lab'
import { Box } from '@mui/material'
import { memo, useCallback, useContext } from 'react'
import { RedPacketNftMetaKey } from '../constants.js'
import { NftRedPacketHistoryList } from './NftRedPacketHistoryList.js'
import { RedPacketHistoryList } from './RedPacketHistoryList.js'
import { openComposition } from './openComposition.js'
import { CompositionTypeContext } from './RedPacketInjection.js'

const useStyles = makeStyles()((theme) => ({
    tabWrapper: {
        padding: theme.spacing(0, 2, 0, 2),
    },
    list: {
        boxSizing: 'border-box',
        paddingBottom: theme.spacing(8), // Fill the space for footer of the dialog
    },
}))

interface Props {
    tabs: Record<'tokens' | 'collectibles', 'tokens' | 'collectibles'>
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose?: () => void
}

export const RedPacketPast = memo(function RedPacketPast({ onSelect, onClose, tabs }: Props) {
    const { classes } = useStyles()

    const currentIdentity = useCurrentVisitingIdentity()
    const linkedPersona = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier?.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const compositionType = useContext(CompositionTypeContext)
    const handleSendNftRedpacket = useCallback(
        (history: NftRedPacketJSONPayload, collection: NonFungibleCollection<ChainId, SchemaType>) => {
            const { rpid, txid, duration, sender, password, chainId } = history
            openComposition(
                RedPacketNftMetaKey,
                {
                    id: rpid,
                    txid,
                    duration,
                    message: sender.message,
                    senderName,
                    contractName: collection.name,
                    contractAddress: collection.address,
                    contractTokenURI: collection.iconURL ?? '',
                    privateKey: password,
                    chainId,
                },
                compositionType,
            )
            onClose?.()
        },
        [senderName, compositionType],
    )

    return (
        <>
            <div className={classes.tabWrapper}>
                <TabPanel value={tabs.tokens} style={{ padding: 0 }}>
                    <RedPacketHistoryList className={classes.list} onSelect={onSelect} />
                </TabPanel>
                <TabPanel value={tabs.collectibles} style={{ padding: 0 }}>
                    <NftRedPacketHistoryList className={classes.list} onSend={handleSendNftRedpacket} />
                </TabPanel>
            </div>
            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} />
            </Box>
        </>
    )
})
