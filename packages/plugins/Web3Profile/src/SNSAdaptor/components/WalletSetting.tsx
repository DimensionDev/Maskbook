import { InjectedDialog } from '@masknet/shared'
import { context } from '../context'
import { NextIDStoragePayload, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Box, Button, DialogActions, DialogContent, Tab, Typography } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import type { AccountType, WalletTypes } from '../types'
import { useChainId } from '@masknet/plugin-infra/web3'
import { TabContext } from '@mui/lab'
import { Close as CloseIcon } from '@mui/icons-material'
import { SettingInfoIcon, WalletUnderTabsIcon } from '@masknet/icons'
import { useI18N } from '../../locales'
import { Empty } from './Empty'
import { isSameAddress } from '@masknet/web3-shared-base'
import { getKvPayload, setKvPatchData } from '../utils'
import { WalletTab } from './WalletTab'
const useStyles = makeStyles()((theme) => ({
    content: {
        width: 568,
        height: 440,
        position: 'relative',
        padding: '16px 16px 0 16px',
        backgroundColor: theme.palette.background.paper,
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    actions: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        zIndex: 1,
        height: '72px',
        padding: '0px !important',
    },
    titleTailButton: {
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
    },
    labelWrapper: {
        display: 'flex',
    },
    tabItem: {
        fontSize: '16px',
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    walletSwitchBox: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
    },
    switchContainer: {
        width: 'calc(50% - 6px)',
        borderRadius: '8px',
    },
    buttonWrapper: {
        padding: '16px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexGrow: 1,
    },
    cancelButton: {
        width: '48%',
        borderRadius: '8px',
        backgroundColor: theme.palette.maskColor.thirdMain,
        color: theme.palette.maskColor.main,
        '&:hover': {
            backgroundColor: theme.palette.background.paper,
        },
    },
    button: {
        width: '48%',
        borderRadius: '8px',
    },
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 12,
        backgroundColor: theme.palette.maskColor.bg,
        fontSize: 14,
        alignItems: 'center',
        color: theme.palette.text.primary,
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    closeIcon: {
        color: theme.palette.maskColor.main,
    },
    infoIcon: {
        width: 20,
        height: 20,
    },
    bottomButton: {
        width: '100%',
        padding: 16,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
    },
    walletIcon: {
        marginRight: '8px',
    },
}))

interface WalletSettingProp {
    wallets?: WalletTypes[]
    accountList?: AccountType
    title: string
    open: boolean
    onClose: () => void
    accountId?: string
    currentPersona?: PersonaInformation
    retryData: () => void
}

