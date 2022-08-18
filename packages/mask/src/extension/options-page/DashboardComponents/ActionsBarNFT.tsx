import { useCallback } from 'react'
import { IconButton, MenuItem } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useI18N } from '../../../utils'
import { useMenu } from '@masknet/shared'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardWalletHideTokenConfirmDialog, DashboardWalletTransferDialogNFT } from '../DashboardDialogs/Wallet'
import { useChainIdValid, Web3Helper } from '@masknet/plugin-infra/web3'
import type { NonFungibleToken, Wallet } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    more: {
        color: theme.palette.text.primary,
    },
}))

export interface ActionsBarNFT_Props extends withClasses<'more'> {
    wallet: Wallet
    token: NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function ActionsBarNFT(props: ActionsBarNFT_Props) {
    const { wallet, token } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const chainIdValid = useChainIdValid()

    const [transferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialogNFT)
    const [hideTokenConfirmDialog, , openHideTokenConfirmDialog] = useModal(DashboardWalletHideTokenConfirmDialog)
    const [menu, openMenu] = useMenu(
        token.schema === SchemaType.ERC721 ? (
            <MenuItem
                key="transfer"
                disabled={!chainIdValid}
                onClick={() => openTransferDialogOpen({ token: token as NonFungibleToken<ChainId, SchemaType> })}>
                {t('transfer')}
            </MenuItem>
        ) : null,
        <MenuItem
            key="hide"
            onClick={() =>
                openHideTokenConfirmDialog({ wallet, token: token as NonFungibleToken<ChainId, SchemaType> })
            }>
            {t('hide')}
        </MenuItem>,
    )

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
