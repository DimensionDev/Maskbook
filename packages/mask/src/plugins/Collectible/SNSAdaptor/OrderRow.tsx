import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { Avatar, Link, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { AssetOrder, CollectibleProvider } from '../types'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { ChainId, formatBalance, resolveAddressLinkOnExplorer } from '@masknet/web3-shared-evm'
import { isZero } from '@masknet/web3-shared-base'
import { CollectibleState } from '../hooks/useCollectibleState'
import { Account } from './Account'
import { FormattedBalance } from '@masknet/shared'
import { getOrderUnitPrice } from '../utils'

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
    order: AssetOrder
    isDifferenceToken?: boolean
    acceptable?: boolean
}

export function OrderRow({ order, isDifferenceToken }: IRowProps) {
    const { classes } = useStyles()
    const { provider } = CollectibleState.useContainer()
    const address = order.maker_account?.user?.username || order.maker_account?.address || ''

    const link = useMemo(() => {
        return provider === CollectibleProvider.OPENSEA
            ? `https://opensea.io/accounts/${address}`
            : order.maker_account?.address
    }, [order, provider])

    return (
        <TableRow>
            <TableCell>
                <Link href={link} title={address} target="_blank" className={classes.account} rel="noopener noreferrer">
                    <Avatar src={order.maker_account?.profile_img_url} className={classes.avatar} />
                    <Typography className={classes.accountName}>
                        <Account
                            address={order.maker_account?.address}
                            username={order.maker_account?.user?.username}
                        />
                    </Typography>
                </Link>
            </TableCell>
            {isDifferenceToken ? (
                <>
                    <TableCell>
                        <Typography className={classes.content}>
                            {provider === CollectibleProvider.OPENSEA ? (
                                <Link
                                    href={resolveAddressLinkOnExplorer(ChainId.Mainnet, order.payment_token!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.tokenLink}>
                                    {order.payment_token_contract?.image_url && (
                                        <img
                                            src={order.payment_token_contract.image_url}
                                            className={classes.token}
                                            alt={order.payment_token_contract?.symbol}
                                        />
                                    )}
                                </Link>
                            ) : null}
                            {`${getOrderUnitPrice(
                                order.current_price,
                                order.payment_token_contract?.decimals,
                                order.quantity,
                            )} ${order.payment_token_contract?.symbol}`}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography className={classes.content}>
                            <FormattedBalance
                                value={order.quantity ?? 0}
                                decimals={new BigNumber(order.quantity ?? 0).toFixed() !== '1' ? 8 : 0}
                                formatter={formatBalance}
                            />
                        </Typography>
                    </TableCell>
                </>
            ) : (
                <>
                    <TableCell>
                        <Typography style={{ display: 'flex' }} className={classes.content}>
                            {provider === CollectibleProvider.OPENSEA ? (
                                <Link
                                    href={resolveAddressLinkOnExplorer(ChainId.Mainnet, order.payment_token!)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.tokenLink}>
                                    {order.payment_token_contract?.image_url && (
                                        <img
                                            src={order.payment_token_contract?.image_url}
                                            className={classes.token}
                                            alt={order.payment_token_contract?.symbol}
                                        />
                                    )}
                                </Link>
                            ) : null}
                            {`${getOrderUnitPrice(
                                order.current_price,
                                order.payment_token_contract?.decimals,
                                order.quantity,
                            )} ${
                                provider === CollectibleProvider.OPENSEA
                                    ? order.payment_token_contract?.symbol ?? ''
                                    : 'ETH'
                            }`}
                        </Typography>
                    </TableCell>
                    {provider === CollectibleProvider.OPENSEA ? (
                        <TableCell>
                            <Typography className={classes.content}>
                                {order.expiration_time &&
                                    !isZero(order.expiration_time) &&
                                    formatDistanceToNow(new Date(order.expiration_time * 1000), {
                                        addSuffix: true,
                                    })}
                            </Typography>
                        </TableCell>
                    ) : null}
                </>
            )}
        </TableRow>
    )
}
