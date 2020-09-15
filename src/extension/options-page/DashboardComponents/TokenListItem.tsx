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
import type { ERC20TokenDetails } from '../../background-script/PluginService'
import { useMenu } from '../../../utils/hooks/useMenu'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog } from '../DashboardDialogs/Wallet'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ETH_ADDRESS } from '../../../plugins/Wallet/token'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'

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
        more: {
            color: theme.palette.text.primary,
        },
    }),
)

interface TokenListItemProps {
    wallet: WalletRecord
    token: ERC20TokenDetails
    balance: BigNumber
}

export function TokenListItem(props: TokenListItemProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { balance, wallet, token } = props

    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => openHideTokenConfirmDialog({ wallet, token })}>{t('hide')}</MenuItem>,
    )

    return (
        <ListItem divider>
            <ListItemIcon>
                <TokenIcon classes={{ coin: classes.coin }} name={token.name} address={token.address} />
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
                primaryTypographyProps={{
                    color: 'textPrimary',
                }}
            />
            <ListItemSecondaryAction className={classes.amount}>
                {token.address !== ETH_ADDRESS ? (
                    <IconButton className={classes.more} size="small" onClick={openMenu}>
                        <MoreHorizIcon />
                    </IconButton>
                ) : null}
                {menu}
                {hideTokenConfirmDialog}
            </ListItemSecondaryAction>
        </ListItem>
    )
}
