import { Avatar, Link, TableCell, TableRow, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { CollectibleProvider, NFTOrder } from '../types'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import BigNumber from 'bignumber.js'
import { ChainId, isZero, resolveAddressLinkOnExplorer } from '@masknet/web3-shared'
import { CollectibleState } from '../hooks/useCollectibleState'
import { Account } from './Account'
import { FormattedBalance } from '@masknet/shared'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => {
    return {
        account: {
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
        },
        avatar: {
            width: 18,
            height: 18,
        },
        accountName: {
            marginLeft: theme.spacing(0.5),
            fontSize: 14,
            lineHeight: 1,
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
        tokenLink: {
            display: 'flex',
            alignItems: 'center',
        },
        content: {
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
            lineHeight: 1,
        },
    }
})

interface IRowProps {
    order: NFTOrder
    isDifferenceToken?: boolean
    acceptable?: boolean
}

export function OrderRow({ order, isDifferenceToken }: IRowProps) {
    const { classes } = useStyles()
    const { provider } = CollectibleState.useContainer()
    const address = order.makerAccount?.user?.username ?? order.makerAccount?.address ?? ''
    return (
        <TableRow>
            <TableCell>
                <Link
                    href={urlcat('https://opensea.io/accounts/:address', { address })}
                    title={address}
                    target="_blank"
                    className={classes.account}
                    rel="noopener noreferrer">
                    <Avatar src={order.makerAccount?.profile_img_url} className={classes.avatar} />
                    <Typography className={classes.accountName}>
                        <Account address={order.makerAccount?.address} username={order.makerAccount?.user?.username} />
                    </Typography>
                </Link>
            </TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Typography className={classes.content}>
                            {provider === CollectibleProvider.OPENSEA ? (
                                <Link
                                    href={resolveAddressLinkOnExplorer(ChainId.Mainnet, order.paymentToken!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.tokenLink}>
                                    {order.paymentTokenContract?.imageUrl && (
                                        <img
                                            src={order.paymentTokenContract.imageUrl}
                                            className={classes.token}
                                            alt={order.paymentTokenContract?.symbol}
                                        />
                                    )}
                                </Link>
                            ) : null}
                            {`${order.unitPrice} ${order.paymentTokenContract?.symbol}`}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content}>
                            <FormattedBalance
                                value={order.quantity ?? 0}
                                decimals={new BigNumber(order.quantity ?? 0).toString() !== '1' ? 8 : 0}
                            />
                        </Typography>
                    </TableCell>
                </>
            ) : (
                <>
                    <TableCell>
                        <Typography style={{ display: 'flex' }} className={classes.content}>
                            {order.paymentTokenContract?.symbol !== 'ETH' &&
                            order.paymentTokenContract?.symbol !== 'WETH' &&
                            provider === CollectibleProvider.OPENSEA ? (
                                <Link
                                    href={resolveAddressLinkOnExplorer(ChainId.Mainnet, order.paymentToken!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.tokenLink}>
                                    {order.paymentTokenContract?.imageUrl && (
                                        <img
                                            src={order.paymentTokenContract.imageUrl}
                                            className={classes.token}
                                            alt={order.paymentTokenContract?.symbol}
                                        />
                                    )}
                                </Link>
                            ) : null}
                            {`${order.unitPrice} ${
                                provider === CollectibleProvider.OPENSEA
                                    ? order.paymentTokenContract?.symbol ?? ''
                                    : 'ETH'
                            }`}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content}>
                            {order.expirationTime &&
                                !isZero(order.expirationTime) &&
                                formatDistanceToNow(
                                    new Date(new BigNumber(order.expirationTime ?? 0).multipliedBy(1000).toNumber()),
                                    {
                                        addSuffix: true,
                                    },
                                )}
                        </Typography>
                    </TableCell>
                </>
            )}
        </TableRow>
    )
}
