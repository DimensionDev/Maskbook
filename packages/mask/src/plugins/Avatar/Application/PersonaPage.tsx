import { BindingProof, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { CloseIcon } from '../assets/close'
import { context } from '../context'
import { usePersonas } from '../hooks/usePersonas'
import { useI18N } from '../locales/i18n_generated'
import { PersonaItem } from './PersonaItem'
import { InfoIcon } from '../assets/info'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import type { AllChainsNonFungibleToken } from '../types'

const useStyles = makeStyles()((theme) => ({
    messageBox: {
        display: 'flex',
        borderRadius: 4,
        padding: 12,
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F9F9F9',
        fontSize: 14,
        alignItems: 'center',
        color: theme.palette.text.primary,
        gap: 10,
    },
}))

interface PersonaPageProps {
    onNext: () => void
    onClose(): void
    onChange: (proof: BindingProof, wallets?: BindingProof[], tokenInfo?: AllChainsNonFungibleToken) => void
}

export function PersonaPage(props: PersonaPageProps) {
    const { onNext, onChange, onClose } = props
    const [visible, setVisible] = useState(true)
    const currentIdentity = useSubscription(context.lastRecognizedProfile)
    const { classes } = useStyles()
    const { loading, value: persona } = usePersonas()
    const myPersonas = useMyPersonas()
    const t = useI18N()

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => {
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
                            <InfoIcon style={{ width: 20, height: 20 }} />
                            <Typography color="currentColor" fontSize={14} fontFamily="Helvetica">
                                {t.persona_hint()}
                            </Typography>
                            <CloseIcon
                                sx={{ cursor: 'pointer', width: 20, height: 20 }}
                                onClick={() => setVisible(false)}
                            />
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
                                userId={currentIdentity?.identifier?.userId ?? x.identity}
                                onSelect={onSelect}
                            />
                        ))}

                    {myPersonas?.[0] &&
                        myPersonas[0].linkedProfiles
                            .filter((x) => x.identifier.network === currentIdentity?.identifier?.network)
                            .map((x, i) =>
                                persona?.binds.proofs.some(
                                    (y) => y.identity === x.identifier.userId.toLowerCase(),
                                ) ? null : (
                                    <PersonaItem
                                        avatar=""
                                        key={`persona${i}`}
                                        owner={false}
                                        userId={x.identifier.userId}
                                    />
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
