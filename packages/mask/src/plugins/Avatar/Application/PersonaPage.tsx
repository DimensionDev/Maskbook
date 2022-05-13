import { BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { CloseIcon } from '../assets/close'
import { context } from '../context'
import { usePersonas } from '../hooks/usePersonas'
import { usePersonaVerify } from '../hooks/usePersonaVerified'
import { useI18N } from '../locales/i18n_generated'
import type { TokenInfo } from '../types'
import { PersonaItem } from './PersonaItem'
import { InfoIcon } from '../assets/info'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'

const useStyles = makeStyles()((theme) => ({
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 8,
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F9F9F9',
        fontSize: 14,
        alignItems: 'center',
        color: theme.palette.text.primary,
    },
}))

interface PersonaPageProps {
    onNext: () => void
    onClose(): void
    onChange: (proof: BindingProof, wallets?: BindingProof[], tokenInfo?: TokenInfo) => void
}

export function PersonaPage(props: PersonaPageProps) {
    const { onNext, onChange, onClose } = props
    const [visible, setVisible] = useState(true)
    const currentIdentity = useSubscription(context.lastRecognizedProfile)
    const { classes } = useStyles()
    const { loading, value: persona } = usePersonas()
    const { loading: loadingPersonaVerified, value: personaVerifiedStatus } = usePersonaVerify()
    const { reset } = useNextIDConnectStatus()
    const myPersonas = useMyPersonas()
    const t = useI18N()

    console.log(myPersonas)
    useEffect(() => {
        if (!personaVerifiedStatus || personaVerifiedStatus?.isVerified) return
        if (reset) reset()
        onClose()
    }, [personaVerifiedStatus, onClose, reset])

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: TokenInfo) => {
            onChange(proof, persona?.wallets, tokenInfo)
            onNext()
        },
        [persona?.wallets],
    )

    return (
        <DialogContent sx={{ height: 612, padding: 2 }}>
            {loading || loadingPersonaVerified ? (
                <Stack justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Stack>
            ) : (
                <>
                    {visible ? (
                        <Box className={classes.messageBox}>
                            <InfoIcon />
                            <Typography color="currentColor" variant="body1" fontSize={14}>
                                {t.persona_hint()}
                            </Typography>
                            <CloseIcon sx={{ cursor: 'pointer' }} onClick={() => setVisible(false)} />
                        </Box>
                    ) : null}
                    {persona?.binds?.proofs
                        .filter((proof) => proof.platform === NextIDPlatform.Twitter)
                        .filter((x) => x.identity.toLowerCase() === currentIdentity?.identifier?.userId.toLowerCase())
                        .map((x, i) => (
                            <PersonaItem
                                key="avatar"
                                avatar={currentIdentity?.avatar ?? ''}
                                owner
                                nickname={currentIdentity?.nickname}
                                proof={x}
                                userId={x.identity}
                                onSelect={onSelect}
                            />
                        ))}

                    {myPersonas?.[0] &&
                        myPersonas[0].linkedProfiles.map((x, i) =>
                            persona?.binds.proofs.some((y) => y.identity === x.identifier.userId) ? null : (
                                <PersonaItem avatar="" key={`persona${i}`} owner={false} userId={x.identifier.userId} />
                            ),
                        )}
                    {persona?.binds?.proofs
                        .filter((proof) => proof.platform === NextIDPlatform.Twitter)
                        .filter((x) => x.identity.toLowerCase() !== currentIdentity?.identifier?.userId.toLowerCase())
                        .map((x, i) => (
                            <PersonaItem avatar="" key={i} owner={false} userId={x.identity} proof={x} />
                        ))}
                </>
            )}
        </DialogContent>
    )
}
