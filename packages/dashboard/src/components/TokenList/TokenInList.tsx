import { makeStyles, Theme } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography, ListItemIcon, Button } from '@material-ui/core'
import type { Asset } from '@dimensiondev/web3-shared'
import { TokenIcon } from './TokenIcon'
import type { MaskSearchableListItemProps } from '@dimensiondev/maskbook-theme'
import { formatBalance } from '@dimensiondev/maskbook-shared'

// todo: remove unused style
const useStyles = makeStyles((theme: Theme) => ({
    list: {
        paddingLeft: 4,
    },
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
        lineHeight: '20px',
        fontSize: 14,
    },
    secondary: {
        fontSize: 14,
        textAlign: 'right',
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
    symbol: {
        lineHeight: '20px',
        fontSize: 14,
    },
    import: {
        borderRadius: '30px',
    },
}))

export function TokenInList({ data, onSelect }: MaskSearchableListItemProps<Asset & { isImported: boolean }>) {
    const classes = useStyles()
    const token = data.token

    if (!token) return null
    const { address, name, symbol } = token

    const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        onSelect(data)
    }

    return (
        <ListItem
            button
            className={classes.list}
            // disabled={data.selected.some((x) => isSameAddress(x, address))}
            onClick={handleTokenSelect}>
            <ListItemIcon>
                <TokenIcon address={address} name={name} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    <span className={classes.name}>{name}</span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" component="span">
                    {data.isImported ? (
                        <span>{formatBalance(data.balance, token.decimals)} </span>
                    ) : (
                        <Button className={classes.import} color={'primary'} onClick={handleTokenSelect} size={'small'}>
                            Import
                        </Button>
                    )}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
