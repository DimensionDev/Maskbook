import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales/index.js'
import { WalletAssetsCard } from './WalletAssets.js'
import {CrossIsolationMessages, EMPTY_LIST, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { ImageListDialog } from './ImageList.js'
import {useCallback, useState } from 'react'
import { InjectedDialog, WalletTypes } from '@masknet/shared'
import { Box, Button, DialogContent } from '@mui/material'
import { IdentityResolved, PluginID } from '@masknet/plugin-infra'
import type { AccountType } from '../types.js'
import WalletSetting from './WalletSetting.js'
import { Empty } from './Empty.js'
import { context } from '../context.js'
import { Icons } from '@masknet/icons'
import { CurrentStatusMap, CURRENT_STATUS } from '../../constants.js'
import { isSameAddress } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    bottomButton: {
        width: '100%',
        height: '72px',
        position: 'absolute',
        marginLeft: -16,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    button: {
        width: 'calc(100% - 32px)',
    },
    content: {
        width: 568,
        height: 548,
        padding: '0 16px 16px 16px',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 5,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
        overflowX: 'hidden',
    },
    settingIcon: {
        cursor: 'pointer',
    },
    walletIcon: {
        marginRight: '8px',
    },
    emptyItem: {
        marginTop: 'calc(50% - 104px)',
    },
}))

export interface ImageManagementProps {
    status: CURRENT_STATUS
    currentPersona?: PersonaInformation
    open: boolean
    onClose: () => void
    currentVisitingProfile?: IdentityResolved
    accountList?: AccountType
    accountId?: string
    allWallets?: WalletTypes[]
    getWalletHiddenRetry: () => void
}
const getAddressesByStatus = (accountList: AccountType | undefined, status: CURRENT_STATUS) => {
    if (!accountList) return EMPTY_LIST
    let addresses
    if (status === CURRENT_STATUS.Donations_setting) addresses = accountList.walletList?.donations
    if (status === CURRENT_STATUS.Footprints_setting) addresses = accountList.walletList?.footprints
    if (status === CURRENT_STATUS.NFT_Setting) addresses = accountList.walletList?.NFTs
    return addresses?.sort((a, z) => {
        const aHasItems = a.collections?.some?.((x) => !x?.hidden)
        const zHasItems = z.collections?.some?.((x) => !x?.hidden)
        if (aHasItems && zHasItems) {
            if (!a?.updateTime || !z?.updateTime) return 0
            if (Number(a.updateTime) > Number(z.updateTime)) return -1
        }
        if (zHasItems) return 1
        if (aHasItems) return -1

        return 0
    })
}

export function ImageManagement(props: ImageManagementProps) {
    const t = useI18N()

    const { classes } = useStyles()
    const {
        status,
        currentPersona,
        open,
        onClose,
        accountId,
        allWallets = EMPTY_LIST,
        accountList,
        getWalletHiddenRetry,
    } = props
    const [settingAddress, setSettingAddress] = useState<WalletTypes>()
    const [imageListOpen, setImageListOpen] = useState(false)
    const addresses = getAddressesByStatus(accountList, status)

    const handleOpenSettingDialog = useCallback(
        () =>
            CrossIsolationMessages.events.PluginSettingsDialogUpdate.sendToLocal({
                open: true,
                targetTab: PluginId.Web3Profile,
            }),
        [],
    )

    const hasConnectedWallets = allWallets.length > 0

    const openPopupsWindow = async () => {
        await context.openPopupWindow(PopupRoutes.ConnectWallet)
    }
    return (
        <InjectedDialog
            title={CurrentStatusMap[status].title}
            classes={{ dialogContent: classes.content }}
            fullWidth={false}
            open={open}
            titleTail={<Icons.Gear className={classes.settingIcon} onClick={handleOpenSettingDialog} />}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    {addresses?.length ? (
                        addresses.map((address) => (
                            <WalletAssetsCard
                                key={address.address}
                                collectionName={CurrentStatusMap[status].title}
                                onSetting={() => {
                                    setSettingAddress(address)
                                    setImageListOpen(true)
                                }}
                                collectionList={address.collections}
                                address={address}
                            />
                        ))
                    ) : (
                        <Box className={classes.emptyItem}>
                            <Empty content={hasConnectedWallets ? t.open_wallet() : t.add_wallet_to_connected()} />
                        </Box>
                    )}
                    {!hasConnectedWallets && (
                        <Box className={classes.bottomButton}>
                            <Button onClick={openPopupsWindow} className={classes.button}>
                                <Icons.WalletUnderTabs size={16} className={classes.walletIcon} />
                                {t.add_wallet()}
                            </Button>
                        </Box>
                    )}
                </div>
                <ImageListDialog
                    currentPersona={currentPersona}
                    title={CurrentStatusMap[status].title}
                    address={settingAddress}
                    open={imageListOpen}
                    accountId={accountId}
                    onClose={() => setImageListOpen(false)}
                    retryData={getWalletHiddenRetry}
                    collectionList={
                        addresses?.find((address) => isSameAddress(address?.address, settingAddress?.address))
                            ?.collections
                    }
                />
            </DialogContent>
        </InjectedDialog>
    )
}
