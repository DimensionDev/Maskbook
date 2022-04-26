import { useMemo } from 'react'
import { Avatar, Link, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import LinkIcon from '@mui/icons-material/Link'
import { FormattedBalance } from '@masknet/shared'
import { CurrencyType, NonFungibleTokenEvent } from '@masknet/web3-shared-base'
import {
    ChainId,
    explorerResolver,
    formatBalance,
    NonFungibleAssetProvider,
    SchemaType,
} from '@masknet/web3-shared-evm'
import { formatElapsed } from '../../../Wallet/formatter'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { resolveOpenSeaAssetEventType, resolveRaribleAssetEventType } from '../../pipes'
import { Account } from '../Account'
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

export interface RowProps {
    event: NonFungibleTokenEvent<ChainId, SchemaType>
    isDifferenceToken?: boolean
}

export function Row({ event, isDifferenceToken }: RowProps) {
    const { classes } = useStyles()
    const { provider } = CollectibleState.useContainer()

    const unitPrice = useMemo(() => {
        if (provider === NonFungibleAssetProvider.RARIBLE || !isDifferenceToken || !event.price) return
        return event.price[CurrencyType.USD]
    }, [event, isDifferenceToken, provider])

    return (
        <TableRow>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {provider === NonFungibleAssetProvider.OPENSEA
                        ? resolveOpenSeaAssetEventType(event.type as OpenSeaAssetEventType, event.from?.nickname)
                        : resolveRaribleAssetEventType(event.type as RaribleEventType)}
                </Typography>
            </TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Typography className={classes.content} variant="body2">
                            {event.paymentToken?.logoURL && (
                                <Link href={event.asset_permalink} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={event.paymentToken.logoURL}
                                        className={classes.token}
                                        alt={event.paymentToken?.symbol}
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
                        {event.price && provider === NonFungibleAssetProvider.OPENSEA
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
                {event.hash ? (
                    <Link
                        href={explorerResolver.transactionLink(event.chainId, event.hash)}
                        target="_blank"
                        rel="noopener noreferrer">
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
