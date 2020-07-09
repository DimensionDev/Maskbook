import React, { useMemo } from 'react'
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    makeStyles,
    createStyles,
    IconButton,
    Typography,
    MenuItem,
} from '@material-ui/core'
import type BigNumber from 'bignumber.js'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import { TokenIcon } from './TokenIcon'
import type { WalletDetails, ERC20TokenDetails } from '../../background-script/PluginService'
import DashboardMenu from './DashboardMenu'
import { useModal } from '../Dialogs/Base'
import { DashboardWalletHideTokenConfirmDialog } from '../Dialogs/Wallet'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ETH_ADDRESS } from '../../../plugins/Wallet/token'

const useStyles = makeStyles((theme) =>
    createStyles({
        coin: {
            width: 24,
            height: 24,
        },
        name: {},
        symbol: {
            marginLeft: theme.spacing(1),
        },
        amount: {
            display: 'flex',
            alignItems: 'center',
        },
    }),
)

interface TokenListItemProps {
    wallet: WalletDetails
    token: ERC20TokenDetails
    balance: BigNumber
}

export function TokenListItem(props: TokenListItemProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { balance, wallet, token } = props

    const [hideToken, , openHideToken] = useModal(DashboardWalletHideTokenConfirmDialog)
    const menus = useMemo(
        () => [<MenuItem onClick={() => openHideToken({ wallet, token })}>{t('hide')}</MenuItem>].filter((x) => x),
        [openHideToken, wallet],
    )
    const [menu, , openMenu] = useModal(DashboardMenu, { menus })

    return (
        <ListItem divider disableGutters>
            <ListItemIcon>
                <TokenIcon
                    classes={{ coin: classes.coin }}
                    name={token.name?.substr(0, 1).toLocaleUpperCase()}
                    address={token.address}></TokenIcon>
            </ListItemIcon>
            <ListItemText
                primary={token.name}
                secondary={
                    <>
                        <Typography className={classes.name} color="textPrimary" component="span">
                            {formatBalance(balance, token.decimals)}
                        </Typography>
                        <Typography className={classes.symbol} color="textSecondary" component="span">
                            {token.symbol}
                        </Typography>
                    </>
                }
            />
            <ListItemSecondaryAction className={classes.amount}>
                {token.address !== ETH_ADDRESS ? (
                    <IconButton size="small" onClick={(e) => openMenu({ anchorEl: e.currentTarget })}>
                        <MoreHorizIcon />
                    </IconButton>
                ) : null}
                {menu}
                {hideToken}
            </ListItemSecondaryAction>
        </ListItem>
    )
}
