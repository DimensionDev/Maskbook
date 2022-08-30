import { Button, DialogContent, Stack, Typography } from '@mui/material'
import {
    resolveNextIDIdentityToProfile,
    CrossIsolationMessages,
    DashboardRoutes,
    EMPTY_LIST,
    isSamePersona,
    isSameProfile,
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
import { MaskMessages, useI18N } from '../../utils'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { LoadingBase, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { PluginNextIDMessages } from '../../plugins/NextID/messages'
import type { PersonaNextIDMixture } from './PersonaListUI/PersonaItemUI'
import { PersonaItemUI } from './PersonaListUI/PersonaItemUI'
import { useCurrentPersona } from '../DataSource/usePersonaConnectStatus'
import { delay } from '@dimensiondev/kit'

type PositionOption = 'center' | 'top-right'
type PositionStyle = {
    top?: number
    right?: number
    position?: 'absolute'
}

const useStyles = makeStyles<{
    positionStyle: {
        top?: number
        right?: number
        position?: 'absolute'
    }
}>()((theme, props) => {
    return {
        root: {
            width: 384,
            height: 386,
            padding: theme.spacing(1),
            background: theme.palette.maskColor.bottom,
            position: props.positionStyle.position,
            top: props.positionStyle.top,
            right: props.positionStyle.right,
        },
        content: {
            padding: theme.spacing(0, 2, 2, 2),
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        header: {
            background: `${theme.palette.maskColor.bottom} !important`,
        },
        items: {
            overflow: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

const positionStyleMap: Record<PositionOption, PositionStyle> = {
    center: {},
    'top-right': {
        position: 'absolute',
        top: 0,
        right: 0,
    },
}

export const PersonaSelectPanelDialog = () => {
    const { t } = useI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    const currentPersona = useCurrentPersona()
    const currentPersonaIdentifier = currentPersona?.identifier

    const [finishTarget, setFinishTarget] = useState<string>()
    const [position, setPosition] = useState<PositionOption>('center')
    const [enableVerify, setEnableVerify] = useState(true)
    const { classes } = useStyles({ positionStyle: positionStyleMap[position] })

    const { open, closeDialog } = useRemoteControlledDialog(
        PluginNextIDMessages.PersonaSelectPanelDialogUpdated,
        (ev) => {
            if (!ev.open) {
                setFinishTarget(undefined)
            } else {
                setFinishTarget(ev.target)
                setEnableVerify(ev.enableVerify)
                setPosition(ev.position ?? 'center')
            }
        },
    )

    const [selectedPersona, setSelectedPersona] = useState<PersonaNextIDMixture>()

    const [, handleVerifyNextID] = useNextIDVerify()
    const currentProfileIdentify = useLastRecognizedIdentity()
    const { value: personas = EMPTY_LIST, loading } = useConnectedPersonas()

    const { closeDialog: closeApplicationBoard } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

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
            await Services.Identity.attachProfile(profileIdentifier, personaIdentifier, {
                connectionConfirmState: 'confirmed',
            })
            await Services.Settings.setCurrentPersonaIdentifier(personaIdentifier)
        },
        [],
    )

    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(MaskMessages.events.openPageConfirm)

    useEffect(() => {
        if (personas.length || !finishTarget) return

        closeDialog()
        setCreatePersonaConfirmDialog({
            open: true,
            target: 'dashboard',
            url: DashboardRoutes.Setup,
            text: t('applications_create_persona_hint'),
            title: t('applications_create_persona_title'),
            actionHint: t('applications_create_persona_action'),
        })
    }, [personas.length, finishTarget])

    const actionButton = useMemo(() => {
        let isConnected = true
        let isVerified = true

        if (!currentProfileIdentify || !selectedPersona) return null

        // Selected Persona not link current SNS
        if (!selectedPersona.persona.linkedProfiles.find((x) => isSameProfile(x, currentProfileIdentify.identifier))) {
            isConnected = false
        }

        if (!isSamePersona(selectedPersona.persona, currentPersonaIdentifier)) isConnected = false

        const verifiedSns = selectedPersona.proof.find((x) =>
            isSameProfile(resolveNextIDIdentityToProfile(x.identity, x.platform), currentProfileIdentify.identifier),
        )
        if (!verifiedSns) {
            isVerified = false
        }

        const handleClick = async () => {
            if (!isConnected) {
                await connect?.(currentProfileIdentify.identifier, selectedPersona.persona.identifier)
            }
            if (!isVerified && enableVerify) {
                closeDialog()
                closeApplicationBoard()
                await handleVerifyNextID(selectedPersona.persona, currentProfileIdentify.identifier?.userId)
            }

            if (finishTarget) {
                CrossIsolationMessages.events.requestOpenApplication.sendToLocal({
                    open: true,
                    application: finishTarget,
                })
            }

            await delay(100)
            closeDialog()
        }

        const actionProps = {
            ...(() => {
                if (!isConnected && !isVerified && enableVerify)
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
                return {
                    buttonText: t('applications_persona_connect', {
                        nickname: selectedPersona?.persona.nickname,
                    }),
                }
            })(),
            onClick: handleClick,
        }

        return <ActionContent {...actionProps} />
    }, [currentPersonaIdentifier, currentProfileIdentify, selectedPersona, enableVerify, finishTarget])

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
            onClose={closeDialog}
            title={t('applications_persona_title')}
            titleBarIconStyle="close">
            <DialogContent classes={{ root: classes.content }}>
                {loading ? (
                    <Stack justifyContent="center" alignItems="center" height="100%">
                        <LoadingBase width={24} height={24} />
                    </Stack>
                ) : (
                    <Stack height="100%" justifyContent="space-between">
                        <Stack gap={1.5} className={classes.items}>
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
                    </Stack>
                )}
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
    if (!buttonText) return null
    return (
        <Stack gap={1.5} mt={1.5}>
            {hint && (
                <Typography color={(t) => t.palette.maskColor.main} fontSize={14} lineHeight="18px" height={36}>
                    {hint}
                </Typography>
            )}
            <Button color="primary" style={{ borderRadius: 20 }} onClick={onClick}>
                {buttonText}
            </Button>
        </Stack>
    )
}
