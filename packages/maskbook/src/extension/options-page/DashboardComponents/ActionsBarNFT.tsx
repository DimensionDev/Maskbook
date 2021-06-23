import { useCallback } from 'react'
import { IconButton, makeStyles, MenuItem } from '@material-ui/core'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { Wallet, NonFungibleTokenDetailed, EthereumTokenType, useChainIdValid } from '@masknet/web3-shared'
import { useMenu, useI18N } from '../../../utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, DashboardWalletTransferDialogNFT } from '../DashboardDialogs/Wallet'

const useStyles = makeStyles((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ActionsBarNFT_Props extends withClasses<'more'> {
    wallet: Wallet
    token: NonFungibleTokenDetailed
}

export function ActionsBarNFT(props: ActionsBarNFT_Props) {
    const { wallet, token } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainIdValid = useChainIdValid()

    const [transeferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogNFT)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu([
        token.type === EthereumTokenType.ERC721 ? (
            <MenuItem disabled={!chainIdValid} onClick={() => openTransferDialogOpen({ token })}>
                {t('transfer')}
            </MenuItem>
        ) : null,
        <MenuItem onClick={() => openHideTokenConfirmDialog({ wallet, token })}>{t('hide')}</MenuItem>,
    ])

    const onClickButton = useCallback(
        (ev: React.MouseEvent<HTMLButtonElement>) => {
            ev.preventDefault()
            openMenu(ev)
        },
        [openMenu],
    )

    return (
        <>
            <IconButton className={classes.more} size="small" onClick={onClickButton}>
                <MoreHorizIcon />
            </IconButton>
            {menu}
            {hideTokenConfirmDialog}
            {transeferDialog}
        </>
    )
}
