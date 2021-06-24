import { memo, useMemo } from 'react'
import { RedPacketIcon, CloseIcon, UploadIcon, InteractionIcon, DownloadIcon } from '@masknet/icons'
import { FilterTransactionType, isSameAddress } from '@masknet/web3-shared'
import { makeStyles } from '@material-ui/styles'
import { Box } from '@material-ui/core'
import classNames from 'classnames'
import { MaskColorVar } from '@masknet/theme'
import { useRedPacketAddress } from '../../../../hooks/useRedPacketAddress'

const useStyles = makeStyles(() => ({
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
    transactionType: string
    address: string
    failed: boolean
}

export const TransactionIcon = memo<TransactionIconProps>(({ address, failed, transactionType }) => {
    const redPacketAddress = useRedPacketAddress()
    const isRedPacket = isSameAddress(redPacketAddress, address)

    return <TransactionIconUI isRedPacket={isRedPacket} isFailed={failed} transactionType={transactionType} />
})

export interface TransactionIconUIProps {
    isRedPacket: boolean
    isFailed: boolean
    transactionType: string
}

export const TransactionIconUI = memo<TransactionIconUIProps>(({ isFailed, isRedPacket, transactionType }) => {
    const classes = useStyles()
    const icon = useMemo(() => {
        if (isFailed) return <CloseIcon style={{ stroke: MaskColorVar.redMain }} className={classes.icon} />
        if (isRedPacket) return <RedPacketIcon className={classes.icon} />

        switch (transactionType) {
            case FilterTransactionType.SENT:
                return <UploadIcon style={{ stroke: MaskColorVar.warning }} className={classes.icon} />
            case FilterTransactionType.RECEIVE:
                return <DownloadIcon style={{ stroke: MaskColorVar.greenMain }} className={classes.icon} />
            default:
                return <InteractionIcon style={{ stroke: MaskColorVar.warning }} className={classes.icon} />
        }
    }, [isFailed, isRedPacket, transactionType])

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
