import { BindingProof, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, CircularProgress, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { CloseIcon } from '../assets/close'
import { context } from '../context'
import { useI18N } from '../locales'
import { PersonaItem } from './PersonaItem'
import { InfoIcon } from '../assets/info'
import { usePersonasFromDB } from '../../../components/DataSource/usePersonasFromDB'
import type { AllChainsNonFungibleToken } from '../types'
import { PersonaAction } from '@masknet/shared'
import { useAsyncRetry } from 'react-use'
import { useNextIDPersonaAndWalletsByUserId } from '../hooks/useNextIDPersonaAndWalletsByUserId'

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
    const { loading, value: persona } = useNextIDPersonaAndWalletsByUserId()

    const myPersonas = usePersonasFromDB()
    const _persona = useSubscription(context.currentPersona)

    const currentPersona = myPersonas?.find(
        (x: PersonaInformation) => x.identifier.rawPublicKey.toLowerCase() === _persona?.rawPublicKey.toLowerCase(),
    )

    const t = useI18N()

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => {
            onChange(proof, persona?.wallets, tokenInfo)
            onNext()
        },
        [persona?.wallets],
    )
    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    return (
        <>
            <DialogContent sx={{ flex: 1, height: 450, padding: 2 }}>
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
                            .filter(
                                (x) => x.identity.toLowerCase() === currentIdentity?.identifier?.userId.toLowerCase(),
                            )
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
                                    persona?.binds?.proofs.some(
                                        (y) => y.identity.toLowerCase() === x.identifier.userId.toLowerCase(),
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
                            .filter((proof) => proof.platform === currentIdentity?.identifier?.network)
                            .filter(
                                (x) => x.identity.toLowerCase() !== currentIdentity?.identifier?.userId.toLowerCase(),
                            )
                            .map((x, i) => (
                                <PersonaItem avatar="" key={i} owner={false} userId={x.identity} proof={x} />
                            ))}
                    </>
                )}
            </DialogContent>
            <DialogActions style={{ padding: 0, margin: 0 }}>
                <PersonaAction
                    avatar={avatar === null ? undefined : avatar}
                    currentPersona={currentPersona}
                    currentVisitingProfile={currentIdentity}
                />
            </DialogActions>
        </>
    )
}
