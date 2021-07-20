import { IconButton, makeStyles, MenuItem } from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import {
    Wallet,
    isNative,
    FungibleTokenDetailed,
    useAccount,
    useChainIdValid,
    useChainIdMatched,
    getChainIdFromName,
} from '@masknet/web3-shared'
import { useMenu, useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, DashboardWalletTransferDialogFT } from '../DashboardDialogs/Wallet'
import { PluginTransakMessages } from '../../../plugins/Transak/messages'

const useStyles = makeStyles((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ActionsBarFT_Props extends withClasses<'more'> {
    chain: 'eth' | string
    wallet: Wallet
    token: FungibleTokenDetailed
}

export function ActionsBarFT(props: ActionsBarFT_Props) {
    const { wallet, chain, token } = props

    const { t } = useI18N()
    const account = useAccount()
    const classes = useStylesExtends(useStyles(), props)

    const chainIdValid = useChainIdValid()
    const chainIdMatched = useChainIdMatched(getChainIdFromName(chain))

    //#region remote controlled buy dialog
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    //#endregion

    //#region items
    const items = [
        chain === 'eth' && chainIdMatched ? (
            <MenuItem
                onClick={() => {
                    setBuyDialog({
                        open: true,
                        code: token.symbol ?? token.name,
                        address: account,
                    })
                }}>
                {t('buy')}
            </MenuItem>
        ) : null,
        chainIdMatched ? (
            <MenuItem disabled={!chainIdValid} onClick={() => openTransferDialogOpen({ wallet, token })}>
                {t('transfer')}
            </MenuItem>
        ) : null,
        !isNative(token.address) ? (
            <MenuItem onClick={() => openHideTokenConfirmDialog({ wallet, token })}>{t('hide')}</MenuItem>
        ) : null,
    ].filter(Boolean)
    //#endregion

    const [transeferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogFT)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(items)

    return (
        <>
            <IconButton className={classes.more} size="small" disabled={!items.length} onClick={openMenu}>
                <MoreHorizIcon />
            </IconButton>
            {menu}
            {hideTokenConfirmDialog}
            {transeferDialog}
        </>
    )
}
