import {
    currySameAddress,
    formatEthereumAddress,
    FungibleTokenDetailed,
    resolveTokenLinkOnExplorer,
    useTokenConstants,
    useTokenDetailed,
    EthereumTokenType,
    isSameAddress,
} from '@masknet/web3-shared'
import { Link, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core'
import { makeStyles, Theme } from '@material-ui/core/styles'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { useCallback } from 'react'
import { TokenIcon } from '@masknet/shared'

const useStyles = makeStyles((theme: Theme) => ({
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
}))

export interface TokenInListProps {
    index: number
    style: any
    data: {
        tokens: FungibleTokenDetailed[]
        selected: string[]
        onSelect(token: FungibleTokenDetailed): void
    }
}

export function TokenInList({ data, index, style }: TokenInListProps) {
    const classes = useStyles()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const stop = useCallback((ev: React.MouseEvent<HTMLAnchorElement>) => ev.stopPropagation(), [])

    const _token = data.tokens[index]

    const { value: token } = useTokenDetailed(
        isSameAddress(NATIVE_TOKEN_ADDRESS, _token.address) ? EthereumTokenType.Native : EthereumTokenType.ERC20,
        _token.address,
    )

    if (!token) return null
    const { address, name, symbol, logoURI } = token
    return (
        <ListItem
            button
            style={style}
            disabled={data.selected.some(currySameAddress(address))}
            onClick={() => data.onSelect(token)}>
            <ListItemIcon>
                <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURI={logoURI} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.name}>{name}</span>
                    <span className={classes.address}>
                        {token.address !== NATIVE_TOKEN_ADDRESS ? formatEthereumAddress(token.address, 8) : null}
                    </span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    {token.address !== NATIVE_TOKEN_ADDRESS ? (
                        <Link
                            className={classes.link}
                            href={resolveTokenLinkOnExplorer(token)}
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
