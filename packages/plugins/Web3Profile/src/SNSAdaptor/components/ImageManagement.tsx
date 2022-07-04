import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
// import { Copy } from 'react-feather'
import { WalletAssetsCard } from './WalletAssets'
import { PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { ImageListDialog } from './ImageList'
import { useState } from 'react'
import { InjectedDialog } from '@masknet/shared'
import { Box, Button, DialogContent } from '@mui/material'
import type { IdentityResolved } from '@masknet/plugin-infra'
import type { accountType, WalletTypes } from '../types'
import WalletSetting from './WalletSetting'
import { Empty } from './Empty'
import { context } from '../context'
import { GearIcon, WalletUnderTabsIcon } from '@masknet/icons'

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
        width: 564,
        height: 564,
        padding: '0 16px',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        posotion: 'relative',
        flexDirection: 'column',
    },
    settingIcon: {
        cursor: 'pointer',
    },
    walletIcon: {
        marginRight: '8px',
    },
}))

export interface ImageManagementProps {
    title: string
    currentPersona?: PersonaInformation
    open: boolean
    onClose: () => void
    currentVisitingProfile?: IdentityResolved
    accountList?: accountType
    accountId?: string
    allWallets?: WalletTypes[]
    getWalletHiddenRetry: () => void
    getBindingsRetry: () => void
}
const getAddressesByTitle = (title: string, accountList: accountType) => {
    if (title === 'Donations') return accountList?.walletList?.donations
    if (title === 'Footprints') return accountList?.walletList?.footprints
    return accountList?.walletList?.NFTs
}
export function ImageManagement(props: ImageManagementProps) {
    const t = useI18N()

    const { classes } = useStyles()
    const {
        title,
        currentPersona,
        open,
        onClose,
        accountId,
        allWallets = [],
        currentVisitingProfile,
        accountList,
        getWalletHiddenRetry,
        getBindingsRetry,
    } = props
    const [settingAddress, setSettingAddress] = useState<string>()
    const [imageListOpen, setImageListOpen] = useState(false)
    const [walletSettingOpen, setWalletSettingOpen] = useState(false)
    const addresses = getAddressesByTitle(title, accountList!)

    const hasConnectedWallets = allWallets?.length > 0

    const openPopupsWindow = async () => {
        await context.openPopupWindow(PopupRoutes.ConnectWallet)
    }
    return (
        <InjectedDialog
            title={title}
            classes={{ dialogContent: classes.content }}
            fullWidth={false}
            open={open}
            titleTail={<GearIcon className={classes.settingIcon} onClick={() => setWalletSettingOpen(true)} />}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                {addresses && addresses?.length > 0 ? (
                    addresses?.map((address) => (
                        <WalletAssetsCard
                            key={address.address}
                            onSetting={() => {
                                setSettingAddress(address.address)
                                setImageListOpen(true)
                            }}
                            type={title}
                            collectionList={address?.collections}
                            address={address.address}
                        />
                    ))
                ) : (
                    <Empty content={hasConnectedWallets ? t.open_wallet() : t.add_wallet()} />
                )}
                {!hasConnectedWallets && (
                    <Box className={classes.bottomButton}>
                        {' '}
                        <Button onClick={openPopupsWindow} className={classes.button}>
                            <WalletUnderTabsIcon className={classes.walletIcon} />
                            Add Wallet
                        </Button>
                    </Box>
                )}
                <ImageListDialog
                    currentPersona={currentPersona}
                    title={title}
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
                    title={title}
                    accountId={accountId}
                    onClose={() => setWalletSettingOpen(false)}
                    currentPersona={currentPersona}
                    retryData={getWalletHiddenRetry}
                />{' '}
            </DialogContent>
            {/* <DialogActions className={classes.noneAction} /> */}
        </InjectedDialog>
    )
}
