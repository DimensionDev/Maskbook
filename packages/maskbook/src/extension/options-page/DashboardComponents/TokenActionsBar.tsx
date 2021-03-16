import { IconButton, makeStyles, MenuItem } from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { isETH } from '../../../web3/helpers'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, WalletProps } from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../../plugins/Transak/messages'
import { useAccount } from '../../../web3/hooks/useAccount'
import { DashboardWalletTransferDialog } from './TransferDialog'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { forwardRef } from 'react'

//#region token actions menu
export interface TokenActionsMenuProps extends withClasses<never> {
    wallet: WalletRecord
    chain: 'eth' | string
    token: ERC20TokenDetailed | EtherTokenDetailed
    onTransferDialogOpen: (
        props: Partial<
            WalletProps & {
                token: ERC20TokenDetailed | EtherTokenDetailed
            }
        >,
    ) => void
    onHideTokenConfirmDialogOpen: (
        props: Partial<
            WalletProps & {
                token: ERC20TokenDetailed | EtherTokenDetailed
            }
        >,
    ) => void
}

export const TokenActionsMenu = forwardRef((props: TokenActionsMenuProps) => {
    const { chain, wallet, token, onTransferDialogOpen, onHideTokenConfirmDialogOpen } = props
    const account = useAccount()
    const { t } = useI18N()
    const chainIdValid = useChainIdValid()

    //#region remote controlled buy dialog
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    //#endregion
    return (
        <div>
            {chain === 'eth' ? (
                <>
                    <MenuItem
                        onClick={() => {
                            setBuyDialogOpen({
                                open: true,
                                code: token.symbol ?? token.name,
                                address: account,
                            })
                        }}>
                        {t('buy')}
                    </MenuItem>
                    <MenuItem disabled={!chainIdValid} onClick={() => onTransferDialogOpen({ wallet, token })}>
                        {t('transfer')}
                    </MenuItem>
                </>
            ) : null}
            <MenuItem
                style={isETH(token.address) ? { display: 'none' } : {}}
                onClick={() => onHideTokenConfirmDialogOpen({ wallet, token })}>
                {t('hide')}
            </MenuItem>
        </div>
    )
})
//#endregion

//#region ERC20 token actions bar
const useStyles = makeStyles((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ERC20TokenActionsBarProps
    extends Omit<TokenActionsMenuProps, 'onTransferDialogOpen' | 'onHideTokenConfirmDialogOpen'> {}

export function ERC20TokenActionsBar(props: ERC20TokenActionsBarProps) {
    const { wallet, chain, token } = props
    const classes = useStylesExtends(useStyles(), props)

    const [transeferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialog)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        <>
            <TokenActionsMenu
                chain={chain}
                wallet={wallet}
                token={token}
                onTransferDialogOpen={openTransferDialogOpen}
                onHideTokenConfirmDialogOpen={openHideTokenConfirmDialog}
            />
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
//#endregion
