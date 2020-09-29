import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react'
import {
    makeStyles,
    DialogTitle,
    IconButton,
    DialogContent,
    Typography,
    FormControl,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
    DialogProps,
    Box,
} from '@material-ui/core'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../../components/InjectedComponents/DialogDismissIcon'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { RedPacketInPost } from './RedPacket'
import Services from '../../../extension/service'
import type { RedPacketRecord, RedPacketJSONPayload } from '../types'
import type { RedPacketStatus } from '../types'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCapturedInput } from '../../../utils/hooks/useCapturedEvents'
import { PluginMessageCenter } from '../../PluginMessages'
import { getActivatedUI } from '../../../social-network/ui'
import { formatBalance } from '../../Wallet/formatter'
import ShadowRootDialog from '../../../utils/shadow-root/ShadowRootDialog'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import BigNumber from 'bignumber.js'
import { RedPacketMetaKey, RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_CONSTANTS } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { Token } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainId'
import { EthereumStatusBar } from '../../../web3/UI/EthereumStatusBar'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { createEetherToken } from '../../../web3/helpers'
import { SelectERC20TokenDialog } from '../../../web3/UI/SelectERC20TokenDialog'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useTokenApproveCallback, ApproveState } from '../../../web3/hooks/useTokenApproveCallback'
import { useCreateCallback } from '../hooks/useCreateCallback'
import { TransactionDialog } from '../../../web3/UI/TransactionDialog'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useBlockNumber } from '../../../web3/hooks/useBlockNumber'

const useStyles = makeStyles((theme) =>
    createStyles({
        wrapper: {
            display: 'flex',
            width: 400,
            height: '100%',
            flexDirection: 'column',
            margin: '0 auto',
        },
        scroller: {
            width: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        hint: {
            padding: theme.spacing(0.5, 1),
            border: `1px solid ${theme.palette.background.default}`,
            borderRadius: theme.spacing(1),
            margin: 'auto',
            cursor: 'pointer',
        },
    }),
)

export interface RedPacketOutboundListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onSelect?: (payload: RedPacketJSONPayload) => void
}

export function RedPacketOutboundList(props: RedPacketOutboundListProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { onSelect } = props

    // context
    const account = useAccount()
    const chainId = useChainId()

    // //#region fetch red packets
    // const blockNumber = useBlockNumber()
    // const [availableRedPackets, setAvailableRedPackets] = useState<RedPacketRecord[]>([])

    // const revalidateRedPackets = useCallback(async () => {
    //     setAvailableRedPackets(
    //         await Services.Plugin.invokePlugin('maskbook.red_packet', 'getOutboundRedPackets', chainId, account),
    //     )
    // }, [])

    // // revalidate at each block
    // useEffect(() => {
    //     revalidateRedPackets()
    //     return PluginMessageCenter.on('maskbook.red_packets.update', revalidateRedPackets)
    // }, [blockNumber, revalidateRedPackets])
    // //#endregion

    const onClick = useCallback(async (status?: RedPacketStatus | null, rpid?: RedPacketRecord['red_packet_id']) => {
        alert('CLICKED ME!')
        // if (status === null) return onSelect?.(null)
        // if (!rpid) return
        // const redPacket = await Services.Plugin.invokePlugin('maskbook.red_packet', 'getRedPacketByID', undefined, rpid)
        // if (typeof redPacket.raw_payload?.token === 'undefined') delete redPacket.raw_payload?.token
        // onSelect?.(redPacket.raw_payload ?? null)
    }, [])
    return (
        <div className={classes.wrapper}>
            <div className={classes.scroller}>
                {/* {availableRedPackets
                    .sort((a, b) => {
                        if (!a.create_nonce) return -1
                        if (!b.create_nonce) return 1
                        return b.create_nonce - a.create_nonce
                    })
                    .map((p) => (
                        <RedPacket onClick={onClick} key={p.id} redPacket={p} />
                    ))} */}
            </div>
        </div>
    )
}
