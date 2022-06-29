import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { useI18N } from '../locales'
import { RedPacketHistoryList } from './RedPacketHistoryList'
import { NftRedPacketHistoryList } from './NftRedPacketHistoryList'
import type { NftRedPacketHistory, RedPacketJSONPayload } from '../types'
import { RedPacketNftMetaKey } from '../constants'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { TabPanel } from '@mui/lab'

enum RpTypeTabs {
    ERC20 = 0,
    ERC721 = 1,
}

const useStyles = makeStyles()((theme) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        backgroundColor: theme.palette.background.default,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    img: {
        width: 20,
        marginRight: 4,
    },
    labelWrapper: {
        display: 'flex',
    },
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
    const t = useI18N()
    const { classes } = useStyles()
    const state = useState(RpTypeTabs.ERC20)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const { attachMetadata } = useCompositionContext()
    const handleSendNftRedpacket = useCallback(
        (history: NftRedPacketHistory, contractDetailed: NonFungibleTokenContract<ChainId, SchemaType.ERC721>) => {
            const { rpid, txid, duration, message, payload } = history
            attachMetadata(RedPacketNftMetaKey, {
                id: rpid,
                txid,
                duration,
                message,
                senderName,
                contractName: contractDetailed.name,
                contractAddress: contractDetailed.address,
                contractTokenURI: contractDetailed.logoURL ?? '',
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
