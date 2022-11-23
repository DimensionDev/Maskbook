import { BindingProof, EMPTY_LIST, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useSubscription } from 'use-subscription'
import { context } from '../context.js'
import { useI18N } from '../locales/index.js'
import { PersonaItem } from './PersonaItem.js'
import { usePersonasFromDB } from '../../../components/DataSource/usePersonasFromDB.js'
import type { AllChainsNonFungibleToken } from '../types.js'
import { PersonaAction } from '@masknet/shared'
import { useAsyncRetry } from 'react-use'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useLastRecognizedSocialIdentity } from '../../../components/DataSource/useActivatedUI.js'
import { Icons } from '@masknet/icons'
import { usePersonasFromNextID } from '../../../components/DataSource/usePersonasFromNextID.js'

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

export function PersonaPage({ onNext, onChange }: PersonaPageProps) {
    const t = useI18N()
    const [visible, setVisible] = useState(true)
    const { classes } = useStyles()
    const { loading, value: socialIdentity } = useLastRecognizedSocialIdentity()
    const network = socialIdentity?.identifier?.network.replace('.com', '')
    const userId = socialIdentity?.identifier?.userId

    const { value: bindingPersonas = EMPTY_LIST } = usePersonasFromNextID(
        socialIdentity?.publicKey,
        NextIDPlatform.NextID,
    )
    const bindingProofs = useMemo(
        () => bindingPersonas.map((x) => x.proofs.filter((y) => y.is_valid && y.platform === network)).flat(),
        [bindingPersonas],
    )

    const myPersonas = usePersonasFromDB()
    const _persona = useSubscription(context.currentPersona)

    const currentPersona = myPersonas?.find(
        (x: PersonaInformation) => x.identifier.rawPublicKey.toLowerCase() === _persona?.rawPublicKey.toLowerCase(),
    )

    const onSelect = useCallback(
        (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => {
            onChange(
                proof,
                bindingProofs.filter((x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity)),
                tokenInfo,
            )
            onNext()
        },
        [onNext, bindingProofs],
    )
    const { value: avatar } = useAsyncRetry(async () => context.getPersonaAvatar(currentPersona?.identifier), [])

    return (
        <>
            <DialogContent sx={{ flex: 1, height: 464, padding: 2 }}>
                {loading ? (
                    <Stack justifyContent="center" alignItems="center" height="100%">
                        <LoadingBase />
                    </Stack>
                ) : (
                    <>
                        {visible ? (
                            <Box className={classes.messageBox}>
                                <Icons.Info size={20} />
                                <Typography color="currentColor" fontSize={14} fontFamily="Helvetica">
                                    {t.persona_hint()}
                                </Typography>
                                <Icons.Close size={20} onClick={() => setVisible(true)} />
                            </Box>
                        ) : null}
                        {bindingProofs
                            .filter(
                                (x) => x.identity.toLowerCase() === socialIdentity!.identifier?.userId.toLowerCase(),
                            )
                            .map((x, i) => (
                                <PersonaItem
                                    persona={socialIdentity!.binding?.persona}
                                    key={`avatar${i}`}
                                    avatar={socialIdentity!.avatar ?? ''}
                                    owner
                                    nickname={socialIdentity!.nickname}
                                    proof={x}
                                    userId={userId ?? x.identity}
                                    onSelect={onSelect}
                                />
                            ))}

                        {myPersonas?.[0].linkedProfiles
                            .filter((x) => x.identifier.network === network)
                            .map((x, i) =>
                                socialIdentity?.binding?.proofs.some(
                                    (y) => y.identity.toLowerCase() === x.identifier.userId.toLowerCase(),
                                ) ? null : (
                                    <PersonaItem avatar="" key={`persona${i}`} userId={x.identifier.userId} />
                                ),
                            )}
                        {bindingProofs
                            .filter((x) => x.identity.toLowerCase() !== userId?.toLowerCase())
                            .map((x, i) => (
                                <PersonaItem
                                    persona={socialIdentity!.binding?.persona}
                                    avatar=""
                                    key={i}
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
