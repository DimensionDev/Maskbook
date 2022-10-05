import { Icons } from '@masknet/icons'
import { useChainId } from '@masknet/web3-hooks-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { TransactionType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { Box } from '@mui/material'
import { memo, useMemo } from 'react'

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
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
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
            case TransactionType.SEND:
                return <Icons.Upload color={MaskColorVar.warning} className={classes.icon} />
            case TransactionType.TRANSFER:
                return <Icons.Upload color={MaskColorVar.warning} className={classes.icon} />
            case TransactionType.WITHDRAW:
            case TransactionType.RECEIVE:
                return <Icons.Download color={MaskColorVar.success} className={classes.icon} />
            case TransactionType.CREATE_LUCKY_DROP:
            case TransactionType.CREATE_RED_PACKET:
                return <Icons.RedPacket className={classes.icon} />
            case TransactionType.FILL_POOL:
                return <Icons.ITO color={MaskColorVar.warning} className={classes.icon} />
            default:
                return <Icons.Interaction color={MaskColorVar.warning} className={classes.icon} />
        }
    }, [isFailed, isRedPacket, type])

    const isNotFailed = !isFailed && !!transactionType
    const isSuccess =
        isNotFailed &&
        [TransactionType.RECEIVE, TransactionType.CLAIM, TransactionType.WITHDRAW].includes(
            transactionType as TransactionType,
        )
    const isWarning =
        isNotFailed &&
        [
            TransactionType.SEND,
            TransactionType.FILL_POOL,
            TransactionType.CREATE_RED_PACKET,
            TransactionType.CREATE_LUCKY_DROP,
            TransactionType.TRANSFER,
            TransactionType.SWAP,
        ].includes(transactionType as TransactionType)

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
