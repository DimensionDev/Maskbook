import { useCallback } from 'react'
import { IconButton, MenuItem } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Wallet, SchemaType, ChainId } from '@masknet/web3-shared-evm'
import { useMenu, useI18N } from '../../../utils'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, DashboardWalletTransferDialogNFT } from '../DashboardDialogs/Wallet'
import { useChainIdValid } from '@masknet/plugin-infra/web3'
import type { NonFungibleToken } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ActionsBarNFT_Props extends withClasses<'more'> {
    wallet: Wallet
    token: NonFungibleToken<ChainId, SchemaType>
}

export function ActionsBarNFT(props: ActionsBarNFT_Props) {
    const { wallet, token } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainIdValid = useChainIdValid()

    const [transferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogNFT)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu([
        token.schema === SchemaType.ERC721 ? (
            <MenuItem key="transfer" disabled={!chainIdValid} onClick={() => openTransferDialogOpen({ token })}>
                {t('transfer')}
            </MenuItem>
        ) : null,
        <MenuItem key="hide" onClick={() => openHideTokenConfirmDialog({ wallet, token })}>
            {t('hide')}
        </MenuItem>,
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
