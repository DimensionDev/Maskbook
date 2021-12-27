import { Avatar, Link, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import LinkIcon from '@mui/icons-material/Link'
import { FormattedBalance } from '@masknet/shared'
import { formatBalance, NonFungibleAssetProvider } from '@masknet/web3-shared-evm'
import { formatElapsed } from '../../../Wallet/formatter'
import { useMemo } from 'react'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { resolveOpenSeaAssetEventType, resolveRaribleAssetEventType } from '../../pipes'
import { Account } from '../Account'
import { getOrderUnitPrice, NonFungibleTokenAPI } from '@masknet/web3-providers'
import type { OpenSeaAssetEventType } from '../../types/opensea'
import type { RaribleEventType } from '../../types'

const useStyles = makeStyles()((theme) => {
    return {
        account: {
            display: 'flex',
            alignItems: 'center',
        },
        avatar: {
            width: 18,
            height: 18,
        },
        accountName: {
            marginLeft: theme.spacing(0.5),
        },
        relativeTime: {
            whiteSpace: 'nowrap',
        },
        token: {
            objectFit: 'contain',
            width: 18,
            height: 18,
            marginRight: theme.spacing(0.5),
        },
        content: {
            display: 'flex',
            alignItems: 'center',
        },
    }
})

interface Props {
    event: NonFungibleTokenAPI.History
    isDifferenceToken?: boolean
}

export function Row({ event, isDifferenceToken }: Props) {
    const { classes } = useStyles()
    const { provider } = CollectibleState.useContainer()

    const unitPrice = useMemo(() => {
        if (provider === NonFungibleAssetProvider.RARIBLE || !isDifferenceToken || !event.price) return null

        return getOrderUnitPrice(
            event.price.price ?? 0,
            event.price.paymentToken?.decimals,
            event.price.quantity,
        )?.toString()
    }, [event, isDifferenceToken, provider])

    return (
        <TableRow>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {provider === NonFungibleAssetProvider.OPENSEA
                        ? resolveOpenSeaAssetEventType(
                              event.eventType as OpenSeaAssetEventType,
                              event.accountPair.from?.username,
                          )
                        : resolveRaribleAssetEventType(event.eventType as RaribleEventType)}
                </Typography>
            </TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Typography className={classes.content} variant="body2">
                            {event.price?.asset?.image_url && (
                                <Link href={event.price.asset.permalink} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={event.price.asset?.image_original_url ?? event.price.asset.image_url}
                                        className={classes.token}
                                        alt={event.price.asset?.asset_contract.symbol}
                                    />
                                </Link>
                            )}
                            {unitPrice}
                            {event.price?.paymentToken?.symbol}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content} variant="body2">
                            <FormattedBalance
                                value={event.price?.quantity ?? 0}
                                decimals={event.price?.asset?.decimals ?? 0}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </TableCell>
                </>
            ) : (
                <TableCell>
                    <Typography className={classes.content} variant="body2">
                        {event.price && provider === NonFungibleAssetProvider.OPENSEA
                            ? formatBalance(event.price.quantity, event.price?.asset?.decimals ?? 0)
                            : event.price?.quantity ?? ''}
                    </Typography>
                </TableCell>
            )}
            <TableCell>
                {event.accountPair.from && (
                    <Link
                        href={event.accountPair.from.link}
                        title={event.accountPair.from.username ?? event.accountPair.from.address ?? ''}
                        target="_blank"
                        className={classes.account}
                        rel="noopener noreferrer">
                        <Avatar src={event.accountPair.from.imageUrl} className={classes.avatar} />
                        <Typography className={classes.accountName} variant="body2">
                            <Account
                                username={event.accountPair.from.username}
                                address={event.accountPair.from.address?.slice(2, 8)}
                            />
                        </Typography>
                    </Link>
                )}
            </TableCell>
            <TableCell>
                {event.accountPair.to && (
                    <Link
                        href={event.accountPair.to.link}
                        title={event.accountPair.to.username ?? event.accountPair.to.address ?? ''}
                        target="_blank"
                        className={classes.account}
                        rel="noopener noreferrer">
                        <Avatar src={event.accountPair.to.imageUrl} className={classes.avatar} />
                        <Typography className={classes.accountName} variant="body2">
                            <Account username={event.accountPair.to.username} address={event.accountPair.to.address} />
                        </Typography>
                    </Link>
                )}
            </TableCell>
            <TableCell className={classes.relativeTime}>
                {event.transactionBlockExplorerLink ? (
                    <Link href={event.transactionBlockExplorerLink} target="_blank" rel="noopener noreferrer">
                        <Typography className={classes.content} variant="body2">
                            {formatElapsed(event.timestamp)}
                            <LinkIcon fontSize="inherit" />
                        </Typography>
                    </Link>
                ) : (
                    <Typography className={classes.content} color="primary" variant="body2">
                        {formatElapsed(event.timestamp)}
                    </Typography>
                )}
            </TableCell>
        </TableRow>
    )
}
