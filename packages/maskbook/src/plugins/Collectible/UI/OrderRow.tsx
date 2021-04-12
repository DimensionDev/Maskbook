import type { Order } from 'opensea-js/lib/types'
import { Avatar, createStyles, Link, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core'
import type { OpenSeaCustomAccount } from './types'
import { formatDistanceToNow } from 'date-fns'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { resolveAddressOnEtherscan } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
    })
})

interface CustomOrder extends Order {
    unitPrice: number
}

interface IRowProps {
    order: CustomOrder
    isDifferenceToken?: boolean
}

export function OrderRow({ order, isDifferenceToken }: IRowProps) {
    const classes = useStyles()

    return (
        <TableRow>
            <TableCell>
                <Link
                    href={`https://opensea.io/accounts/${
                        order.makerAccount?.user?.username ?? order.makerAccount?.address ?? ''
                    }`}
                    title={order.makerAccount?.user?.username ?? order.makerAccount?.address ?? ''}
                    target="_blank"
                    className={classes.account}
                    rel="noopener noreferrer">
                    <Avatar
                        src={(order.makerAccount as OpenSeaCustomAccount)?.profile_img_url}
                        className={classes.avatar}
                    />
                    <Typography className={classes.accountName}>
                        {order.makerAccount?.user?.username ?? order.makerAccount?.address?.slice(2, 8) ?? ''}
                    </Typography>
                </Link>
            </TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Typography className={classes.content}>
                            <Link
                                href={resolveAddressOnEtherscan(ChainId.Mainnet, order.paymentToken)}
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
                            {order.unitPrice}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content}>
                            {formatBalance(
                                new BigNumber(order.quantity),
                                new BigNumber(order.quantity).toString() !== '1' ? 8 : 0,
                            )}
                        </Typography>
                    </TableCell>
                </>
            ) : (
                <>
                    <TableCell>
                        <Typography style={{ display: 'flex' }} className={classes.content}>
                            <Link
                                href={resolveAddressOnEtherscan(ChainId.Mainnet, order.paymentToken)}
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
                            {order.unitPrice}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content}>
                            {new BigNumber(order.expirationTime).isZero() &&
                                formatDistanceToNow(
                                    new Date(new BigNumber(order.expirationTime).multipliedBy(1000).toNumber()),
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
