import { BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { NextIDVerificationStatus, useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { CloseIcon } from '../assets/close'
import { usePersonas } from '../hooks/usePersonas'
import { PersonaItem } from './PersonaItem'

const useStyles = makeStyles()(() => ({
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 8,
        backgroundColor: 'rgba(28, 104, 243, 0.1)',
        fontSize: 14,
        alignItems: 'center',
    },
}))

interface PersonaPageProps {
    onNext: () => void
    onChange: (wallets?: BindingProof[]) => void
}

export function PersonaPage(props: PersonaPageProps) {
    const { onNext, onChange } = props
    const [visible, setVisible] = useState(true)
    const currentIdentity = useLastRecognizedIdentity()
    const { classes } = useStyles()
    const { loading, personaConnectStatus, binds, wallets } = usePersonas()
    const nextIDConnectStatus = useNextIDConnectStatus()
    useEffect(() => {
        if (!personaConnectStatus.action) return
        const { status, action, isVerified } = nextIDConnectStatus
        if (isVerified || status === NextIDVerificationStatus.WaitingLocalConnect) return
        if (action) action()
    }, [nextIDConnectStatus])

    const onClick = useCallback(() => {
        onChange(wallets)
        onNext()
    }, [wallets])

    console.log(binds)
    return (
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
                                Customize NFT experience by connecting social accounts. Enjoy Web2 with a whole new Web3
                                vibe.
                            </Typography>
                            <CloseIcon sx={{ cursor: 'pointer' }} onClick={() => setVisible(false)} />
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
                                    onClick={onClick}
                                    platform={x.platform}
                                />
                            ) : (
                                <PersonaItem key={i} owner={false} avatar="" userId={x.identity} nickname="" />
                            ),
                        )}
                </>
            )}
        </DialogContent>
    )
}
