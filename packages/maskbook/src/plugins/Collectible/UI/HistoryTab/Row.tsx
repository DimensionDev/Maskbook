import { Avatar, createStyles, Link, makeStyles, TableCell, TableRow, Typography, Box } from '@material-ui/core'
import LinkIcon from '@material-ui/icons/Link'
import { formatBalance, formatElapsed } from '../../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { resolveAssetEventType } from '../../pipes'
import { OpenSeaAssetEvent, OpenSeaAssetEventType } from '../types'

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
    event: OpenSeaAssetEvent
    isDifferenceToken?: boolean
}

export function Row({ event, isDifferenceToken }: Props) {
    const classes = useStyles()

    const accountPair = useMemo(() => {
        if (event.node.eventType === OpenSeaAssetEventType.SUCCESSFUL) {
            return {
                from: event.node.seller,
                to: event.node.winnerAccount,
            }
        }
        return {
            from: event.node.fromAccount,
            to: event.node.toAccount,
        }
    }, [event])

    const unitPrice = useMemo(() => {
        if (!isDifferenceToken || !event.node.price) return null
        const price = formatBalance(new BigNumber(event.node.price.quantity), event.node.price.asset.decimals)
        const quantity = formatBalance(
            new BigNumber(event.node.assetQuantity.quantity),
            event.node.assetQuantity.asset.decimals ?? 0,
        )

        return new BigNumber(price).dividedBy(quantity).toFixed(3, 1).toString()
    }, [event, isDifferenceToken])

    return (
        <TableRow>
            <TableCell>{resolveAssetEventType(event.node.eventType, accountPair.from)}</TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Box display="flex">
                            {event.node.price?.asset && (
                                <Link
                                    href={event.node.price.asset.assetContract.blockExplorerLink}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <img
                                        src={event.node.price.asset.imageUrl}
                                        className={classes.token}
                                        alt={event.node.price.asset.symbol}
                                    />
                                </Link>
                            )}
                            <Typography>{unitPrice}</Typography>
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Typography>
                            {formatBalance(
                                new BigNumber(event.node.assetQuantity.quantity),
                                event.node.assetQuantity.asset.decimals ?? 0,
                            )}
                        </Typography>
                    </TableCell>
                </>
            ) : (
                <TableCell>
                    <Typography>
                        {event.node.price &&
                            formatBalance(new BigNumber(event.node.price.quantity), event.node.price?.asset.decimals)}
                    </Typography>
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
                {event.node.transaction ? (
                    <Link href={event.node.transaction.blockExplorerLink} target="_blank" rel="noopener noreferrer">
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            {formatElapsed(new Date(`${event.node.eventTimestamp}Z`).getTime())}
                            <LinkIcon fontSize="inherit" />
                        </Typography>
                    </Link>
                ) : (
                    <Typography sx={{ color: 'rgb(29,161,242)' }}>
                        {formatElapsed(new Date(`${event.node.eventTimestamp}Z`).getTime())}
                    </Typography>
                )}
            </TableCell>
        </TableRow>
    )
}
