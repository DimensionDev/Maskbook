import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { attachProfile, openDashboard, setCurrentPersonaIdentifier } from '@masknet/plugin-infra/dom/context'
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
import { makeStyles } from '@masknet/theme'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { Button, Stack, Typography } from '@mui/material'
import { memo, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useAsyncFn } from 'react-use'
import { useConnectedPersonas } from '../../../hooks/useConnectedPersonas.js'
import { useCurrentPersona } from '../../../hooks/useCurrentPersona.js'
import { useNextIDVerify } from '../../../hooks/useNextIDVerify.js'
import { ReloadStatus } from '../ReloadStatus/index.js'
import { LoadingStatus } from '../LoadingStatus/index.js'
import type { PersonaNextIDMixture } from './PersonaItemUI.js'
import { PersonaItemUI } from './PersonaItemUI.js'
import { ApplicationBoardModal, LeavePageConfirmModal } from '../../modals/index.js'
import { useRenderPhraseCallbackOnDepsChange } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

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
        reloadStatus: {
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

export const PersonaSelectPanel = memo<PersonaSelectPanelProps>(function PersonaSelectPanel(props) {
    const { finishTarget, enableVerify = true, onClose } = props

    const currentPersonaIdentifier = useCurrentPersona()

    const { classes } = useStyles(undefined, { props })

    const [selectedPersona, setSelectedPersona] = useState<PersonaNextIDMixture>()

    const handleVerifyNextID = useNextIDVerify()
    const currentProfileIdentify = useLastRecognizedIdentity()
    const { personas = EMPTY_LIST, isPending, error, refetch } = useConnectedPersonas()

    useRenderPhraseCallbackOnDepsChange(() => {
        if (!currentPersonaIdentifier) {
            setSelectedPersona(personas[0])
            return
        }

        const persona = personas.find((x) => isSamePersona(x.persona, currentPersonaIdentifier))
        setSelectedPersona(persona ?? personas[0])
    }, [currentPersonaIdentifier?.toText(), personas])

    const [, connect] = useAsyncFn(
        async (profileIdentifier?: ProfileIdentifier, personaIdentifier?: PersonaIdentifier) => {
            if (!profileIdentifier || !personaIdentifier) return
            await attachProfile?.(profileIdentifier, personaIdentifier, {
                connectionConfirmState: 'confirmed',
            })
            await setCurrentPersonaIdentifier?.(personaIdentifier)
        },
        [],
    )

    useLayoutEffect(() => {
        if (personas.length || isPending || error) return

        onClose?.()
        LeavePageConfirmModal.open({
            openDashboard,
            info: {
                target: 'dashboard',
                url: DashboardRoutes.SignUpPersona,
                text: <Trans>Please create a persona and verify your account to use this.</Trans>,
                title: <Trans>Persona</Trans>,
                actionHint: <Trans>Create persona</Trans>,
            },
        })
    }, [!personas.length, isPending, !error])

    const isConnected = useMemo(() => {
        if (!selectedPersona || !currentProfileIdentify) return false
        // Selected persona does not link the current site
        const linked = selectedPersona.persona.linkedProfiles.find((x) =>
            isSameProfile(x, currentProfileIdentify.identifier),
        )
        if (!linked) return false
        return isSamePersona(selectedPersona.persona, currentPersonaIdentifier)
    }, [selectedPersona, currentProfileIdentify, currentPersonaIdentifier])

    const isVerified = useMemo(() => {
        if (!currentProfileIdentify || !selectedPersona) return false

        const verifiedAtSite = selectedPersona.proof.find((x) => {
            return (
                isSameProfile(
                    resolveNextIDIdentityToProfile(x.identity, x.platform),
                    currentProfileIdentify.identifier,
                ) && x.is_valid
            )
        })
        return !!verifiedAtSite
    }, [currentProfileIdentify, selectedPersona?.proof])

    const actionButton = useMemo(() => {
        if (!currentProfileIdentify || !selectedPersona) return null

        const handleClick = async () => {
            if (!isConnected) {
                await connect(currentProfileIdentify.identifier, selectedPersona.persona.identifier)
                if (!finishTarget) Telemetry.captureEvent(EventType.Access, EventID.EntryProfileConnectTwitter)
                else Telemetry.captureEvent(EventType.Access, EventID.EntryMaskComposeConnectTwitter)
            }
            if (!isVerified && enableVerify) {
                onClose?.()
                ApplicationBoardModal.close()
                await handleVerifyNextID(selectedPersona.persona, currentProfileIdentify.identifier?.userId)
                if (!finishTarget) Telemetry.captureEvent(EventType.Access, EventID.EntryProfileConnectVerify)
                else Telemetry.captureEvent(EventType.Access, EventID.EntryMaskComposeVerifyTwitter)
            }

            if (isVerified) CrossIsolationMessages.events.personaBindFinished.sendToAll({ pluginID: finishTarget })

            if (finishTarget) {
                CrossIsolationMessages.events.applicationDialogEvent.sendToLocal({
                    open: true,
                    pluginID: finishTarget,
                    selectedPersona: selectedPersona.persona,
                    isVerified,
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
                        buttonText: <Trans>Connect and Verify {persona.nickname ?? ''}</Trans>,
                        hint: (
                            <Trans>
                                Please connect {persona.nickname ?? ''} and send a proof post before using dApps.
                            </Trans>
                        ),
                    }
                if (!isConnected)
                    return {
                        buttonText: <Trans>Connect {persona.nickname ?? ''}</Trans>,
                        hint: <Trans>Please connect {persona.nickname ?? ''} before using dApps.</Trans>,
                    }
                if (!isVerified)
                    return {
                        buttonText: <Trans>Verify {persona.nickname ?? ''}</Trans>,
                        hint: (
                            <Trans>
                                Please verify the current persona with a social media account before using dApps.
                            </Trans>
                        ),
                    }
                return {
                    buttonText: <Trans>Connect {persona.nickname ?? ''}</Trans>,
                }
            })(),
            onClick: handleClick,
        }

        return <ActionContent {...actionProps} classes={{ button: props.classes?.button }} />
    }, [
        isConnected,
        isVerified,
        currentPersonaIdentifier,
        currentProfileIdentify,
        enableVerify,
        finishTarget,
        selectedPersona?.persona,
        selectedPersona?.proof,
    ])

    if (isPending)
        return (
            <Stack height="100%" justifyContent="center">
                <LoadingStatus iconSize={24} />
            </Stack>
        )

    if (error)
        return (
            <Stack height="100%" justifyContent="center">
                <ReloadStatus className={classes.reloadStatus} onRetry={refetch} />
            </Stack>
        )

    if (!personas.length) return <Stack height="100%" justifyContent="space-between" />

    return (
        <Stack height="100%" justifyContent="space-between">
            <Stack gap={1.5} className={classes.items}>
                {personas.map((x) => {
                    return (
                        <PersonaItemUI
                            key={x.persona.identifier.toText()}
                            data={x}
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
    buttonText?: ReactNode
    hint?: ReactNode
    onClick(): Promise<void>
}

function ActionContent(props: ActionContentProps) {
    const { buttonText, hint, onClick } = props
    const { classes } = useStyles(undefined, { props })
    if (!buttonText) return null
    return (
        <Stack gap={1.5} mt={1.5}>
            {hint ?
                <Typography color={(t) => t.palette.maskColor.main} fontSize={14} lineHeight="18px" height={36}>
                    {hint}
                </Typography>
            :   null}
            <Stack direction="row" justifyContent="center">
                <Button color="primary" className={classes.button} onClick={onClick}>
                    <Icons.Identity size={18} />
                    {buttonText}
                </Button>
            </Stack>
        </Stack>
    )
}
