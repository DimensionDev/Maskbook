import { Avatar, Link, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Account } from './Account'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import { resolveWebLinkOnCryptoartAI } from '../pipes'
import { truncate } from 'lodash-unified'

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
        ethPrice: {
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
        },
        usdcPrice: {
            display: 'flex',
            alignItems: 'center',
            color: 'grey',
        },
    }
})

interface IRowProps {
    event: any
    chainId: ChainId
    acceptable?: boolean
}

export function OrderRow({ event, chainId }: IRowProps) {
    const { t } = useI18N()
    const { classes } = useStyles()

    return (
        <TableRow>
            <TableCell>
                <Link
                    href={resolveWebLinkOnCryptoartAI(chainId) + '/' + event.operatorName}
                    target="_blank"
                    className={classes.account}
                    rel="noopener noreferrer">
                    <Avatar src={event.avatorPath} className={classes.avatar} />
                    <Typography className={classes.accountName} variant="body2">
                        <Account
                            username={truncate(event.operatorName, {
                                length: 13,
                            })}
                            address={event.operatorAddress}
                        />
                    </Typography>
                </Link>
            </TableCell>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {event.status}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {event.createTime.slice(0, Math.max(0, event.createTime.length - 3))}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography className={classes.ethPrice} variant="body2">
                    {event.priceInEth} &Xi;
                </Typography>
                <Typography className={classes.usdcPrice} variant="body2">
                    (${event.priceInUsd})
                </Typography>
            </TableCell>
            <TableCell>
                <Link href={event.transactionUrl} target="_blank" className={classes.account} rel="noopener noreferrer">
                    {t('plugin_cryptoartai_tx')}
                </Link>
            </TableCell>
        </TableRow>
    )
}
