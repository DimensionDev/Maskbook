import type { Order } from 'opensea-js/lib/types'
import { Avatar, createStyles, Link, makeStyles, TableCell, TableRow, Typography } from '@material-ui/core'
import type { OpenSeaCustomAccount } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { formatBalance } from '../../../Wallet/formatter'
import BigNumber from 'bignumber.js'

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

interface CustomOrder extends Order {
    unitPrice: number
}

interface IRowProps {
    order: CustomOrder
    isDifferenceToken?: boolean
}

export function Row({ order, isDifferenceToken }: IRowProps) {
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
                        <Typography>
                            <Link
                                href={`https://etherscan.io/address/${order.paymentToken}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                <img
                                    src={order.paymentTokenContract?.imageUrl}
                                    className={classes.token}
                                    alt={order.paymentTokenContract?.symbol}
                                />
                            </Link>
                            {order.unitPrice}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>
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
                        <Typography>
                            <Link
                                href={`https://etherscan.io/address/${order.paymentToken}`}
                                target="_blank"
                                rel="noopener noreferrer">
                                <img
                                    src={order.paymentTokenContract?.imageUrl}
                                    className={classes.token}
                                    alt={order.paymentTokenContract?.symbol}
                                />
                            </Link>
                            {order.unitPrice}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>
                            {formatDistanceToNow(
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
