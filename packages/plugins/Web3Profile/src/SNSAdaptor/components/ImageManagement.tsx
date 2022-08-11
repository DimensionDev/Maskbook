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
import { Icons } from '@masknet/icons'
import { CurrentStatusMap, CURRENT_STATUS } from '../../constants'
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
        backgroundColor: theme.palette.background.paper,
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
const getAddressesByStatus = (status: CURRENT_STATUS, accountList: AccountType) => {
    let addresses
    if (status === CURRENT_STATUS.Donations_setting) addresses = accountList?.walletList?.donations
    if (status === CURRENT_STATUS.Footprints_setting) addresses = accountList?.walletList?.footprints
    if (status === CURRENT_STATUS.NFT_Setting) addresses = accountList?.walletList?.footprints
    return addresses?.sort((a, z) => {
        const a_hasItems = a?.collections && a.collections.filter?.((collection) => !collection?.hidden)?.length > 0
        const z_hasItems = z?.collections && z.collections.filter?.((collection) => !collection?.hidden)?.length > 0
        if (a_hasItems && z_hasItems) {
            if (!a?.updateTime || !z?.updateTime) return 0
            if (Number(a.updateTime) > Number(z.updateTime)) return -1
        }
        if (z_hasItems) return 1
        if (a_hasItems) return -1

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
        allWallets = [],
        accountList,
        getWalletHiddenRetry,
    } = props
    const [settingAddress, setSettingAddress] = useState<WalletTypes>()
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
            titleTail={<Icons.Gear className={classes.settingIcon} onClick={() => setWalletSettingOpen(true)} />}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    {addresses && addresses.length > 0 ? (
                        addresses.map((address) => (
                            <WalletAssetsCard
                                key={address.address}
                                collectionName={CurrentStatusMap[status].title}
                                onSetting={() => {
                                    setSettingAddress(address)
                                    setImageListOpen(true)
                                }}
                                collectionList={address?.collections}
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
