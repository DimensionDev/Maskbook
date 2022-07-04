import { InjectedDialog } from '@masknet/shared'
import { context } from '../context'
import { NextIDStoragePayload, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Tab, Typography } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'
import type { accountType, WalletTypes } from '../types'
import { getKvPayload, setKvPatchData } from '../hooks/useKV'
import { useChainId } from '@masknet/plugin-infra/web3'
import { TabContext, TabPanel } from '@mui/lab'
import { WalletUnderTabsIcon } from '@masknet/icons'
const useStyles = makeStyles()((theme) => ({
    content: {
        width: 564,
        height: 420,
        maxHeight: 420,
        position: 'relative',
        padding: '16px 16px 0 16px',
        backgroundColor: theme.palette.background.paper,
    },
    actions: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
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
        color: theme.palette.mode === 'light' ? '#111418' : '#eff3f4',
        '&:hover': {
            backgroundColor: theme.palette.background.paper,
        },
    },
    button: {
        width: '48%',
        borderRadius: '8px',
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

        const [confirmButtonDisabled, setConfirmButtonDisabled] = useState(true)

        const [currentTab, onChange, tabs] = useTabs('NFTs', 'Footprints', 'Donations')

        const chainId = useChainId()
        const [NFTs, setNFTs] = useState(
            wallets?.filter((x) => accountList?.walletList?.NFTs?.findIndex((y) => x.address === y.address) === -1),
        )
        const [footprints, setFootprints] = useState(
            wallets?.filter(
                (x) => accountList?.walletList?.footprints?.findIndex((y) => x.address === y.address) === -1,
            ),
        )
        const [donations, setDonations] = useState(
            wallets?.filter(
                (x) => accountList?.walletList?.donations?.findIndex((y) => x.address === y.address) === -1,
            ),
        )

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
                            <Tab
                                label={
                                    <Typography component="div" className={classes.labelWrapper}>
                                        <span className={classes.tabItem}>NFTs</span>
                                    </Typography>
                                }
                                value={tabs.NFTs}
                            />
                            <Tab
                                label={
                                    <Typography component="div" className={classes.labelWrapper}>
                                        <span className={classes.tabItem}>Footprints</span>
                                    </Typography>
                                }
                                value={tabs.Footprints}
                            />
                            <Tab
                                label={
                                    <Typography component="div" className={classes.labelWrapper}>
                                        <span className={classes.tabItem}>Donations</span>
                                    </Typography>
                                }
                                value={tabs.Donations}
                            />
                        </MaskTabList>
                    }
                    onClose={onClose}>
                    <DialogContent className={classes.content}>
                        <>
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
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <div className={classes.buttonWrapper}>
                            <Button className={classes.cancelButton} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button className={classes.button} onClick={onConfirm} disabled={confirmButtonDisabled}>
                                Save
                            </Button>
                        </div>
                    </DialogActions>
                </InjectedDialog>
            </TabContext>
        )
    },
)

export default WalletSetting
