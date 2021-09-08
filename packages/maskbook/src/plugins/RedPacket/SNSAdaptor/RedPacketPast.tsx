import { makeStyles } from '@masknet/theme'
import { useCallback, useState } from 'react'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'
import { IconURLs } from './IconURL'
import { RedPacketHistoryList } from './RedPacketHistoryList'
import { NftRedPacketHistoryList } from './NftRedPacketHistoryList'
import type { NftRedPacketHistory, RedPacketJSONPayload } from '../types'
import { RedPacketNftMetaKey } from '../constants'
import { useCompositionContext } from '../../../components/CompositionDialog/CompositionContext'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { ERC721ContractDetailed } from '@masknet/web3-shared'

enum RpTypeTabs {
    ERC20 = 0,
    ERC721 = 1,
}

const useStyles = makeStyles()((theme) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
        color: theme.palette.mode === 'light' ? '#15181B' : '#D9D9D9',
    },
    tabs: {
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        width: 520,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        '& .Mui-selected': {
            backgroundColor: '#1C68F3',
            color: '#fff !important',
        },
        borderRadius: 4,
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
}))

interface Props {
    onSelect: (payload: RedPacketJSONPayload) => void
    onClose?: () => void
}

export function RedPacketPast({ onSelect, onClose }: Props) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const state = useState(RpTypeTabs.ERC20)

    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'
    const { attachMetadata } = useCompositionContext()
    const handleSendNftRedpacket = useCallback(
        (history: NftRedPacketHistory, contractDetailed: ERC721ContractDetailed) => {
            const { rpid, txid, duration, message, payload } = history
            attachMetadata(RedPacketNftMetaKey, {
                id: rpid,
                txid,
                duration: duration,
                message: message,
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
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: (
                    <div className={classes.labelWrapper}>
                        <img className={classes.img} src={IconURLs.erc20Token} />
                        <span>{t('plugin_red_packet_erc20_tab_title')}</span>
                    </div>
                ),
                children: <RedPacketHistoryList onSelect={onSelect} />,
                sx: { p: 0 },
            },
            {
                label: (
                    <div className={classes.labelWrapper}>
                        <img className={classes.img} src={IconURLs.erc721Token} />
                        <span>{t('plugin_red_packet_erc721_tab_title')}</span>
                    </div>
                ),
                children: <NftRedPacketHistoryList onSend={handleSendNftRedpacket} />,
                sx: { p: 0 },
            },
        ],
        state,
        classes,
    }
    return <AbstractTab height={500} {...tabProps} />
}
