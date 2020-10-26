import React from 'react'
import { IconButton, makeStyles, MenuItem } from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { CONSTANTS } from '../../../web3/constants'
import { isSameAddress } from '../../../web3/helpers'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog } from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'
import type { ERC20TokenRecord, WalletRecord } from '../../../plugins/Wallet/database/types'
import { useI18N } from '../../../utils/i18n-next-ui'

const useStyles = makeStyles((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface TokenActionsBarProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallet: WalletRecord
    token: ERC20TokenRecord
}

export function TokenActionsBar(props: TokenActionsBarProps) {
    const { wallet, token } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')

    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => openHideTokenConfirmDialog({ wallet, token })}>{t('hide')}</MenuItem>,
    )

    if (isSameAddress(token.address, ETH_ADDRESS)) return null
    return (
        <>
            <IconButton className={classes.more} size="small" onClick={openMenu}>
                <MoreHorizIcon />
            </IconButton>
            {menu}
            {hideTokenConfirmDialog}
        </>
    )
}
