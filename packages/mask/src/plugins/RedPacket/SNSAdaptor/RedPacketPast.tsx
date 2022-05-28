import { useChainId } from '@masknet/web3-shared-evm'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useCallback, useState } from 'react'
import { useI18N } from '../locales'
import { IconURLs } from './IconURL'
import { RedPacketHistoryList } from './RedPacketHistoryList'
import { NftRedPacketHistoryList } from './NftRedPacketHistoryList'
import type { NftRedPacketHistory, RedPacketJSONPayload } from '../types'
import { RedPacketNftMetaKey } from '../constants'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import type { ERC721ContractDetailed } from '@masknet/web3-shared-evm'
import { Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'

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
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose?: () => void
}

export function RedPacketPast({ onSelect, onClose }: Props) {
    const t = useI18N()
    const { classes } = useStyles()
    const state = useState(RpTypeTabs.ERC20)
    const chainId = useChainId()

    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const { attachMetadata } = useCompositionContext()
    const handleSendNftRedpacket = useCallback(
        (history: NftRedPacketHistory, contractDetailed: ERC721ContractDetailed) => {
            const { rpid, txid, duration, message, payload } = history
            attachMetadata(RedPacketNftMetaKey, {
                id: rpid,
                txid,
                duration,
                message,
                senderName,
                contractName: contractDetailed.name,
                contractAddress: contractDetailed.address,
                contractTokenURI: contractDetailed.iconURL ?? '',
                privateKey: payload.password,
                chainId: history.chain_id,
            })
            onClose?.()
        },
        [senderName, onClose],
    )

    const [currentTab, onChange, tabs] = useTabs('tokens', 'collectibles')

    return (
        <div className={classes.tabWrapper}>
            <TabContext value={currentTab}>
                <MaskTabList variant="base" onChange={onChange} aria-label="RedpacketHistory">
                    <Tab
                        label={
                            <div className={classes.labelWrapper}>
                                <img className={classes.img} src={IconURLs.erc20Token} />
                                <span>{t.erc20_tab_title()}</span>
                            </div>
                        }
                        value={tabs.tokens}
                    />
                    <Tab
                        label={
                            <div className={classes.labelWrapper}>
                                <img className={classes.img} src={IconURLs.erc721Token} />
                                <span>{t.erc721_tab_title()}</span>
                            </div>
                        }
                        value={tabs.collectibles}
                    />
                </MaskTabList>
                <TabPanel value={tabs.tokens} style={{ padding: 0 }}>
                    <RedPacketHistoryList onSelect={onSelect} />
                </TabPanel>
                <TabPanel value={tabs.collectibles} style={{ padding: 0 }}>
                    <NftRedPacketHistoryList onSend={handleSendNftRedpacket} />
                </TabPanel>
            </TabContext>
        </div>
    )
}
