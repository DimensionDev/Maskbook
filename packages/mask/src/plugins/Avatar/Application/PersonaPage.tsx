import { BindingProof, EMPTY_LIST, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { CloseIcon } from '../assets/close.js'
import { context } from '../context.js'
import { useI18N } from '../locales/index.js'
import { PersonaItem } from './PersonaItem.js'
import { InfoIcon } from '../assets/info.js'
import { usePersonasFromDB } from '../../../components/DataSource/usePersonasFromDB.js'
import type { AllChainsNonFungibleToken } from '../types.js'
import { PersonaAction } from '@masknet/shared'
import { useAsyncRetry } from 'react-use'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useLastRecognizedSocialIdentity } from '../../../components/DataSource/useActivatedUI.js'

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
    const { classes } = useStyles()
    const { loading, value: socialIdentity } = useLastRecognizedSocialIdentity()

    const myPersonas = usePersonasFromDB()
    const _persona = useSubscription(context.currentPersona)

    const currentPersona = myPersonas?.find(
        (x: PersonaInformation) => x.identifier.rawPublicKey.toLowerCase() === _persona?.rawPublicKey.toLowerCase(),
    )

    const t = useI18N()

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => {
            onChange(
                proof,
                socialIdentity?.binding?.proofs.filter(
                    (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
                ) ?? EMPTY_LIST,
                tokenInfo,
            )
            onNext()
        },
        [socialIdentity?.binding],
    )
    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    return (
        <>
            <DialogContent sx={{ flex: 1, height: 450, padding: 2 }}>
                {loading ? (
                    <Stack justifyContent="center" alignItems="center">
                        <LoadingBase />
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
                        {socialIdentity?.binding?.proofs
                            .filter(
                                (proof) => proof.platform === socialIdentity.identifier?.network.replace('.com', ''),
                            )
                            .filter((x) => x.identity.toLowerCase() === socialIdentity.identifier?.userId.toLowerCase())
                            .map((x, i) => (
                                <PersonaItem
                                    persona={socialIdentity.binding?.persona}
                                    key={`avatar${i}`}
                                    avatar={socialIdentity?.avatar ?? ''}
                                    owner
                                    nickname={socialIdentity?.nickname}
                                    proof={x}
                                    userId={socialIdentity?.identifier?.userId ?? x.identity}
                                    onSelect={onSelect}
                                />
                            ))}

                        {myPersonas?.[0] &&
                            myPersonas[0].linkedProfiles
                                .filter(
                                    (x) =>
                                        x.identifier.network ===
                                        socialIdentity?.identifier?.network.replace('.com', ''),
                                )
                                .map((x, i) =>
                                    socialIdentity?.binding?.proofs.some(
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
                        {socialIdentity?.binding?.proofs
                            .filter(
                                (proof) => proof.platform === socialIdentity?.identifier?.network.replace('.com', ''),
                            )
                            .filter(
                                (x) => x.identity.toLowerCase() !== socialIdentity?.identifier?.userId.toLowerCase(),
                            )
                            .map((x, i) => (
                                <PersonaItem
                                    persona={socialIdentity.binding?.persona}
                                    avatar=""
                                    key={i}
                                    owner={false}
                                    userId={x.identity}
                                    proof={x}
                                />
                            ))}
                    </>
                )}
            </DialogContent>
            <DialogActions style={{ padding: 0, margin: 0 }}>
                <PersonaAction
                    avatar={avatar === null ? undefined : avatar}
                    currentPersona={currentPersona}
                    currentVisitingProfile={socialIdentity}
                />
            </DialogActions>
        </>
    )
}
