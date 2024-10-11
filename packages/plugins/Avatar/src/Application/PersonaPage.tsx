import { uniqBy } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from 'use-subscription'
import { type BindingProof, EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { LoadingBase } from '@masknet/theme'
import { DialogActions, DialogContent, Stack } from '@mui/material'
import { Alert, PersonaAction, usePersonasFromNextID } from '@masknet/shared'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { useAllPersonas, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { currentPersona, queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { useAvatarTrans } from '../locales/index.js'
import { PersonaItem } from './PersonaItem.js'
import type { AllChainsNonFungibleToken } from '../types.js'
import { RoutePaths } from './Routes.js'
import { useAvatarManagement } from '../contexts/AvatarManagement.js'

export function PersonaPage() {
    const t = useAvatarTrans()
    const navigate = useNavigate()
    const [visible, setVisible] = useState(true)
    const { setProofs, setTokenInfo, setProof, isPending, binding } = useAvatarManagement()

    const socialIdentity = useLastRecognizedIdentity()

    const network = socialIdentity?.identifier?.network.replace('.com', '')
    const userId = socialIdentity?.identifier?.userId

    const myPersonas = useAllPersonas()
    const currentPersonaIdentifier = useSubscription(currentPersona)
    const currentPersonaInfo = myPersonas?.find(
        (x) => x.identifier.rawPublicKey.toLowerCase() === currentPersonaIdentifier?.rawPublicKey.toLowerCase(),
    )

    const { data: bindingPersonas = EMPTY_LIST } = usePersonasFromNextID(
        currentPersonaIdentifier?.publicKeyAsHex ?? '',
        NextIDPlatform.NextID,
        false,
    )

    const bindingProofs = useMemo(
        () =>
            uniqBy(
                bindingPersonas.flatMap((x) => x.proofs.filter((y) => y.is_valid && y.platform === network)),
                'identity',
            ),
        [bindingPersonas, network],
    )
    const handleSelect = useCallback(
        (proof: BindingProof, tokenInfo?: AllChainsNonFungibleToken) => {
            const proofs = binding?.proofs.filter(
                (x) => x.platform === NextIDPlatform.Ethereum && isValidAddress(x.identity),
            )
            setProofs(proofs ?? EMPTY_LIST)
            setTokenInfo(tokenInfo)
            setProof(proof)
            navigate(RoutePaths.NFTPicker)
        },
        [navigate],
    )
    const { value: avatar } = useAsyncRetry(
        async () => queryPersonaAvatar(currentPersonaIdentifier),
        [currentPersonaIdentifier],
    )

    return (
        <>
            <DialogContent sx={{ height: 464, padding: 2 }}>
                {isPending ?
                    <Stack justifyContent="center" alignItems="center" height="100%">
                        <LoadingBase />
                    </Stack>
                :   <>
                        <Alert open={visible} onClose={() => setVisible(false)}>
                            {t.persona_hint()}
                        </Alert>
                        {bindingProofs
                            .filter((x) => x.identity.toLowerCase() === userId?.toLowerCase())
                            .map((x, i) => (
                                <PersonaItem
                                    persona={binding?.persona}
                                    key={`avatar${i}`}
                                    isOwner
                                    avatarUrl={socialIdentity?.avatar}
                                    nickname={socialIdentity?.nickname}
                                    proof={x}
                                    userId={userId ?? x.identity}
                                    onSelect={handleSelect}
                                />
                            ))}

                        {myPersonas[0].linkedProfiles
                            .filter((x) => x.identifier.network === network)
                            .map((x, i) =>
                                (
                                    binding?.proofs.some(
                                        (y) => y.identity.toLowerCase() === x.identifier.userId.toLowerCase(),
                                    )
                                ) ?
                                    null
                                :   <PersonaItem key={`persona${i}`} userId={x.identifier.userId} />,
                            )}
                        {bindingProofs
                            .filter((x) => x.identity.toLowerCase() !== userId?.toLowerCase())
                            .map((x, i) => (
                                <PersonaItem key={i} persona={binding?.persona} userId={x.identity} proof={x} />
                            ))}
                    </>
                }
            </DialogContent>
            <DialogActions style={{ padding: 0, margin: 0 }}>
                <PersonaAction
                    avatar={avatar === null ? undefined : avatar}
                    currentPersona={currentPersonaInfo}
                    currentVisitingProfile={socialIdentity}
                />
            </DialogActions>
        </>
    )
}
