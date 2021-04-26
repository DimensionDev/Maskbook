import { CircularProgress, Link, ListItem, ListItemText, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { useCallback } from 'react'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { formatBalance, formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { CONSTANTS } from '../../../web3/constants'
import { isSameAddress } from '../../../web3/helpers'
import { useConstant } from '../../../web3/hooks/useConstant'
import { resolveTokenLinkOnEtherscan } from '../../../web3/pipes'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { TokenIcon } from './TokenIcon'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
        },
        icon: {
            width: 28,
            height: 28,
        },
        info: {
            flex: '2 1 240px',
            marginLeft: theme.spacing(2),
        },
        primary: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        secondary: {
            display: 'flex',
            alignItems: 'center',
        },
        openIcon: {
            fontSize: 12,
            width: 12,
            height: 12,
            marginLeft: theme.spacing(0.5),
        },
        address: {
            color: theme.palette.text.disabled,
            fontSize: 12,
        },
        link: {
            lineHeight: 0,
            display: 'block',
        },
        balance: {
            flex: '0 0 auto',
        },
    }),
)

export interface TokenInListProps {
    index: number
    style: any
    data: {
        tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
        selected: string[]
        onSelect(address: string): void
        balance?: AsyncStateRetry<Map<string, string>>
    }
}

export function TokenInList({ data, index, style }: TokenInListProps) {
    const classes = useStyles()
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])

    const token = data.tokens[index]
    if (!token) return null
    const { address, name, symbol } = token

    return (
        <ListItem
            button
            className={classes.root}
            style={style}
            disabled={data.selected.some((x) => isSameAddress(x, address))}
            onClick={() => data.onSelect(address)}>
            <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} />
            <ListItemText
                classes={{ root: classes.info, primary: classes.primary, secondary: classes.secondary }}
                primary={`${name}(${symbol})`}
                secondary={
                    <>
                        <span className={classes.address}>
                            {token.address !== ETH_ADDRESS ? formatEthereumAddress(token.address, 8) : null}
                        </span>
                        {token.address !== ETH_ADDRESS ? (
                            <Link
                                href={resolveTokenLinkOnEtherscan(token)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={classes.link}
                                onClick={stop}>
                                <OpenInNewIcon className={classes.openIcon} color="action" />
                            </Link>
                        ) : null}
                    </>
                }
            />
            <BalanceValue className={classes.balance} balance={data.balance} address={address} />
        </ListItem>
    )
}

interface BalanceValueProps extends React.HTMLAttributes<HTMLDivElement> {
    balance?: AsyncStateRetry<Map<string, string>>
    address: string
}

function BalanceValue({ balance, address, ...props }: BalanceValueProps) {
    if (!balance) return null
    if (balance.loading) return <CircularProgress style={{ width: 20, height: 20 }} />
    if (balance.error || !balance.value) return null
    return (
        <ListItemText {...props}>
            <Typography>{formatBalance(balance.value.get(address))}</Typography>
        </ListItemText>
    )
}
