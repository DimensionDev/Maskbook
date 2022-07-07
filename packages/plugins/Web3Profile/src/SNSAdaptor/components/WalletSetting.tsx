import { InjectedDialog } from '@masknet/shared'
import { context } from '../context'
import { NextIDStoragePayload, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Box, Button, DialogActions, DialogContent, Tab, Typography } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'
import type { accountType, WalletTypes } from '../types'
import { getKvPayload, setKvPatchData } from '../hooks/useKV'
import { useChainId } from '@masknet/plugin-infra/web3'
import { TabContext, TabPanel } from '@mui/lab'
import { Close as CloseIcon } from '@mui/icons-material'
import { SettingInfoIcon, WalletUnderTabsIcon } from '@masknet/icons'
import { useI18N } from '../../locales'
import { Empty } from './Empty'
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
        fill: theme.palette.maskColor.main,
        fontSize: '24px',
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
        fontSize: 16,
    },
}))

interface WalletSettingProp {
    wallets?: WalletTypes[]
    accountList?: accountType
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
        const [visible, setVisible] = useState(false)

        const [currentTab, onChange, tabs] = useTabs(title, 'NFTs', 'Footprints', 'Donations')

        const chainId = useChainId()
        const [NFTs, setNFTs] = useState<WalletTypes[]>()
        const [footprints, setFootprints] = useState<WalletTypes[]>()
        const [donations, setDonations] = useState<WalletTypes[]>()

        const hasWallet = wallets && wallets?.length > 0

        useEffect(() => {
            setNFTs(
                wallets?.filter((x) => accountList?.walletList?.NFTs?.findIndex((y) => x.address === y.address) === -1),
            )
            setFootprints(
                wallets?.filter(
                    (x) => accountList?.walletList?.footprints?.findIndex((y) => x.address === y.address) === -1,
                ),
            )
            setDonations(
                wallets?.filter(
                    (x) => accountList?.walletList?.donations?.findIndex((y) => x.address === y.address) === -1,
                ),
            )
        }, [open])

        useEffect(() => {
            const visible = localStorage.getItem('web3_profile_wallet_setting_hint_visible')
            setVisible(visible !== 'no')
        }, [])

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
                    payload?.val,
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
                    titleTail={<WalletUnderTabsIcon onClick={openPopupsWindow} className={classes.titleTailButton} />}
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
                                            <Typography color="currentColor" fontSize={14} fontFamily="Helvetica">
                                                {t.wallet_setting_hint()}
                                            </Typography>
                                        </Box>
                                        <CloseIcon onClick={onCloseHint} className={classes.closeIcon} />
                                    </Box>
                                )}
                                <TabPanel value={tabs.NFTs} style={{ padding: 0 }}>
                                    <div className={classes.walletSwitchBox}>
                                        {wallets?.map((x) => {
                                            return (
                                                <div key={x.address} className={classes.switchContainer}>
                                                    <WalletSwitch
                                                        hiddenItems={NFTs}
                                                        type={0}
                                                        address={x}
                                                        isPublic={
                                                            accountList?.walletList?.NFTs?.findIndex(
                                                                (account) => account.address === x?.address,
                                                            ) !== -1
                                                        }
                                                        setHiddenItems={setNFTs}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </TabPanel>
                                <TabPanel value={tabs.Footprints} style={{ padding: 0 }}>
                                    <div className={classes.walletSwitchBox}>
                                        {wallets?.map((x) => {
                                            return (
                                                <div key={x.address} className={classes.switchContainer}>
                                                    <WalletSwitch
                                                        hiddenItems={footprints}
                                                        type={0}
                                                        address={x}
                                                        isPublic={
                                                            accountList?.walletList?.footprints?.findIndex(
                                                                (account) => account.address === x?.address,
                                                            ) !== -1
                                                        }
                                                        setHiddenItems={setFootprints}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </TabPanel>
                                <TabPanel value={tabs.Donations} style={{ padding: 0 }}>
                                    <div className={classes.walletSwitchBox}>
                                        {wallets?.map((x) => {
                                            return (
                                                <div key={x.address} className={classes.switchContainer}>
                                                    <WalletSwitch
                                                        hiddenItems={donations}
                                                        type={0}
                                                        address={x}
                                                        isPublic={
                                                            accountList?.walletList?.donations?.findIndex(
                                                                (account) => account.address === x?.address,
                                                            ) !== -1
                                                        }
                                                        setHiddenItems={setDonations}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </TabPanel>
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
                                {' '}
                                <Button onClick={openPopupsWindow} fullWidth>
                                    <WalletUnderTabsIcon className={classes.walletIcon} />
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
