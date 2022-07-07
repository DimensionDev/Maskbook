import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { WalletAssetsCard } from './WalletAssets'
import { PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { ImageListDialog } from './ImageList'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Box, Button, DialogContent } from '@mui/material'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { AccountType, WalletTypes } from '../types'
import WalletSetting from './WalletSetting'
import { Empty } from './Empty'
import { context } from '../context'
import { GearIcon, WalletUnderTabsIcon } from '@masknet/icons'
import { CurrentStatusMap, CURRENT_STATUS } from '../../constants'

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
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
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
        fontSize: 16,
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
const getAddressesByStatus = (status: CURRENT_STATUS, accountList: AccountType) => {
    if (status === CURRENT_STATUS.Donations_setting) return accountList?.walletList?.donations
    if (status === CURRENT_STATUS.Footprints_setting) return accountList?.walletList?.footprints
    return accountList?.walletList?.NFTs
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
        allWallets = [],
        accountList,
        getWalletHiddenRetry,
    } = props
    const [settingAddress, setSettingAddress] = useState<string>()
    const [imageListOpen, setImageListOpen] = useState(false)
    const [walletSettingOpen, setWalletSettingOpen] = useState(false)
    const addresses = getAddressesByStatus(status, accountList!)

    const hasConnectedWallets = allWallets?.length > 0

    const openPopupsWindow = async () => {
        await context.openPopupWindow(PopupRoutes.ConnectWallet)
    }
    return (
        <InjectedDialog
            title={CurrentStatusMap[status].title}
            classes={{ dialogContent: classes.content }}
            fullWidth={false}
            open={open}
            titleTail={<GearIcon className={classes.settingIcon} onClick={() => setWalletSettingOpen(true)} />}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    {addresses && addresses.length > 0 ? (
                        addresses.map((address) => (
                            <WalletAssetsCard
                                key={address.address}
                                onSetting={() => {
                                    setSettingAddress(address.address)
                                    setImageListOpen(true)
                                }}
                                collectionList={address?.collections}
                                address={address.address}
                            />
                        ))
                    ) : (
                        <Box className={classes.emptyItem}>
                            <Empty content={hasConnectedWallets ? t.open_wallet() : t.add_wallet()} />
                        </Box>
                    )}
                    {!hasConnectedWallets && (
                        <Box className={classes.bottomButton}>
                            <Button onClick={openPopupsWindow} className={classes.button}>
                                <WalletUnderTabsIcon className={classes.walletIcon} />
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
                    collectionList={addresses?.find((address) => address?.address === settingAddress)?.collections}
                />
                <WalletSetting
                    wallets={allWallets}
                    accountList={accountList}
                    open={walletSettingOpen}
                    title={CurrentStatusMap[status].title}
                    accountId={accountId}
                    onClose={() => setWalletSettingOpen(false)}
                    currentPersona={currentPersona}
                    retryData={getWalletHiddenRetry}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
