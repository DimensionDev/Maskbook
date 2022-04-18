import { BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { NextIDVerificationStatus, useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import { CloseIcon } from '../assets/close'
import { context } from '../context'
import { usePersonas } from '../hooks/usePersonas'
import { useI18N } from '../locales/i18n_generated'
import type { TokenInfo } from '../types'
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
    onChange: (proof: BindingProof, wallets?: BindingProof[], tokenInfo?: TokenInfo) => void
}

export function PersonaPage(props: PersonaPageProps) {
    const { onNext, onChange } = props
    const [visible, setVisible] = useState(true)
    const currentIdentity = context.lastRecognizedProfile.getCurrentValue()
    const { classes } = useStyles()
    const { loading, value: persona } = usePersonas()
    const nextIDConnectStatus = useNextIDConnectStatus()
    const t = useI18N()

    useEffect(() => {
        if (!persona?.status.action) return
        const { status, action, isVerified } = nextIDConnectStatus
        if (isVerified || status === NextIDVerificationStatus.WaitingLocalConnect) return
        if (action) action()
    }, [nextIDConnectStatus, persona?.status])

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: TokenInfo) => {
            onChange(proof, persona?.wallets, tokenInfo)
            onNext()
        },
        [persona?.wallets],
    )

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
                                {t.persona_hint()}
                            </Typography>
                            <CloseIcon sx={{ cursor: 'pointer' }} onClick={() => setVisible(false)} />
                        </Box>
                    ) : null}
                    {persona?.binds?.proofs
                        .filter((proof) => proof.platform === NextIDPlatform.Twitter)
                        .map((x, i) =>
                            x.identity.toLowerCase() === currentIdentity?.identifier.userId.toLowerCase() ? (
                                <PersonaItem
                                    key={i}
                                    owner
                                    proof={x}
                                    avatar={currentIdentity.avatar}
                                    userId={currentIdentity.identifier.userId}
                                    nickname={currentIdentity.nickname}
                                    onSelect={onSelect}
                                />
                            ) : (
                                <PersonaItem
                                    key={i}
                                    owner={false}
                                    avatar=""
                                    userId={x.identity}
                                    nickname=""
                                    proof={x}
                                />
                            ),
                        )}
                </>
            )}
        </DialogContent>
    )
}
