import { Icons } from '@masknet/icons'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { InjectedDialog, type WalletTypes } from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_LIST,
    PluginID,
    PopupRoutes,
    type PersonaInformation,
} from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Box, Button, DialogContent } from '@mui/material'
import { useMemo, useState } from 'react'
import { Scene, SceneMap } from '../../constants.js'
import { useI18N } from '../../locales/index.js'
import { context } from '../context.js'
import type { AccountType, UnlistedConfig } from '../types.js'
import { Empty } from './Empty.js'
import { ImageListDialog } from './ImageList.js'
import { WalletAssetsCard } from './WalletAssets.js'

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

const getWalletsByStatus = (account: AccountType | undefined, scene: Scene) => {
    if (!account) return EMPTY_LIST
    let wallets
    if (scene === Scene.DonationsSetting) wallets = account.walletList?.donations
    else if (scene === Scene.FootprintsSetting) wallets = account.walletList?.footprints
    else wallets = account.walletList?.NFTs

    if (!wallets?.length) return EMPTY_LIST
    return wallets?.sort((a, z) => {
        const aHasItems = a.collections?.length
        const zHasItems = z.collections?.length
        if (aHasItems && zHasItems) {
            if (!a.updateTime || !z.updateTime) return 0
            if (Number(a.updateTime) > Number(z.updateTime)) return -1
        }
        if (zHasItems) return 1
        if (aHasItems) return -1

        return 0
    })
}

const sceneToCollectionCategoryMap = {
    [Scene.DonationsSetting]: 'Donations',
    [Scene.FootprintsSetting]: 'Footprints',
    [Scene.NFTSetting]: 'NFTs',
} as const

export interface ImageManagementProps {
    scene: Scene
    currentPersona?: PersonaInformation
    open: boolean
    onClose: () => void
    currentVisitingProfile?: IdentityResolved
    account?: AccountType
    accountId?: string
    allWallets?: WalletTypes[]
    getWalletHiddenRetry: () => void
    unlistedCollectionConfig?: UnlistedConfig['collections'][string]
}
async function openPopupsWindow() {
    await context.openPopupWindow(PopupRoutes.ConnectWallet)
}

function openSettingDialog() {
    CrossIsolationMessages.events.settingsDialogEvent.sendToLocal({
        open: true,
        targetTab: PluginID.Web3Profile,
    })
}

export function ImageManagement({
    scene,
    currentPersona,
    open,
    onClose,
    accountId,
    allWallets = EMPTY_LIST,
    account,
    getWalletHiddenRetry,
    unlistedCollectionConfig,
}: ImageManagementProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [settingWallet, setSettingWallet] = useState<WalletTypes>()
    const [imageListOpen, setImageListOpen] = useState(false)
    const wallets = useMemo(() => getWalletsByStatus(account, scene) ?? EMPTY_LIST, [account, scene])
    const categoryField = sceneToCollectionCategoryMap[scene]

    const hasConnectedWallets = allWallets.length > 0

    const unlistedKeys = useMemo(() => {
        if (!unlistedCollectionConfig || !settingWallet?.address) return EMPTY_LIST
        const field = sceneToCollectionCategoryMap[scene]
        return unlistedCollectionConfig?.[settingWallet.address]?.[field] || EMPTY_LIST
    }, [unlistedCollectionConfig, settingWallet?.address, scene])

    return (
        <InjectedDialog
            title={SceneMap[scene].title}
            classes={{ dialogContent: classes.content }}
            fullWidth={false}
            open={open}
            titleTail={<Icons.Gear className={classes.settingIcon} onClick={openSettingDialog} />}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <div>
                    {wallets.length ? (
                        wallets.map((wallet) => {
                            const unlistedKeys = unlistedCollectionConfig?.[wallet.address]?.[categoryField] ?? []
                            const collections = wallet.collections?.filter((x) => !unlistedKeys.includes(x.key))
                            return (
                                <WalletAssetsCard
                                    key={wallet.address}
                                    collectionName={SceneMap[scene].title}
                                    onSetting={() => {
                                        setSettingWallet(wallet)
                                        setImageListOpen(true)
                                    }}
                                    collections={collections}
                                    wallet={wallet}
                                    hasUnlisted={unlistedKeys.length > 0}
                                />
                            )
                        })
                    ) : (
                        <Box className={classes.emptyItem}>
                            <Empty
                                showIcon
                                content={hasConnectedWallets ? t.open_wallet() : t.add_wallet_to_connected()}
                            />
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
                {settingWallet && imageListOpen ? (
                    <ImageListDialog
                        open
                        currentPersona={currentPersona}
                        title={SceneMap[scene].title}
                        wallet={settingWallet}
                        accountId={accountId}
                        onClose={() => setImageListOpen(false)}
                        retryData={getWalletHiddenRetry}
                        collectionList={
                            wallets.find((x) => isSameAddress(x.address, settingWallet.address))?.collections
                        }
                        unlistedKeys={unlistedKeys}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
