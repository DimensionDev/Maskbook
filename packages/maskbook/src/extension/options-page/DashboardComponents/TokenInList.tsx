import { useCallback } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography, ListItemIcon, Link } from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { TokenIcon } from './TokenIcon'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import { resolveTokenLinkOnEtherscan } from '../../../web3/pipes'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            width: 28,
            height: 28,
        },
        text: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        primary: {
            flex: 1,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            paddingRight: theme.spacing(1),
        },
        name: {
            display: 'block',
        },
        secondary: {
            lineHeight: 1,
            paddingRight: theme.spacing(3),
            position: 'relative',
        },
        link: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 'auto',
            margin: 'auto',
            position: 'absolute',
        },
        openIcon: {
            fontSize: 16,
            width: 16,
            height: 16,
            marginLeft: theme.spacing(0.5),
        },
        address: {
            color: theme.palette.text.disabled,
            fontSize: 12,
            display: 'block',
            marginTop: theme.spacing(0.25),
        },
        symbol: {},
    }),
)

export interface TokenInListProps {
    index: number
    style: any
    data: {
        tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
        excludeTokens: string[]
        selected: string
        onSelect(address: string): void
    }
}

export function TokenInList({ data, index, style }: TokenInListProps) {
    const token = data.tokens[index]
    const classes = useStyles()
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])
    if (!token) return null
    const { address, name, symbol } = token
    return (
        <ListItem
            button
            style={style}
            disabled={data.excludeTokens.includes(address)}
            selected={data.selected === address}
            onClick={() => data.onSelect(address)}>
            <ListItemIcon>
                <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.name}>{name}</span>
                    <span className={classes.address}>
                        {token.address !== ETH_ADDRESS ? formatEthereumAddress(token.address, 8) : null}
                    </span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    {token.address !== ETH_ADDRESS ? (
                        <Link
                            className={classes.link}
                            href={resolveTokenLinkOnEtherscan(token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <OpenInNewIcon className={classes.openIcon} />
                        </Link>
                    ) : null}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
