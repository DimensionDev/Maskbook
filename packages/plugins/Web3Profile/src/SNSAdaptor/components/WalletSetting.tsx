import { InjectedDialog } from '@masknet/shared'
import { context } from '../context'
import { NextIDStoragePayload, PersonaInformation, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'
import type { accountType, walletTypes } from '../types'
import { getKvPayload, setKvPatchData } from '../hooks/useKV'
const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
    },
    content: {
        width: 480,
        height: 510,
        maxHeight: 510,
        posotion: 'relative',
        paddingBottom: theme.spacing(3),
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
    swtichContainer: {
        width: 'calc(50% - 6px)',
    },
    buttonWrapper: {
        padding: '16px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexGrow: 1,
    },
    button: {
        width: '48%',
    },
}))

interface WalletSettingProp {
    wallets?: walletTypes[]
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

        const hiddenList = {
            NFTs: wallets?.filter(
                (x) => accountList?.walletList?.NFTs?.findIndex((y) => x.address === y.address) === -1,
            ),
            footprints: wallets?.filter(
                (x) => accountList?.walletList?.footprints?.findIndex((y) => x.address === y.address) === -1,
            ),
            donations: wallets?.filter(
                (x) => accountList?.walletList?.donations?.findIndex((y) => x.address === y.address) === -1,
            ),
        }

        const onConfirm = async () => {
            if (!currentPersona?.identifier.publicKeyAsHex) return
            const patch = {
                hiddenAddresses: { ...hiddenList },
            }
            console.log({ patch })
            try {
                const payload = await getKvPayload(patch, currentPersona.identifier.publicKeyAsHex, accountId!)
                const signature = await context.silentSign?.(
                    currentPersona?.identifier,
                    (payload?.val as NextIDStoragePayload)?.signPayload,
                )

                const res = await setKvPatchData(
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
            context.openPopupWindow(PopupRoutes.ConnectedWallets)
        }
        return (
            <InjectedDialog
                classes={{ dialogContent: classes.content }}
                title={title}
                fullWidth={false}
                open={open}
                titleTail={
                    <Button size="small" onClick={openPopupsWindow}>
                        Wallets
                    </Button>
                }
                onClose={onClose}>
                <DialogContent className={classes.content}>
                    <div>
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>NFT</Typography>
                            <Typography>(0/{wallets?.length})</Typography>
                        </div>
                        <div className={classes.walletSwitchBox}>
                            {wallets?.map((x, idx) => {
                                return (
                                    <div key={idx} className={classes.swtichContainer}>
                                        <WalletSwitch
                                            hiddenItems={hiddenList.NFTs}
                                            type={0}
                                            address={x}
                                            isPublic={
                                                accountList?.walletList?.NFTs?.findIndex(
                                                    (account) => account.address === x?.address,
                                                ) !== -1
                                            }
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Footprints</Typography>
                            <Typography>(0/4)</Typography>
                        </div>
                        <div className={classes.walletSwitchBox}>
                            {wallets?.map((x, idx) => {
                                return (
                                    <div key={idx} className={classes.swtichContainer}>
                                        <WalletSwitch
                                            hiddenItems={hiddenList.footprints}
                                            type={0}
                                            address={x}
                                            isPublic={
                                                accountList?.walletList?.footprints?.findIndex(
                                                    (account) => account.address === x?.address,
                                                ) !== -1
                                            }
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>Donations</Typography>
                            <Typography>(0/4)</Typography>
                        </div>
                        <div className={classes.walletSwitchBox}>
                            {wallets?.map((x, idx) => {
                                return (
                                    <div key={idx} className={classes.swtichContainer}>
                                        <WalletSwitch
                                            hiddenItems={hiddenList.donations}
                                            type={0}
                                            address={x}
                                            isPublic={
                                                accountList?.walletList?.donations?.findIndex(
                                                    (account) => account.address === x?.address,
                                                ) !== -1
                                            }
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <div className={classes.buttonWrapper}>
                        <Button className={classes.button} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className={classes.button} onClick={onConfirm}>
                            Confirm
                        </Button>
                    </div>
                </DialogActions>
            </InjectedDialog>
        )
    },
)

export default WalletSetting
