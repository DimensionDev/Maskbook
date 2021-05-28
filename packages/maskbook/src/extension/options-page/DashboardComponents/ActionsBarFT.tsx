import { IconButton, makeStyles, MenuItem } from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import type { Wallet } from '@dimensiondev/web3-shared'
import { isNative } from '@dimensiondev/web3-shared'
import { useMenu, useI18N, useRemoteControlledDialog } from '../../../utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, DashboardWalletTransferDialogFT } from '../DashboardDialogs/Wallet'
import type { FungibleTokenDetailed } from '@dimensiondev/web3-shared'
import { PluginTransakMessages } from '../../../plugins/Transak/messages'
import { useAccount } from '@dimensiondev/web3-shared'
import { useChainIdValid } from '@dimensiondev/web3-shared'

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

    //#region remote controlled buy dialog
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    //#endregion

    const [transeferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogFT)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        [
            <MenuItem
                onClick={() => {
                    setBuyDialog({
                        open: true,
                        code: token.symbol ?? token.name,
                        address: account,
                    })
                }}>
                {t('buy')}
            </MenuItem>,
            <MenuItem disabled={!chainIdValid} onClick={() => openTransferDialogOpen({ wallet, token })}>
                {t('transfer')}
            </MenuItem>,
            <MenuItem
                style={{ display: isNative(token.address) ? 'none' : 'initial' }}
                onClick={() => openHideTokenConfirmDialog({ wallet, token })}>
                {t('hide')}
            </MenuItem>,
        ].slice(chain === 'eth' ? 0 : 1),
    )

    return (
        <>
            <IconButton className={classes.more} size="small" onClick={openMenu}>
                <MoreHorizIcon />
            </IconButton>
            {menu}
            {hideTokenConfirmDialog}
            {transeferDialog}
        </>
    )
}
