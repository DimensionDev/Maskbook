import { memo, useMemo } from 'react'
import { CloseIcon, DownloadIcon, InteractionIcon, ITOIcon, RedPacketIcon, UploadIcon } from '@masknet/icons'
import { FilterTransactionType, isSameAddress, TransactionType, useRedPacketConstants } from '@masknet/web3-shared'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Box } from '@material-ui/core'
import classNames from 'classnames'

const useStyles = makeStyles()(() => ({
    container: {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: MaskColorVar.warning.alpha(0.15),
    },
    success: {
        background: MaskColorVar.greenMain.alpha(0.15),
    },
    error: {
        background: MaskColorVar.redMain.alpha(0.15),
    },
    icon: {
        fontSize: 20,
        fill: 'none',
    },
}))

export interface TransactionIconProps {
    type?: string
    transactionType: string
    address: string
    failed: boolean
}

export const TransactionIcon = memo<TransactionIconProps>(({ address, failed, type, transactionType }) => {
    const { HAPPY_RED_PACKET_ADDRESS_V1, HAPPY_RED_PACKET_ADDRESS_V2, HAPPY_RED_PACKET_ADDRESS_V3 } =
        useRedPacketConstants()

    const isRedPacket =
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V1, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V2, address) ||
        isSameAddress(HAPPY_RED_PACKET_ADDRESS_V3, address)

    return (
        <TransactionIconUI transactionType={transactionType} isRedPacket={isRedPacket} isFailed={failed} type={type} />
    )
})

export interface TransactionIconUIProps {
    isRedPacket: boolean
    isFailed: boolean
    type?: string
    transactionType: string
}

export const TransactionIconUI = memo<TransactionIconUIProps>(({ isFailed, isRedPacket, type, transactionType }) => {
    const { classes } = useStyles()
    const icon = useMemo(() => {
        if (isFailed) return <CloseIcon style={{ stroke: MaskColorVar.redMain }} className={classes.icon} />
        // if (isRedPacket) return <RedPacketIcon className={classes.icon} />

        console.log(type)

        switch (type) {
            case TransactionType.SEND:
                return <UploadIcon style={{ stroke: MaskColorVar.warning }} className={classes.icon} />
            case TransactionType.RECEIVE:
                return <DownloadIcon style={{ stroke: MaskColorVar.greenMain }} className={classes.icon} />
            case TransactionType.CREATE_RED_PACKET:
                return <RedPacketIcon className={classes.icon} />
            case TransactionType.FILL_POOL:
                return <ITOIcon className={classes.icon} />
            default:
                return <InteractionIcon style={{ stroke: MaskColorVar.warning }} className={classes.icon} />
        }
    }, [isFailed, isRedPacket, type])

    return (
        <Box
            className={classNames(classes.container, {
                [classes.error]: isFailed,
                [classes.success]: transactionType === FilterTransactionType.RECEIVE,
            })}>
            {icon}
        </Box>
    )
})
