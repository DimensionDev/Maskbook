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

const useStyles = makeStyles()((theme) => ({
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 8,
        backgroundColor: '#F9F9F9',
        fontSize: 14,
        alignItems: 'center',
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
    const currentIdentity = context.lastRecognizedProfile.getCurrentValue()
    const { classes } = useStyles()
    const { loading, value: persona } = usePersonas()
    const nextIDConnectStatus = useNextIDConnectStatus()
    const t = useI18N()

    console.log(nextIDConnectStatus)
    useEffect(() => {
        const { status, reset, isVerified } = nextIDConnectStatus
        if (isVerified || status === NextIDVerificationStatus.WaitingLocalConnect) return
        reset()
        onClose()
    }, [nextIDConnectStatus, persona?.status, onClose])

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: TokenInfo) => {
            onChange(proof, persona?.wallets, tokenInfo)
            onNext()
        },
        [persona?.wallets],
    )

    return (
        <DialogContent sx={{ height: 612, padding: 2 }}>
            {loading ? (
                <Stack justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Stack>
            ) : (
                <>
                    {visible ? (
                        <Box className={classes.messageBox}>
                            <Typography color="#07101B" variant="body1" fontSize={14}>
                                {t.persona_hint()}
                            </Typography>
                            <CloseIcon
                                sx={{ cursor: 'pointer', stroke: '#07101B' }}
                                onClick={() => setVisible(false)}
                            />
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
                                    userId={currentIdentity.identifier.userId}
                                    onSelect={onSelect}
                                />
                            ) : (
                                <PersonaItem key={i} owner={false} userId={x.identity} proof={x} />
                            ),
                        )}
                </>
            )}
        </DialogContent>
    )
}
