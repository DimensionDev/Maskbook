import React from 'react'
import { Button, Typography, Box, IconButton, MenuItem } from '@material-ui/core'
import { makeStyles, createStyles, Theme, ThemeProvider } from '@material-ui/core/styles'
import { merge, cloneDeep, truncate } from 'lodash-es'
import AddIcon from '@material-ui/icons/Add'
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import HistoryIcon from '@material-ui/icons/History'
import { useModal } from '../DashboardDialogs/Base'
import { WALLET_OR_PERSONA_NAME_MAX_LEN } from '../../../utils/constants'
import {
    DashboardWalletAddTokenDialog,
    DashboardWalletHistoryDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
    DashboardWalletRenameDialog,
    DashboardWalletRedPacketDetailDialog,
    DashboardWalletShareDialog,
} from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorStyles } from '../../../utils/theme'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { ProviderType, TokenDetailed } from '../../../web3/types'
import { WalletAssetsTable } from './WalletAssetsTable'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransakMessageCenter } from '../../../plugins/Transak/messages'

const walletContentTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {
            MuiIconButton: {
                root: {
                    color: theme.palette.text,
                },
            },
            MuiListItemIcon: {
                root: {
                    justifyContent: 'center',
                    minWidth: 'unset',
                    marginRight: theme.spacing(2),
                },
            },
            MuiListItemSecondaryAction: {
                root: {
                    ...theme.typography.body1,
                },
            },
        },
    })

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            color: theme.palette.text.primary,
            flex: 1,
        },
        box: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        addButton: {
            color: theme.palette.primary.main,
        },
        moreButton: {
            color: theme.palette.text.primary,
        },
        assetsTable: {
            flex: 1,
        },
        footer: {
            flex: 0,
            margin: theme.spacing(1),
        },
    }),
)

interface WalletContentProps {
    wallet: WalletRecord
    detailedTokens: TokenDetailed[]
}

export const WalletContent = React.forwardRef<HTMLDivElement, WalletContentProps>(function WalletContent(
    { wallet, detailedTokens }: WalletContentProps,
    ref,
) {
    const classes = useStyles()
    const { t } = useI18N()
    const color = useColorStyles()
    const xsMatched = useMatchXS()
    const [addToken, , openAddToken] = useModal(DashboardWalletAddTokenDialog)
    const [walletShare, , openWalletShare] = useModal(DashboardWalletShareDialog)
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletBackup, , openWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , openWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [walletRename, , openWalletRename] = useModal(DashboardWalletRenameDialog)
    const [walletRedPacket, , openWalletRedPacket] = useModal(DashboardWalletRedPacketDetailDialog)

    const [menu, openMenu] = useMenu(
        <MenuItem onClick={() => openWalletShare({ wallet })}>{t('share')}</MenuItem>,
        <MenuItem onClick={() => openWalletRename({ wallet })}>{t('rename')}</MenuItem>,
        wallet.provider === ProviderType.Maskbook ? (
            <MenuItem onClick={() => openWalletBackup({ wallet })}>{t('backup')}</MenuItem>
        ) : undefined,
        <MenuItem onClick={() => openWalletDelete({ wallet })} className={color.error} data-testid="delete_button">
            {t('delete')}
        </MenuItem>,
    )

    //#region remote controlled buy dialog
    const [, setBuyDialogOpen] = useRemoteControlledDialog(TransakMessageCenter, 'buyTokenDialogUpdated')
    //#endregion

    return (
        <div className={classes.root} ref={ref}>
            <ThemeProvider theme={walletContentTheme}>
                <Box
                    pt={xsMatched ? 2 : 3}
                    pb={2}
                    pl={3}
                    pr={2}
                    display="flex"
                    alignItems="center"
                    className={xsMatched ? classes.box : ''}>
                    <Typography className={classes.title} variant="h5">
                        {wallet.name
                            ? truncate(wallet.name, { length: WALLET_OR_PERSONA_NAME_MAX_LEN })
                            : wallet.address}
                    </Typography>
                    {!xsMatched ? (
                        <Box className={classes.footer} display="flex" alignItems="center" justifyContent="flex-end">
                            <Button
                                className={classes.addButton}
                                variant="text"
                                onClick={() => openAddToken({ wallet })}
                                startIcon={<AddIcon />}>
                                {t('add_token')}
                            </Button>
                            <Button
                                onClick={() => {
                                    setBuyDialogOpen({
                                        open: true,
                                        address: wallet.address,
                                    })
                                }}
                                startIcon={<ShoppingCartOutlinedIcon />}>
                                {t('buy_now')}
                            </Button>
                        </Box>
                    ) : null}
                    <IconButton
                        className={classes.moreButton}
                        size="small"
                        onClick={openMenu}
                        data-testid="setting_icon">
                        <MoreVertOutlinedIcon />
                    </IconButton>
                    {menu}
                </Box>
                <WalletAssetsTable
                    classes={{ container: classes.assetsTable }}
                    wallet={wallet}
                    detailedTokens={detailedTokens}
                />
                {!xsMatched ? (
                    <Box className={classes.footer} display="flex" alignItems="center">
                        <Button
                            onClick={() =>
                                openWalletHistory({
                                    wallet,
                                    onRedPacketClicked(payload) {
                                        openWalletRedPacket({
                                            wallet,
                                            payload,
                                        })
                                    },
                                })
                            }
                            startIcon={<HistoryIcon />}
                            variant="text">
                            {t('activity')}
                        </Button>
                    </Box>
                ) : null}
            </ThemeProvider>
            {addToken}
            {walletShare}
            {walletHistory}
            {walletBackup}
            {walletDelete}
            {walletRename}
            {walletRedPacket}
        </div>
    )
})
