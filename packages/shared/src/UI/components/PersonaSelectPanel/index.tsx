import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import {
    CrossIsolationMessages,
    DashboardRoutes,
    EMPTY_LIST,
    isSamePersona,
    isSameProfile,
    resolveNextIDIdentityToProfile,
    type PersonaIdentifier,
    type ProfileIdentifier,
} from '@masknet/shared-base'
import { LoadingBase, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { Button, Stack, Typography } from '@mui/material'
import { memo, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAsyncFn, useCopyToClipboard } from 'react-use'
import { ApplicationBoardModal, LeavePageConfirmModal, useSharedI18N } from '../../../index.js'
import { ErrorPanel } from './ErrorPanel.js'
import type { PersonaNextIDMixture } from './PersonaItemUI.js'
import { PersonaItemUI } from './PersonaItemUI.js'
import { useLastRecognizedIdentity, useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useConnectedPersonas } from '../../../hooks/useConnectedPersonas.js'
import { useCurrentPersona } from '../../../hooks/useCurrentPersona.js'
import { useNextIDVerify } from '../../../hooks/useNextIDVerify.js'

const useStyles = makeStyles()((theme) => {
    return {
        items: {
            overflow: 'auto',
            maxHeight: 225,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        button: {
            display: 'inline-flex',
            gap: theme.spacing(1),
            borderRadius: 20,
            width: '100%',
        },
    }
})

export type PositionOption = 'center' | 'top-right'

interface PersonaSelectPanelProps extends withClasses<'checked' | 'unchecked' | 'button'> {
    finishTarget?: string
    enableVerify?: boolean
    onClose?: () => void
}

export const PersonaSelectPanel = memo<PersonaSelectPanelProps>((props) => {
    const { finishTarget, enableVerify = true, onClose } = props

    const t = useSharedI18N()

    const [, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    const currentPersonaIdentifier = useCurrentPersona()

    const { classes } = useStyles(undefined, { props })

    const [selectedPersona, setSelectedPersona] = useState<PersonaNextIDMixture>()

    const [, handleVerifyNextID] = useNextIDVerify()
    const currentProfileIdentify = useLastRecognizedIdentity()
    const { value: personas = EMPTY_LIST, loading, error, retry } = useConnectedPersonas()
    const { openDashboard, attachProfile, setCurrentPersonaIdentifier } = useSNSAdaptorContext()

    useEffect(() => {
        if (!currentPersonaIdentifier) {
            setSelectedPersona(personas[0])
            return
        }

        const persona = personas.find((x) => isSamePersona(x.persona, currentPersonaIdentifier))
        setSelectedPersona(persona ?? personas[0])
    }, [currentPersonaIdentifier?.toText(), personas.length])

    const [, connect] = useAsyncFn(
        async (profileIdentifier?: ProfileIdentifier, personaIdentifier?: PersonaIdentifier) => {
            if (!profileIdentifier || !personaIdentifier) return
            await attachProfile?.(profileIdentifier, personaIdentifier, {
                connectionConfirmState: 'confirmed',
            })
            await setCurrentPersonaIdentifier?.(personaIdentifier)
        },
        [attachProfile, setCurrentPersonaIdentifier],
    )

    useLayoutEffect(() => {
        if (personas.length || loading || error) return

        onClose?.()
        LeavePageConfirmModal.open({
            openDashboard,
            info: {
                target: 'dashboard',
                url: DashboardRoutes.Setup,
                text: t.applications_create_persona_hint(),
                title: t.applications_create_persona_title(),
                actionHint: t.applications_create_persona_action(),
            },
        })
    }, [!personas.length, loading, !error, openDashboard])

    const actionButton = useMemo(() => {
        let isConnected = true
        let isVerified = true

        if (!currentProfileIdentify || !selectedPersona) return null

        // Selected Persona not link current SNS
        if (!selectedPersona.persona.linkedProfiles.find((x) => isSameProfile(x, currentProfileIdentify.identifier))) {
            isConnected = false
        }

        if (!isSamePersona(selectedPersona.persona, currentPersonaIdentifier)) isConnected = false

        const verifiedSns = selectedPersona.proof.find(
            (x) =>
                isSameProfile(
                    resolveNextIDIdentityToProfile(x.identity, x.platform),
                    currentProfileIdentify.identifier,
                ) && x.is_valid,
        )
        if (!verifiedSns) {
            isVerified = false
        }

        const handleClick = async () => {
            if (!isConnected) {
                await connect?.(currentProfileIdentify.identifier, selectedPersona.persona.identifier)
            }
            if (!isVerified && enableVerify) {
                onClose?.()
                ApplicationBoardModal.close()
                if (finishTarget) {
                    CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
                        open: false,
                        pluginID: finishTarget,
                    })
                }
                await handleVerifyNextID(selectedPersona.persona, currentProfileIdentify.identifier?.userId)
            }

            if (isVerified) CrossIsolationMessages.events.personaBindFinished.sendToAll({ pluginID: finishTarget })

            if (finishTarget) {
                CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
                    open: true,
                    pluginID: finishTarget,
                    selectedPersona: selectedPersona.persona,
                })
            }

            await delay(100)
            onClose?.()
        }

        const actionProps = {
            ...(() => {
                const { persona } = selectedPersona
                if (!isConnected && !isVerified && enableVerify)
                    return {
                        buttonText: t.applications_persona_verify_connect({
                            nickname: persona.nickname ?? '',
                        }),
                        hint: t.applications_persona_verify_connect_hint({
                            nickname: persona.nickname ?? '',
                        }),
                    }
                if (!isConnected)
                    return {
                        buttonText: t.applications_persona_connect({
                            nickname: persona.nickname ?? '',
                        }),
                        hint: t.applications_persona_connect_hint({
                            nickname: persona.nickname ?? '',
                        }),
                    }
                if (!isVerified)
                    return {
                        buttonText: t.applications_persona_verify({
                            nickname: persona.nickname ?? '',
                        }),
                        hint: t.applications_persona_verify_hint(),
                    }
                return {
                    buttonText: t.applications_persona_connect({
                        nickname: persona.nickname ?? '',
                    }),
                }
            })(),
            onClick: handleClick,
        }

        return <ActionContent {...actionProps} classes={{ button: props.classes?.button }} />
    }, [
        currentPersonaIdentifier,
        currentProfileIdentify,
        enableVerify,
        finishTarget,
        selectedPersona?.persona,
        selectedPersona?.proof,
        selectedPersona?.persona.linkedProfiles,
    ])

    const onCopyPersonsPublicKey = (e: React.MouseEvent<HTMLElement>, p: PersonaNextIDMixture) => {
        e.preventDefault()
        e.stopPropagation()
        copyToClipboard(p.persona.identifier.rawPublicKey)
        showSnackbar(t.applications_persona_copy(), { variant: 'success' })
    }
    if (loading) {
        return (
            <Stack justifyContent="center" alignItems="center" height="100%">
                <LoadingBase size={24} />
            </Stack>
        )
    }

    if (error) {
        return <ErrorPanel onRetry={retry} />
    }

    if (!personas.length) {
        return <Stack height="100%" justifyContent="space-between" />
    }

    return (
        <Stack height="100%" justifyContent="space-between">
            <Stack gap={1.5} className={classes.items}>
                {personas.map((x) => {
                    return (
                        <PersonaItemUI
                            key={x.persona.identifier.toText()}
                            data={x}
                            onCopy={(e) => onCopyPersonsPublicKey(e, x)}
                            onClick={() => setSelectedPersona(x)}
                            currentPersona={selectedPersona}
                            currentPersonaIdentifier={currentPersonaIdentifier}
                            currentProfileIdentify={currentProfileIdentify}
                            classes={{ unchecked: props.classes?.unchecked }}
                        />
                    )
                })}
            </Stack>
            <Stack>{actionButton}</Stack>
        </Stack>
    )
})

interface ActionContentProps extends withClasses<'button'> {
    buttonText?: string
    hint?: string
    onClick(): Promise<void>
}

function ActionContent(props: ActionContentProps) {
    const { buttonText, hint, onClick } = props
    const { classes } = useStyles(undefined, { props })
    if (!buttonText) return null
    return (
        <Stack gap={1.5} mt={1.5}>
            {hint ? (
                <Typography color={(t) => t.palette.maskColor.main} fontSize={14} lineHeight="18px" height={36}>
                    {hint}
                </Typography>
            ) : null}
            <Stack direction="row" justifyContent="center">
                <Button color="primary" className={classes.button} onClick={onClick}>
                    <Icons.Identity size={18} />
                    {buttonText}
                </Button>
            </Stack>
        </Stack>
    )
}
