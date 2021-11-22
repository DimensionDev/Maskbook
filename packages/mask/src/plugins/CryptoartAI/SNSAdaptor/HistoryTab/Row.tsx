import { Avatar, Link, TableCell, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Account } from '../Account'
import type { ChainId } from '@masknet/web3-shared-evm'
import { resolveWebLinkOnCryptoartAI } from '../../pipes'

import { subAddressStr } from '../../utils'

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
    event: any
    chainId: ChainId
}

export function Row({ event, chainId }: Props) {
    const { classes } = useStyles()

    return (
        <TableRow>
            <TableCell>
                <Link
                    href={resolveWebLinkOnCryptoartAI(chainId) + '/' + event.operatorName}
                    title={subAddressStr(event.operatorNikeName) ?? subAddressStr(event.operatorName) ?? ''}
                    target="_blank"
                    className={classes.account}
                    rel="noopener noreferrer">
                    <Avatar src={event.avatorPath} className={classes.avatar} />
                    <Typography className={classes.accountName} variant="body2">
                        <Account username={subAddressStr(event.operatorName) ?? ''} address={event.operatorAddress} />
                    </Typography>
                </Link>
            </TableCell>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {event.transactionTypeName}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {event.createTime.substr(0, event.createTime.length - 3)}
                </Typography>
            </TableCell>
            <TableCell>
                <Typography className={classes.content} variant="body2">
                    {event.priceInEth + ' Ξ'}
                    <br />
                    {'($' + event.priceInUsd + ')'}
                </Typography>
            </TableCell>
            <TableCell>
                <Link
                    href={event.transactionUrl}
                    title=""
                    target="_blank"
                    className={classes.account}
                    rel="noopener noreferrer">
                    <Avatar src="https://cdn.furucombo.app/assets/img/token/QUICK.png" className={classes.avatar} />
                </Link>
            </TableCell>
        </TableRow>
    )
}
