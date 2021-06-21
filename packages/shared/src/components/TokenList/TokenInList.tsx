import { makeStyles, Theme } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography, ListItemIcon } from '@material-ui/core'
import type { Asset } from '@dimensiondev/web3-shared'
import { TokenIcon } from './TokenIcon'
import type { MaskSearchableListItemProps } from '../SearchableList'
import { formatBalance } from '../../wallet'

const useStyles = makeStyles((theme: Theme) => ({
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
}))

export function TokenInList({ data, onSelect }: MaskSearchableListItemProps<Asset>) {
    const classes = useStyles()
    const token = data.token

    if (!token) return null
    const { address, name, symbol } = token

    return (
        <ListItem
            button
            // disabled={data.selected.some((x) => isSameAddress(x, address))}
            onClick={() => onSelect(data)}>
            <ListItemIcon>
                <TokenIcon address={address} name={name} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    <span className={classes.name}>{name}</span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" component="span">
                    <span>{formatBalance(data.balance, token.decimals)} </span>
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
