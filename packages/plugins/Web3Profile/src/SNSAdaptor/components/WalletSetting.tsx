import { InjectedDialog } from '@masknet/shared'
import { context } from '../context'
import { NextIDStoragePayload, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'
import type { accountType, WalletTypes } from '../types'
import { getKvPayload, setKvPatchData } from '../hooks/useKV'
import { useChainId } from '@masknet/plugin-infra/web3'
const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
    },
    content: {
        width: 480,
        height: 420,
        maxHeight: 420,
        position: 'relative',
        paddingBottom: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
    },
    actions: {
        backgroundColor: theme.palette.background.paper,
    },
    titleBox: {
        display: 'flex',
        gap: 4,
        marginTop: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    walletSwitchBox: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
    },
    switchContainer: {
        width: 'calc(50% - 6px)',
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
        borderRadius: '99px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.mode === 'light' ? '#111418' : '#eff3f4',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
            backgroundColor: theme.palette.background.paper,
        },
    },
    button: {
        width: '48%',
        borderRadius: '99px',
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
            <InjectedDialog
                classes={{ dialogContent: classes.content }}
                title={title}
                fullWidth={false}
                open={open}
                titleTail={
                    <Button size="small" sx={{ borderRadius: '99px' }} onClick={openPopupsWindow}>
                        Wallets
                    </Button>
                }
                onClose={onClose}>
                <DialogContent className={classes.content}>
                    <div>
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>NFTs</Typography>
                            <Typography>
                                ({NFTs && wallets ? wallets?.length - NFTs?.length : wallets?.length}/{wallets?.length})
                            </Typography>
                        </div>
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
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Footprints</Typography>
                            <Typography>
                                ({footprints && wallets ? wallets?.length - footprints?.length : wallets?.length}/
                                {wallets?.length})
                            </Typography>
                        </div>
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
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Donations</Typography>
                            <Typography>
                                ({donations && wallets ? wallets?.length - donations?.length : wallets?.length}/
                                {wallets?.length})
                            </Typography>
                        </div>
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
                    </div>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <div className={classes.buttonWrapper}>
                        <Button className={classes.cancelButton} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className={classes.button} onClick={onConfirm} disabled={confirmButtonDisabled}>
                            Confirm
                        </Button>
                    </div>
                </DialogActions>
            </InjectedDialog>
        )
    },
)

export default WalletSetting
