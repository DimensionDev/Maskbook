import { IconButton, makeStyles, MenuItem } from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { CONSTANTS } from '../../../web3/constants'
import { isETH } from '../../../web3/helpers'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog } from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../../plugins/Transak/messages'
import { useAccount } from '../../../web3/hooks/useAccount'
import { DashboardWalletTransferDialog } from './TransferDialog'

const useStyles = makeStyles((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ERC20TokenActionsBarProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallet: WalletRecord
    token: ERC20TokenDetailed | EtherTokenDetailed
}

export function ERC20TokenActionsBar(props: ERC20TokenActionsBarProps) {
    const { wallet, token } = props

    const { t } = useI18N()
    const account = useAccount()
    const classes = useStylesExtends(useStyles(), props)
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    //#region remote controlled buy dialog
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    //#endregion

    const [transeferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialog)

    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        <MenuItem
            onClick={() => {
                setBuyDialogOpen({
                    open: true,
                    code: token.symbol ?? token.name,
                    address: account,
                })
            }}>
            {t('buy')}
        </MenuItem>,
        <MenuItem onClick={() => openTransferDialogOpen({ wallet, token })}>{t('wallet_transfer_menu')}</MenuItem>,
        <>
            {isETH(token.address) ? null : (
                <MenuItem onClick={() => openHideTokenConfirmDialog({ wallet, token })}>{t('hide')}</MenuItem>
            )}
        </>,
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
