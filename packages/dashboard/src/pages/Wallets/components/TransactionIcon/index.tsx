import { memo } from 'react'
import {
    RedPacketIcon,
    FailedIcon,
    SendTransactionIcon,
    ReceiveTransactionIcon,
    SwapTransactionIcon,
} from '@dimensiondev/icons'
import { FilterTransactionType, isSameAddress, useRedPacketAddress } from '@dimensiondev/web3-shared'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
    icon: {
        fontSize: 36,
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
    if (isFailed) return <FailedIcon className={classes.icon} />
    if (isRedPacket) return <RedPacketIcon className={classes.icon} />

    switch (transactionType) {
        case FilterTransactionType.SENT:
            return <SendTransactionIcon className={classes.icon} />
        case FilterTransactionType.RECEIVE:
            return <ReceiveTransactionIcon className={classes.icon} />
        default:
            return <SwapTransactionIcon className={classes.icon} />
    }
})
