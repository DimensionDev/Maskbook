import { memo, useMemo } from 'react'
import { Box } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useRedPacketConstants } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { HistoryAPI } from '@masknet/web3-providers/types'

const useStyles = makeStyles()(() => ({
    container: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // default backgroundColor
        background: MaskColorVar.warning.alpha(0.1),
    },
    success: {
        background: MaskColorVar.success.alpha(0.1),
    },
    warning: {
        background: MaskColorVar.warning.alpha(0.1),
    },
    error: {
        background: MaskColorVar.redMain.alpha(0.1),
    },
    icon: {
        height: 20,
        width: 20,
    },
}))

export interface TransactionIconProps {
    type?: string
    transactionType?: string
    address: string
    failed: boolean
}

export const TransactionIcon = memo<TransactionIconProps>(({ address, failed, type, transactionType }) => {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const {
        HAPPY_RED_PACKET_ADDRESS_V1,
        HAPPY_RED_PACKET_ADDRESS_V2,
        HAPPY_RED_PACKET_ADDRESS_V3,
        HAPPY_RED_PACKET_ADDRESS_V4,
    } = useRedPacketConstants(chainId)

    const isRedPacket =
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V4, address)

    return (
        <TransactionIconUI transactionType={transactionType} isRedPacket={isRedPacket} isFailed={failed} type={type} />
    )
})

export interface TransactionIconUIProps {
    isRedPacket: boolean
    isFailed: boolean
    type?: string
    transactionType?: string
}

export const TransactionIconUI = memo<TransactionIconUIProps>(({ isFailed, isRedPacket, type, transactionType }) => {
    const { classes, cx } = useStyles()
    const icon = useMemo(() => {
        if (isFailed) return <Icons.Close color={MaskColorVar.redMain} className={classes.icon} />
        if (isRedPacket) return <Icons.RedPacket className={classes.icon} />

        switch (type) {
            case HistoryAPI.TransactionType.SEND:
                return <Icons.TxOut color={MaskColorVar.warning} className={classes.icon} />
            case HistoryAPI.TransactionType.TRANSFER:
                return <Icons.TxOut color={MaskColorVar.warning} className={classes.icon} />
            case HistoryAPI.TransactionType.WITHDRAW:
            case HistoryAPI.TransactionType.RECEIVE:
                return <Icons.Download color={MaskColorVar.success} className={classes.icon} />
            case HistoryAPI.TransactionType.CREATE_LUCKY_DROP:
            case HistoryAPI.TransactionType.CREATE_RED_PACKET:
                return <Icons.RedPacket className={classes.icon} />
            default:
                return <Icons.Interaction color={MaskColorVar.warning} className={classes.icon} />
        }
    }, [isFailed, isRedPacket, type])

    const isNotFailed = !isFailed && !!transactionType
    const isSuccess =
        isNotFailed &&
        [
            HistoryAPI.TransactionType.RECEIVE,
            HistoryAPI.TransactionType.CLAIM,
            HistoryAPI.TransactionType.WITHDRAW,
        ].includes(transactionType as HistoryAPI.TransactionType)
    const isWarning =
        isNotFailed &&
        [
            HistoryAPI.TransactionType.SEND,
            HistoryAPI.TransactionType.FILL_POOL,
            HistoryAPI.TransactionType.CREATE_RED_PACKET,
            HistoryAPI.TransactionType.CREATE_LUCKY_DROP,
            HistoryAPI.TransactionType.TRANSFER,
            HistoryAPI.TransactionType.SWAP,
        ].includes(transactionType as HistoryAPI.TransactionType)

    return (
        <Box
            data-type={transactionType}
            className={cx(classes.container, {
                [classes.error]: isFailed,
                [classes.success]: isSuccess,
                [classes.warning]: isWarning,
            })}>
            {icon}
        </Box>
    )
})
