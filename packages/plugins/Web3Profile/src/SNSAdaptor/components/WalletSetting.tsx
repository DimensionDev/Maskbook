import type { IdentityResolved } from '@masknet/plugin-infra'
import { InjectedDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo } from 'react'
import { WalletSwitch } from '../components/WalletSwitch'
import { usePersonaSign } from '../hooks/usePersonaSign'

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
    wallets: BindingProof[]
    title: string
    open: boolean
    onClose: () => void
    currentPersona: PersonaInformation
    currentVisitingProfile: IdentityResolved
}

const WalletSetting = memo(
    ({ wallets, title, open, onClose, currentPersona, currentVisitingProfile }: WalletSettingProp) => {
        const { classes } = useStyles()

        const hiddenList = {
            NFT: [],
            Footprints: [],
            Donations: [],
        }

        const personaSign = usePersonaSign()
        // const onConfirm = async () => {
        //     if (!currentPersona?.publicHexKey) return
        //     const patch = {
        //         ...hiddenList,
        //     }
        //     try {
        //         const payload = await NextIDStorage.getPayload(
        //             currentPersona.publicHexKey,
        //             NextIDPlatform.Twitter,
        //             currentVisitingProfile?.identifier?.userId,
        //             patch,
        //         )
        //         console.log('payload', payload.val)
        //         const signature = await personaSign({
        //             message: payload.val?.signPayload,
        //             method: 'eth',
        //         })

        //         console.log({ signature })

        //         const res = await NextIDStorage.set(
        //             payload.val?.uuid,
        //             currentPersona.publicHexKey?.replace(/^0x/, ''),
        //             toBase64(fromHex(signature?.signature?.signature)),
        //             NextIDPlatform.Ethereum,
        //             currentVisitingProfile?.identifier?.userId,
        //             payload.val?.createdAt,
        //             patch,
        //         )
        //     } catch (err) {
        //         return
        //     }
        // }
        return (
            <InjectedDialog
                classes={{ dialogContent: classes.content }}
                title={title}
                fullWidth={false}
                open={open}
                onClose={onClose}>
                <DialogContent className={classes.content}>
                    <div>
                        <div className={classes.titleBox}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>NFT</Typography>
                            <Typography>(0/{wallets?.length})</Typography>
                        </div>
                        <div className={classes.walletSwitchBox}>
                            {wallets.map((x, idx) => {
                                return (
                                    <div key={idx} className={classes.swtichContainer}>
                                        <WalletSwitch
                                            hiddenItems={hiddenList.NFT}
                                            type={0}
                                            address={x.identity}
                                            isPublic
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
                            {wallets.map((x, idx) => {
                                return (
                                    <div key={idx} className={classes.swtichContainer}>
                                        <WalletSwitch
                                            hiddenItems={hiddenList.Footprints}
                                            type={0}
                                            address={x.identity}
                                            isPublic
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
                            {wallets.map((x, idx) => {
                                return (
                                    <div key={idx} className={classes.swtichContainer}>
                                        <WalletSwitch
                                            hiddenItems={hiddenList.Donations}
                                            type={0}
                                            address={x.identity}
                                            isPublic
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
                        <Button className={classes.button}>Confirm</Button>
                    </div>
                </DialogActions>
            </InjectedDialog>
        )
    },
)

export default WalletSetting
