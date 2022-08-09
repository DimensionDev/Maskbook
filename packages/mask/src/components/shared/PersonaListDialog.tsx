import { Button, DialogContent, Stack, Typography } from '@mui/material'
import {
    EMPTY_LIST,
    isSamePersona,
    isSameProfile,
    NextIDPlatform,
    PersonaIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { useAsyncFn, useCopyToClipboard } from 'react-use'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useConnectedPersonas } from '../DataSource/useConnectedPersonas'
import Services from '../../extension/service'
import { InjectedDialog } from '@masknet/shared'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNextIDVerify } from '../DataSource/useNextIDVerify'
import { useI18N } from '../../utils'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../../social-network'
import { PluginNextIDMessages } from '../../plugins/NextID/messages'
import type { PersonaNextIDMixture } from './PersonaListUI/PersonaItemUI'
import { PersonaItemUI } from './PersonaListUI/PersonaItemUI'
import { useCurrentPersona } from '../DataSource/usePersonaConnectStatus'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: 384,
            height: 386,
            padding: theme.spacing(1),
            background: theme.palette.maskColor.bottom,
        },
        content: {
            padding: theme.spacing(0, 2, 2, 2),
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: {
            background: theme.palette.maskColor.bottom,
        },
    }
})

interface PersonaListProps {
    open: boolean
    onClose(): void
}

export const PersonaListDialog = ({ open, onClose }: PersonaListProps) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()
    const currentPlatform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform | undefined
    const currentPersona = useCurrentPersona()
    const currentPersonaIdentifier = currentPersona?.identifier

    const [selectedPersona, setSelectedPersona] = useState<PersonaNextIDMixture>()

    const [, handleVerifyNextID] = useNextIDVerify()
    const currentProfileIdentify = useLastRecognizedIdentity()
    const { value: personas = EMPTY_LIST, loading } = useConnectedPersonas()

    const { closeDialog } = useRemoteControlledDialog(PluginNextIDMessages.PersonaListDialogUpdated)

    const { closeDialog: closeApplicationBoard } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    useEffect(() => {
        if (!currentPersonaIdentifier) return
        setSelectedPersona(personas.find((x) => isSamePersona(x.persona, currentPersonaIdentifier)))
    }, [currentPersonaIdentifier?.toText(), personas.length])

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

        // Selected Persona not link current SNS
        if (!selectedPersona.persona.linkedProfiles.find((x) => isSameProfile(x, currentProfileIdentify.identifier))) {
            isConnected = false
        }

        if (!isSamePersona(selectedPersona.persona, currentPersonaIdentifier)) isConnected = false

        const verifiedSns = selectedPersona.proof.find(
            (x) =>
                x.identity.toLowerCase() === currentProfileIdentify.identifier?.userId.toLowerCase() &&
                x.platform === currentPlatform,
        )
        if (!verifiedSns) {
            isVerified = false
        }

        const handleClick = async () => {
            if (!isConnected) {
                await connect?.(currentProfileIdentify.identifier, selectedPersona.persona.identifier)
            }
            if (!isVerified) {
                closeDialog()
                closeApplicationBoard()
                await handleVerifyNextID(selectedPersona.persona, currentProfileIdentify.identifier?.userId)
            }

            closeDialog()
        }

        const actionProps = {
            ...(() => {
                if (!isConnected && !isVerified)
                    return {
                        buttonText: t('applications_persona_verify_connect', {
                            nickname: selectedPersona?.persona.nickname,
                        }),
                        hint: t('applications_persona_verify_connect_hint', {
                            nickname: selectedPersona?.persona.nickname,
                        }),
                    }
                if (!isConnected)
                    return {
                        buttonText: t('applications_persona_connect', {
                            nickname: selectedPersona?.persona.nickname,
                        }),
                        hint: t('applications_persona_connect_hint', {
                            nickname: selectedPersona?.persona.nickname,
                        }),
                    }
                if (!isVerified)
                    return {
                        buttonText: t('applications_persona_verify', {
                            nickname: selectedPersona?.persona.nickname,
                        }),
                        hint: t('applications_persona_verify_hint', {
                            nickname: selectedPersona?.persona.nickname,
                        }),
                    }
                return {}
            })(),
            onClick: handleClick,
        }

        return <ActionContent {...actionProps} />
    }, [currentPersonaIdentifier, currentProfileIdentify, selectedPersona, personas])

    const onSelectPersona = useCallback((x: PersonaNextIDMixture) => {
        setSelectedPersona(x)
    }, [])

    const onCopyPersons = (e: React.MouseEvent<HTMLElement>, p: PersonaNextIDMixture) => {
        e.preventDefault()
        e.stopPropagation()
        copyToClipboard(p.persona.identifier.rawPublicKey)
        showSnackbar(t('applications_persona_copy'), { variant: 'success' })
    }

    return open ? (
        <InjectedDialog
            disableTitleBorder
            open={open}
            classes={{
                paper: classes.root,
                dialogTitle: classes.header,
            }}
            maxWidth="sm"
            onClose={onClose}
            title={t('applications_persona_title')}
            titleBarIconStyle="close">
            <DialogContent classes={{ root: classes.content }}>
                <Stack gap={1.5}>
                    {personas.map((x) => {
                        return (
                            <PersonaItemUI
                                key={x.persona.identifier.toText()}
                                data={x}
                                onCopy={(e) => onCopyPersons(e, x)}
                                onClick={() => onSelectPersona(x)}
                                currentPersona={selectedPersona}
                                currentPersonaIdentifier={currentPersonaIdentifier}
                                currentProfileIdentify={currentProfileIdentify}
                            />
                        )
                    })}
                </Stack>
                <Stack>{actionButton}</Stack>
            </DialogContent>
        </InjectedDialog>
    ) : null
}

interface ActionContentProps {
    buttonText?: string
    hint?: string
    onClick(): Promise<void>
}

function ActionContent({ buttonText, hint, onClick }: ActionContentProps) {
    if (!buttonText || !hint) return null
    return (
        <Stack gap={3} mt={1.5}>
            <Typography color={(t) => t.palette.maskColor.main} fontSize={14} lineHeight="18px">
                {hint}
            </Typography>
            <Button color="primary" style={{ borderRadius: 20 }} onClick={onClick}>
                {buttonText}
            </Button>
        </Stack>
    )
}