const WalletSetting = memo(
    ({ wallets, accountList, title, open, onClose, accountId, currentPersona, retryData }: WalletSettingProp) => {
        const { classes } = useStyles()

        const t = useI18N()

        const [confirmButtonDisabled, setConfirmButtonDisabled] = useState(true)
        const [visible, setVisible] = useState(!localStorage.getItem('web3_profile_wallet_setting_hint_visible'))

        const [currentTab, onChange, tabs] = useTabs(title, t.NFTs(), t.footprints(), t.donations())

        const chainId = useChainId()
        const [NFTs, setNFTs] = useState<WalletTypes[]>()
        const [footprints, setFootprints] = useState<WalletTypes[]>()
        const [donations, setDonations] = useState<WalletTypes[]>()

        const hasWallet = wallets && wallets.length > 0

        useEffect(() => {
            setNFTs(
                wallets?.filter(
                    (x) => accountList?.walletList?.NFTs?.findIndex((y) => isSameAddress(x.address, y.address)) === -1,
                ),
            )
            setFootprints(
                wallets?.filter(
                    (x) =>
                        accountList?.walletList?.footprints?.findIndex((y) => isSameAddress(x.address, y.address)) ===
                        -1,
                ),
            )
            setDonations(
                wallets?.filter(
                    (x) =>
                        accountList?.walletList?.donations?.findIndex((y) => isSameAddress(x.address, y.address)) ===
                        -1,
                ),
            )
        }, [open, wallets])

        useEffect(() => {
            if (confirmButtonDisabled) setConfirmButtonDisabled(false)
        }, [NFTs?.length, footprints?.length, donations?.length])

        useEffect(() => {
            setConfirmButtonDisabled(true)
        }, [open])

        const onConfirm = async () => {
            if (!currentPersona?.identifier.publicKeyAsHex) return
            const patch = {
                hiddenAddresses: {
                    NFTs,
                    footprints,
                    donations,
                },
            }
            try {
                const payload = await getKvPayload(patch, currentPersona.identifier.publicKeyAsHex, accountId!)
                const signature = await context.privileged_silentSign()?.(
                    currentPersona?.identifier,
                    (payload?.val as NextIDStoragePayload)?.signPayload,
                )

                await setKvPatchData(
                    payload?.val as NextIDStoragePayload,
                    signature?.signature?.signature,
                    patch,
                    currentPersona.identifier.publicKeyAsHex,
                    accountId!,
                )
                retryData()
                onClose()
            } catch (err) {
                return
            }
        }

        const openPopupsWindow = () => {
            context.openPopupWindow(PopupRoutes.ConnectedWallets, {
                chainId,
                internal: true,
            })
        }

        const onCloseHint = () => {
            localStorage.setItem('web3_profile_wallet_setting_hint_visible', 'no')
            setVisible(false)
        }
        return (
            <TabContext value={currentTab}>
                <InjectedDialog
                    classes={{ dialogContent: classes.content }}
                    title="Settings"
                    fullWidth={false}
                    open={open}
                    titleTail={
                        <WalletUnderTabsIcon size={24} onClick={openPopupsWindow} className={classes.titleTailButton} />
                    }
                    titleTabs={
                        <MaskTabList variant="base" onChange={onChange} aria-label="Web3ProfileWalletSetting">
                            <Tab label={t.NFTs()} value={tabs.NFTs} />
                            <Tab label={t.footprints()} value={tabs.Footprints} />
                            <Tab label={t.donations()} value={tabs.Donations} />
                        </MaskTabList>
                    }
                    onClose={onClose}>
                    <DialogContent className={classes.content}>
                        {hasWallet ? (
                            <>
                                {visible && (
                                    <Box className={classes.messageBox}>
                                        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                                            <SettingInfoIcon className={classes.infoIcon} />
                                            <Typography color="currentColor" fontSize={14}>
                                                {t.wallet_setting_hint()}
                                            </Typography>
                                        </Box>
                                        <CloseIcon onClick={onCloseHint} className={classes.closeIcon} />
                                    </Box>
                                )}

                                <WalletTab
                                    value={tabs.NFTs}
                                    wallets={wallets}
                                    hiddenItems={NFTs}
                                    setHiddenItems={setNFTs}
                                />
                                <WalletTab
                                    value={tabs.Footprints}
                                    wallets={wallets}
                                    hiddenItems={footprints}
                                    setHiddenItems={setFootprints}
                                />
                                <WalletTab
                                    value={tabs.Donations}
                                    wallets={wallets}
                                    hiddenItems={donations}
                                    setHiddenItems={setDonations}
                                />
                            </>
                        ) : (
                            <Empty content={t.no_authenticated_wallet()} />
                        )}
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        {hasWallet ? (
                            <div className={classes.buttonWrapper}>
                                <Button className={classes.cancelButton} onClick={onClose}>
                                    {t.cancel()}
                                </Button>
                                <Button className={classes.button} onClick={onConfirm} disabled={confirmButtonDisabled}>
                                    {t.save()}
                                </Button>
                            </div>
                        ) : (
                            <Box className={classes.bottomButton}>
                                <Button onClick={openPopupsWindow} fullWidth>
                                    <WalletUnderTabsIcon size={16} className={classes.walletIcon} />
                                    {t.add_wallet()}
                                </Button>
                            </Box>
                        )}
                    </DialogActions>
                </InjectedDialog>
            </TabContext>
        )
    },
)

export default WalletSetting
