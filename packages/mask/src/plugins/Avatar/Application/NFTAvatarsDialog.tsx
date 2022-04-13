import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogContent, Stack, Typography } from '@mui/material'
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

    const { loading, personaConnectStatus, binds } = usePersonas()

    const nextIDConnectStatus = useNextIDConnectStatus()
    useEffect(() => {
        if (!personaConnectStatus.action) return
        const { status, action, isVerified } = nextIDConnectStatus
        if (isVerified || status === NextIDVerificationStatus.WaitingLocalConnect) return
        if (action) action()
    }, [nextIDConnectStatus])

    const _onClose = () => {
        setOpen(false)
        props.onClose()
    }

    return (
        <>
            <InjectedDialog title="NFT PFP" open={props.open} onClose={_onClose}>
                <DialogContent sx={{ height: 612 }}>
                    {loading ? (
                        <Stack justifyContent="center" alignItems="center">
                            <CircularProgress />
                        </Stack>
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
                            {binds?.proofs
                                .filter((proof) => proof.platform !== NextIDPlatform.Ethereum)
                                .map((x, i) =>
                                    x.identity.toLowerCase() === currentIdentity.identifier.userId.toLowerCase() ? (
                                        <PersonaItem
                                            key={i}
                                            owner
                                            avatar={currentIdentity.avatar}
                                            userId={currentIdentity.identifier.userId}
                                            nickname={currentIdentity.nickname}
                                            onClick={() => setOpen(true)}
                                        />
                                    ) : (
                                        <PersonaItem key={i} owner={false} avatar="" userId={x.identity} nickname="" />
                                    ),
                                )}
                        </>
                    )}
                </DialogContent>
            </InjectedDialog>
            <NFTListDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}
