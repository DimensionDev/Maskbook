import React, { useCallback, useState } from 'react'
import { Button, Box, IconButton, MenuItem, Tabs, Tab } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
import HistoryIcon from '@material-ui/icons/History'
import { useModal } from '../DashboardDialogs/Base'
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
import { PluginTransakMessages } from '../../../plugins/Transak/messages'
import { Flags } from '../../../utils/flags'
import { ElectionTokenAlbum } from '../../../plugins/Election2020/UI/ElectionTokenAlbum'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&> *': {
                flex: '0 0 auto',
                overflow: 'auto',
            },
        },
        header: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        content: {
            flex: 1,
        },
        footer: {
            margin: theme.spacing(1),
        },
        title: {},
        tab: {
            flex: 1,
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
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    //#endregion

    //#region tab
    const [tabIndex, setTabIndex] = useState(0)
    const onTabChange = useCallback((_, newTabIndex: number) => {
        setTabIndex(newTabIndex)
    }, [])
    //#endregion

    return (
        <div className={classes.root} ref={ref}>
            <Box
                pt={xsMatched ? 2 : 3}
                pb={2}
                pl={3}
                pr={2}
                display="flex"
                alignItems="center"
                className={xsMatched ? classes.header : ''}>
                <Tabs
                    className={classes.tab}
                    value={tabIndex}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={onTabChange}>
                    <Tab label="Token"></Tab>
                    <Tab label="NFT"></Tab>
                </Tabs>
                {!xsMatched ? (
                    <Box className={classes.footer} display="flex" alignItems="center" justifyContent="flex-end">
                        {tabIndex === 0 ? (
                            <Button
                                className={classes.addButton}
                                variant="text"
                                onClick={() => openAddToken({ wallet })}
                                startIcon={<AddIcon />}>
                                {t('add_token')}
                            </Button>
                        ) : null}
                        {Flags.transak_enabled ? (
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
                        ) : null}
                    </Box>
                ) : null}
                <IconButton className={classes.moreButton} size="small" onClick={openMenu} data-testid="setting_icon">
                    <MoreVertOutlinedIcon />
                </IconButton>
                {menu}
            </Box>

            <Box className={classes.content}>
                {tabIndex === 0 ? (
                    <WalletAssetsTable
                        classes={{ container: classes.assetsTable }}
                        wallet={wallet}
                        detailedTokens={detailedTokens}
                    />
                ) : null}
                {Flags.election2020_enabled && tabIndex === 1 ? <ElectionTokenAlbum /> : null}
            </Box>

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
