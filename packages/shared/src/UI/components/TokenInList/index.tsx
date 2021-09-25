import {
    Asset,
    currySameAddress,
    formatBalance,
    FungibleTokenDetailed,
    isSameAddress,
    resolveTokenLinkOnExplorer,
    useTokenConstants,
} from '@masknet/web3-shared'
import { Link, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import ListItemButton from '@material-ui/core/ListItemButton'
import { makeStyles } from '@masknet/theme'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { useCallback } from 'react'
import { TokenIcon } from '../TokenIcon'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
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
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 'auto',
        margin: 'auto',
    },
    openIcon: {
        fontSize: 16,
        width: 16,
        height: 16,
        marginLeft: theme.spacing(0.5),
    },
    symbol: {},
}))

export interface TokenInListProps {
    index: number
    style: any
    data: {
        assets: Asset[]
        selected: string[]
        onSelect(token: FungibleTokenDetailed): void
    }
}

export function TokenInList({ data, index, style }: TokenInListProps) {
    const { classes } = useStyles()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])

    const currentAsset = data.assets[index]
    const { token, balance } = currentAsset

    if (!token) return null
    const { address, name, symbol, logoURI } = token

    return (
        <ListItemButton
            // force react not to reuse dom node
            key={token.address}
            style={style}
            disabled={data.selected.some(currySameAddress(address))}
            onClick={() => data.onSelect(token)}>
            <ListItemIcon>
                <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURI={logoURI} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    {!isSameAddress(token.address, NATIVE_TOKEN_ADDRESS) ? (
                        <Link
                            className={classes.link}
                            href={resolveTokenLinkOnExplorer(token)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}>
                            <OpenInNewIcon className={classes.openIcon} />
                        </Link>
                    ) : null}
                    <Typography className={classes.name} color="textSecondary">
                        {name}
                    </Typography>
                </Typography>
                <Typography className={classes.secondary} color="textPrimary" component="span">
                    {balance !== null && formatBalance(balance, token.decimals, 4)}
                </Typography>
            </ListItemText>
        </ListItemButton>
    )
}
