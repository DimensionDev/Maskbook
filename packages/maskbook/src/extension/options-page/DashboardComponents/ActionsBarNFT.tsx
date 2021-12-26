import { useCallback } from 'react'
import { IconButton, MenuItem } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Wallet, ERC721TokenDetailed, EthereumTokenType, useChainIdValid } from '@masknet/web3-shared-evm'
import { useMenu, useI18N } from '../../../utils'
import { useStylesExtends } from '@masknet/shared'
// eslint-disable-next-line import/no-deprecated
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, DashboardWalletTransferDialogNFT } from '../DashboardDialogs/Wallet'

const useStyles = makeStyles()((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ActionsBarNFT_Props extends withClasses<'more'> {
    wallet: Wallet
    token: ERC721TokenDetailed
}

export function ActionsBarNFT(props: ActionsBarNFT_Props) {
    const { wallet, token } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainIdValid = useChainIdValid()

    // eslint-disable-next-line import/no-deprecated
    const [transferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogNFT)
    // eslint-disable-next-line import/no-deprecated
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu([
        token.contractDetailed.type === EthereumTokenType.ERC721 ? (
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
            {transferDialog}
        </>
    )
}
