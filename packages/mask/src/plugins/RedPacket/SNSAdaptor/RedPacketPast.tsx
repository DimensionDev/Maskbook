import { useCallback } from 'react'
import { TabPanel } from '@mui/lab'
import { makeStyles } from '@masknet/theme'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { RedPacketHistoryList } from './RedPacketHistoryList.js'
import { NftRedPacketHistoryList } from './NftRedPacketHistoryList.js'
import type { NftRedPacketHistory, RedPacketJSONPayload } from '../types.js'
import { RedPacketNftMetaKey } from '../constants.js'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI.js'

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

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const { attachMetadata } = useCompositionContext()
    const handleSendNftRedpacket = useCallback(
        (history: NftRedPacketHistory, collection: NonFungibleCollection<ChainId, SchemaType>) => {
            const { rpid, txid, duration, message, payload } = history
            attachMetadata(RedPacketNftMetaKey, {
                id: rpid,
                txid,
                duration,
                message,
                senderName,
                contractName: collection.name,
                contractAddress: collection.address,
                contractTokenURI: collection.iconURL ?? '',
                privateKey: payload.password,
                chainId: history.chain_id,
            })
            onClose?.()
        },
        [senderName, onClose],
    )

    return (
        <div className={classes.tabWrapper}>
            <TabPanel value={tabs.tokens} style={{ padding: 0 }}>
                <RedPacketHistoryList onSelect={onSelect} />
            </TabPanel>
            <TabPanel value={tabs.collectibles} style={{ padding: 0 }}>
                <NftRedPacketHistoryList onSend={handleSendNftRedpacket} />
            </TabPanel>
        </div>
    )
}
