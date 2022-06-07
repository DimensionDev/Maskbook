import { useMemo } from 'react'
import { Avatar, Link, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FormattedBalance } from '@masknet/shared'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { getOrderUnitPrice } from '@masknet/web3-providers'
import { CurrencyType, formatBalance, NonFungibleTokenEvent, SourceType } from '@masknet/web3-shared-base'
import { formatElapsed } from '../../../Wallet/formatter'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { Account } from '../Account'

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
    event: NonFungibleTokenEvent<ChainId, SchemaType>
    isDifferenceToken?: boolean
}

export function Row({ event, isDifferenceToken }: Props) {
    const { classes } = useStyles()
    const { provider } = CollectibleState.useContainer()

    const unitPrice = useMemo(() => {
        if (provider === SourceType.Rarible || !isDifferenceToken || !event.price) return null

        return getOrderUnitPrice(
            event.price?.[CurrencyType.USD] ?? '0',
            event.paymentToken?.decimals,
            event.quantity,
        )?.toString()
    }, [event, isDifferenceToken, provider])

    return (
        <TableRow>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {event.type}
                </Typography>
            </TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Typography className={classes.content} variant="body2">
                            {event.paymentToken?.logoURL && (
                                <Link href={event.assetPermalink} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={event.paymentToken.logoURL}
                                        className={classes.token}
                                        alt={event.assetPermalink}
                                    />
                                </Link>
                            )}
                            {unitPrice}
                            {event.paymentToken?.symbol}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content} variant="body2">
                            <FormattedBalance
                                value={event.quantity ?? 0}
                                decimals={event.paymentToken?.decimals ?? 0}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </TableCell>
                </>
            ) : (
                <TableCell>
                    <Typography className={classes.content} variant="body2">
                        {event.price && provider === SourceType.OpenSea
                            ? formatBalance(event.quantity, event.paymentToken?.decimals ?? 0)
                            : event.quantity ?? ''}
                    </Typography>
                </TableCell>
            )}
            <TableCell>
                {event.from && (
                    <Link
                        href={event.from.link}
                        title={event.from.nickname ?? event.from.address ?? ''}
                        target="_blank"
                        className={classes.account}
                        rel="noopener noreferrer">
                        <Avatar src={event.from.avatarURL} className={classes.avatar} />
                        <Typography className={classes.accountName} variant="body2">
                            <Account username={event.from.nickname} address={event.from.address?.slice(2, 8)} />
                        </Typography>
                    </Link>
                )}
            </TableCell>
            <TableCell>
                {event.to && (
                    <Link
                        href={event.to.link}
                        title={event.to.nickname ?? event.to.address ?? ''}
                        target="_blank"
                        className={classes.account}
                        rel="noopener noreferrer">
                        <Avatar src={event.to.avatarURL} className={classes.avatar} />
                        <Typography className={classes.accountName} variant="body2">
                            <Account username={event.to.nickname} address={event.to.address} />
                        </Typography>
                    </Link>
                )}
            </TableCell>
            <TableCell className={classes.relativeTime}>
                <Typography className={classes.content} color="primary" variant="body2">
                    {formatElapsed(event.timestamp)}
                </Typography>
            </TableCell>
        </TableRow>
    )
}
