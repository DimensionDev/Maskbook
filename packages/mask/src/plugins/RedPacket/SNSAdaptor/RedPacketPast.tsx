import { useCallback } from 'react'
import { TabPanel } from '@mui/lab'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType, RedPacketJSONPayload, NftRedPacketJSONPayload } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { RedPacketHistoryList } from './RedPacketHistoryList.js'
import { NftRedPacketHistoryList } from './NftRedPacketHistoryList.js'
import { RedPacketNftMetaKey } from '../constants.js'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI.js'
import { openComposition } from './openComposition.js'
import { PluginWalletStatusBar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    tabWrapper: {
        padding: theme.spacing(0, 2, 0, 2),
    },
}))

interface Props {
    tabs: Record<'tokens' | 'collectibles', 'tokens' | 'collectibles'>
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose?: () => void
}

export function RedPacketPast({ onSelect, onClose, tabs }: Props) {
    const { classes } = useStyles()

    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.applicationDialogUpdated,
    )

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const handleSendNftRedpacket = useCallback(
        (history: NftRedPacketJSONPayload, collection: NonFungibleCollection<ChainId, SchemaType>) => {
            const { rpid, txid, duration, sender, password, chainId } = history
            openComposition(RedPacketNftMetaKey, {
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
            })
            closeApplicationBoardDialog()
            onClose?.()
        },
        [senderName],
    )

    return (
        <>
            <div className={classes.tabWrapper}>
                <TabPanel value={tabs.tokens} style={{ padding: 0 }}>
                    <RedPacketHistoryList onSelect={onSelect} />
                </TabPanel>
                <TabPanel value={tabs.collectibles} style={{ padding: 0 }}>
                    <NftRedPacketHistoryList onSend={handleSendNftRedpacket} />
                </TabPanel>
            </div>
            <Box style={{ width: '100%', position: 'absolute', bottom: 0 }}>
                <PluginWalletStatusBar requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} />
            </Box>
        </>
    )
}
