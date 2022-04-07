import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogContent, Typography } from '@mui/material'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { PersonaItem } from './PersonaItem'
import { CloseIcon } from '../assets/close'
import { useEffect, useState } from 'react'
import { NFTListDialog } from './NFTListDialog'
import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDVerificationStatus, useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { InjectedDialog } from '@masknet/shared'
import { usePersonas } from '../hooks/usePersonas'

const useStyles = makeStyles()((theme) => ({
    root: {},
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 8,
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        fontSize: 14,
        alignItems: 'center',
    },
}))

interface NFTAvatarsDialogProps extends withClasses<never> {
    open: boolean
    onClose: () => void
}

export function NFTAvatarDialog(props: NFTAvatarsDialogProps) {
    const { classes } = useStyles()
    const currentIdentity = useLastRecognizedIdentity()
    const [visible, setVisible] = useState(true)
    const [open, setOpen] = useState(false)

    const { loading, isOwner, personaConnectStatus, binds } = usePersonas()

    const netxtIDConnectStatus = useNextIDConnectStatus()
    useEffect(() => {
        if (!personaConnectStatus.action) return
        const { status, action, isVerified } = netxtIDConnectStatus
        if (isVerified || status === NextIDVerificationStatus.WaitingLocalConnect) return
        if (action) action()
    }, [netxtIDConnectStatus])

    return (
        <>
            <InjectedDialog title="NFT PFP" open={props.open} onClose={props.onClose}>
                <DialogContent sx={{ height: 612 }}>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {visible ? (
                                <Box className={classes.messageBox}>
                                    <Typography color="#1C68F3" variant="body1" fontSize={14}>
                                        Customize NFT experience by connecting social accounts. Enjoy Web2 with a whole
                                        new Web3 vibe.
                                    </Typography>
                                    <CloseIcon onClick={() => setVisible(false)} />
                                </Box>
                            ) : null}
                            <PersonaItem
                                key={currentIdentity.identifier.userId}
                                disabled={!isOwner}
                                avatar={currentIdentity.avatar}
                                userId={currentIdentity.identifier.userId}
                                nickname={currentIdentity.nickname}
                                onClick={() => setOpen(true)}
                            />
                            {binds?.proofs
                                .filter((proof) => proof.platform !== NextIDPlatform.Ethereum)
                                .filter(
                                    (proof) =>
                                        proof?.identity.toLowerCase() !==
                                        currentIdentity.identifier.userId.toLowerCase(),
                                )
                                .map((x, i) => (
                                    <PersonaItem
                                        key={i}
                                        disabled={!isOwner}
                                        avatar=""
                                        userId={x.identity}
                                        nickname=""
                                        onClick={() => setOpen(true)}
                                    />
                                ))}
                        </>
                    )}
                </DialogContent>
            </InjectedDialog>
            <NFTListDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
