import { makeStyles, Theme } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography, ListItemIcon, Button } from '@material-ui/core'
import { Asset, formatBalance } from '@masknet/web3-shared'
import { TokenIcon } from '../TokenIcon'
import type { MaskSearchableListItemProps } from '@masknet/theme'

// todo: change Typography from global theme
const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    list: {
        paddingLeft: theme.spacing(1),
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
    symbol: {
        lineHeight: '20px',
        fontSize: 14,
    },
    importButton: {
        borderRadius: '30px',
    },
}))

export function TokenListItem({ data, onSelect }: MaskSearchableListItemProps<Asset & { isAddedToken: boolean }>) {
    const classes = useStyles()
    const token = data.token

    if (!token) return null
    const { address, name, symbol } = token

    const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()
        onSelect(data)
    }

    return (
        <ListItem button className={classes.list} onClick={handleTokenSelect}>
            <ListItemIcon>
                <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} />
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.text }}>
                <Typography className={classes.primary} color="textPrimary" component="span">
                    <span className={classes.symbol}>{symbol}</span>
                    <span className={classes.name}>{name}</span>
                </Typography>
                <Typography className={classes.secondary} color="textSecondary" component="span">
                    {data.isAddedToken ? (
                        <span>{formatBalance(data.balance, token.decimals)}</span>
                    ) : (
                        <Button
                            className={classes.importButton}
                            color="primary"
                            onClick={handleTokenSelect}
                            size="small">
                            Import
                        </Button>
                    )}
                </Typography>
            </ListItemText>
        </ListItem>
    )
}
