import React, { useCallback } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography, ListItemIcon, Link } from '@material-ui/core'
import { TokenIcon } from './TokenIcon'
import type { Token } from '../../../web3/types'
import { Address } from './Address'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { resolveTokenLinkInEtherscan } from '../../../web3/helpers'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: {
            width: 28,
            height: 28,
            marginRight: theme.spacing(1),
        },
        text: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        primary: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            paddingRight: theme.spacing(1),
        },
        name: {
            display: 'block',
        },
        address: {
            color: theme.palette.text.disabled,
            fontSize: 12,
            display: 'block',
            marginTop: theme.spacing(0.25),
        },
    }),
)

export interface TokenInListProps {
    index: number
    // styles required by FixedSizeList
    style: any
    data: {
        tokens: Token[]
        excludeTokens: string[]
        selected: string
        onSelect: (address: string) => void
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
                    {token.address !== ETH_ADDRESS ? (
                        <Link
                            className={classes.address}
                            href={resolveTokenLinkInEtherscan(token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <Address address={address}></Address>
                        </Link>
                    ) : null}
                </Typography>
                <Typography color="textSecondary" component="span">
                    {symbol}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
