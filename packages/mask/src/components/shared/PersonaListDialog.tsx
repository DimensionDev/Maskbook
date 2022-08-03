import { Icons } from '@masknet/icons'
import { Box, Button, DialogContent, Stack, Typography } from '@mui/material'
import {
    BindingProof,
    EMPTY_LIST,
    formatPersonaFingerprint,
    PersonaIdentifier,
    PersonaInformation,
    ProfileIdentifier,
} from '@masknet/shared-base'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import { useAsync, useAsyncFn } from 'react-use'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
// TODO: move to share
import { useConnectedPersonas } from '../../plugins/NextID/hooks/useConnectedPersonas'
import Services from '../../extension/service'
import { InjectedDialog } from '@masknet/shared'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNextIDVerify } from '../../plugins/NextID/hooks/useNextIDVerify'
import { useI18N } from '../../utils'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'

interface PersonaListProps {
    open: boolean
    onClose(): void
}

interface PersonaNextIDMixture {
    persona: PersonaInformation
    proof: BindingProof[]
}

function isSamePersona(p1?: PersonaIdentifier | PersonaInformation, p2?: PersonaIdentifier | PersonaInformation) {
    if (!p1 || !p2) return false
    const p1Identifier = 'toText' in p1 ? p1 : p1.identifier
    const p2Identifier = 'toText' in p2 ? p2 : p2.identifier
    return p1Identifier.toText() === p2Identifier.toText()
}

export const PersonaListDialog = ({ open, onClose }: PersonaListProps) => {
    const { t } = useI18N()
    const [selectedPersona, setSelectedPersona] = useState<PersonaNextIDMixture>()

    const [, handleVerifyNextID] = useNextIDVerify()
    const currentProfileIdentify = useCurrentIdentity()
    const { value: personas = EMPTY_LIST, loading } = useConnectedPersonas()

    const { closeDialog } = useRemoteControlledDialog(WalletMessages.events.ApplicationPersonaListDialogUpdated)

    const { closeDialog: closeApplicationBoard } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    const { value: currentPersonaIdentifier } = useAsync(() => {
        return Services.Settings.getCurrentPersonaIdentifier()
    }, [])

    useEffect(() => {
        if (!currentPersonaIdentifier) return
        setSelectedPersona(personas.find((x) => isSamePersona(x.persona, currentPersonaIdentifier)))
    }, [currentPersonaIdentifier, personas.length])

    const [, connect] = useAsyncFn(
        async (profileIdentifier?: ProfileIdentifier, personaIdentifier?: PersonaIdentifier) => {
            if (!profileIdentifier || !personaIdentifier) return
            await Services.Identity.attachProfile(profileIdentifier, personaIdentifier, {
                connectionConfirmState: 'confirmed',
            })
            await Services.Settings.setCurrentPersonaIdentifier(personaIdentifier)
        },
        [],
    )

    const actionButton = useMemo(() => {
        let isConnected = true
        let isVerified = true

        if (!currentProfileIdentify || !selectedPersona) return null
        const currentPersonaWithNextID = personas.find((x) => isSamePersona(x.persona, selectedPersona.persona))

        if (!currentPersonaWithNextID) return null
        if (!currentPersonaWithNextID.proof.length) {
            isVerified = false
        }

        if (!isSamePersona(selectedPersona.persona, currentPersonaIdentifier)) isConnected = false
        // TODO: also need platform
        const verifiedSns = selectedPersona.proof.find(
            (x) => x.identity.toLowerCase() === currentProfileIdentify?.identifier.userId.toLowerCase(),
        )
        if (!verifiedSns) {
            isVerified = false
        }

        const handleClick = async () => {
            if (!isConnected) {
                await connect?.(currentProfileIdentify.identifier, selectedPersona.persona.identifier)
            }
            if (!isVerified) {
                handleVerifyNextID(selectedPersona.persona, currentProfileIdentify?.identifier.userId)
                closeDialog()
                closeApplicationBoard()
            }

            closeDialog()
        }

        return (
            <Button color="primary" onClick={handleClick}>
                {(() => {
                    if (!isConnected && !isVerified)
                        return t('applications_persona_verify_connect', { nickname: selectedPersona?.persona.nickname })
                    if (!isConnected)
                        return t('applications_persona_connect', { nickname: selectedPersona?.persona.nickname })
                    if (!isVerified)
                        return t('applications_persona_verify', { nickname: selectedPersona?.persona.nickname })
                    return ''
                })()}
            </Button>
        )
    }, [currentPersonaIdentifier, currentProfileIdentify, selectedPersona, personas])

    const onSelectPersona = useCallback((x: PersonaNextIDMixture) => {
        setSelectedPersona(x)
    }, [])

    return open ? (
        <InjectedDialog disableTitleBorder open={open} maxWidth="sm" onClose={onClose} title="test">
            <DialogContent>
                <Stack>
                    {personas.map((x) => {
                        return (
                            <Stack
                                key={x.persona.identifier.toText()}
                                direction="row"
                                onClick={() => onSelectPersona(x)}>
                                <Box flexGrow={0}>
                                    <Icons.MenuPersonasActive size={30} />
                                </Box>
                                <Stack flexGrow={1}>
                                    <Typography>{x.persona.nickname}</Typography>
                                    <Typography>
                                        {formatPersonaFingerprint(x.persona.identifier.rawPublicKey, 4)}
                                    </Typography>
                                </Stack>
                                <Stack flexGrow={0}>
                                    {isSamePersona(selectedPersona?.persona, x.persona) ? (
                                        <Icons.CheckCircle />
                                    ) : (
                                        <RadioButtonUncheckedIcon />
                                    )}
                                </Stack>
                            </Stack>
                        )
                    })}
                </Stack>
                <Stack>{actionButton}</Stack>
            </DialogContent>
        </InjectedDialog>
    ) : null
}
