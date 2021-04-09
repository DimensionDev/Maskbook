import { Avatar, createStyles, Link, makeStyles, TableCell, TableRow, Typography, Box } from '@material-ui/core'
import LinkIcon from '@material-ui/icons/Link'
import type { OpenSeaAssetEvent } from '../../apis'
import { OpenSeaAssetEventType } from '../../apis'
import { formatBalance, formatElapsed } from '../../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { resolveAssetEventType } from '../../pipes'

const useStyles = makeStyles((theme) => {
    return createStyles({
        account: {
            display: 'flex',
        },
        avatar: {
            width: 22,
            height: 22,
        },
        accountName: {
            marginLeft: theme.spacing(0.5),
        },
        relativeTime: {
            whiteSpace: 'nowrap',
        },
        token: {
            objectFit: 'contain',
            width: 16,
            height: 16,
            marginRight: theme.spacing(0.5),
        },
    })
})

interface Props {
    order: OpenSeaAssetEvent
    isDifferenceToken?: boolean
}

export function Row({ order, isDifferenceToken }: Props) {
    const classes = useStyles()

    const accountPair = useMemo(() => {
        if (order.node.eventType === OpenSeaAssetEventType.SUCCESSFUL) {
            return {
                from: order.node.seller,
                to: order.node.winnerAccount,
            }
        }
        return {
            from: order.node.fromAccount,
            to: order.node.toAccount,
        }
    }, [order])

    const unitPrice = useMemo(() => {
        if (!isDifferenceToken || !order.node.price) return null
        const price = formatBalance(new BigNumber(order.node.price.quantity), order.node.price.asset.decimals)
        const quantity = formatBalance(
            new BigNumber(order.node.assetQuantity.quantity),
            order.node.assetQuantity.asset.decimals ?? 0,
        )

        return new BigNumber(price).dividedBy(quantity).toString()
    }, [order, isDifferenceToken])

    return (
        <TableRow>
            <TableCell>{resolveAssetEventType(order.node.eventType, accountPair.from)}</TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Box display="flex">
                            {order.node.price?.asset && (
                                <Link
                                    href={order.node.price.asset.assetContract.blockExplorerLink}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <img
                                        src={order.node.price.asset.imageUrl}
                                        className={classes.token}
                                        alt={order.node.price.asset.symbol}
                                    />
                                </Link>
                            )}
                            {unitPrice}
                        </Box>
                    </TableCell>
                    <TableCell>
                        {formatBalance(
                            new BigNumber(order.node.assetQuantity.quantity),
                            order.node.assetQuantity.asset.decimals ?? 0,
                        )}
                    </TableCell>
                </>
            ) : (
                <TableCell>
                    {order.node.price &&
                        formatBalance(new BigNumber(order.node.price.quantity), order.node.price?.asset.decimals)}
                </TableCell>
            )}
            <TableCell>
                {accountPair.from && (
                    <Link
                        href={`https://opensea.io/accounts/${
                            accountPair.from.user?.publicUsername ?? accountPair.from.address ?? ''
                        }`}
                        title={accountPair.from.user?.publicUsername ?? accountPair.from.address ?? ''}
                        target="_blank"
                        className={classes.account}
                        rel="noopener noreferrer">
                        <Avatar src={accountPair.from.imageUrl} className={classes.avatar} />
                        <Typography className={classes.accountName}>
                            {accountPair.from.user?.publicUsername ?? accountPair.from.address?.slice(2, 8)}
                        </Typography>
                    </Link>
                )}
            </TableCell>
            <TableCell>
                {accountPair.to && (
                    <Link
                        href={`https://opensea.io/accounts/${
                            accountPair.to.user?.publicUsername ?? accountPair.to.address ?? ''
                        }`}
                        title={accountPair.to.user?.publicUsername ?? accountPair.to.address ?? ''}
                        target="_blank"
                        className={classes.account}
                        rel="noopener noreferrer">
                        <Avatar src={accountPair.to.imageUrl} className={classes.avatar} />
                        <Typography className={classes.accountName}>
                            {accountPair.to.user?.publicUsername?.slice(0, 20) ?? accountPair.to.address?.slice(2, 8)}
                        </Typography>
                    </Link>
                )}
            </TableCell>
            <TableCell className={classes.relativeTime}>
                {order.node.transaction ? (
                    <Link href={order.node.transaction.blockExplorerLink} target="_blank" rel="noopener noreferrer">
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            {formatElapsed(new Date(`${order.node.eventTimestamp}Z`).getTime())}
                            <LinkIcon fontSize="inherit" />
                        </Typography>
                    </Link>
                ) : (
                    <Typography sx={{ color: 'rgb(29,161,242)' }}>
                        {formatElapsed(new Date(`${order.node.eventTimestamp}Z`).getTime())}
                    </Typography>
                )}
            </TableCell>
        </TableRow>
    )
}
