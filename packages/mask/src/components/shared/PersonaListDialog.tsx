import { Icons } from '@masknet/icons'
import { Avatar, Box, Button, DialogContent, Stack, Typography } from '@mui/material'
import {
    BindingProof,
    EMPTY_LIST,
    formatPersonaFingerprint,
    isSamePersona,
    NextIDPlatform,
    PersonaIdentifier,
    PersonaInformation,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { useAsync, useAsyncFn, useCopyToClipboard } from 'react-use'
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
        nickname: {
            fontSize: 16,
            lineHeight: '20px',
            color: theme.palette.maskColor.main,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        fingerprint: {
            fontSize: 12,
            lineHeight: '16px',
            color: theme.palette.maskColor.second,
        },
        copyIcon: {
            color: 'red',
        },
        dot: {
            display: 'inline-block',
            background: '#2DDF00',
            borderRadius: '50%',
            width: 7,
            height: 7,
            position: 'absolute',
            left: '77.62%',
            right: '5.84%',
            top: '5.84%',
            bottom: '77.62',
            border: `1px solid ${theme.palette.maskColor.bottom}`,
        },
    }
})

interface PersonaListProps {
    open: boolean
    onClose(): void
}

interface PersonaNextIDMixture {
    persona: PersonaInformation
    proof: BindingProof[]
    avatar?: string
}

export const PersonaListDialog = ({ open, onClose }: PersonaListProps) => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()
    const [selectedPersona, setSelectedPersona] = useState<PersonaNextIDMixture>()
    const currentPlatform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform | undefined

    const [, handleVerifyNextID] = useNextIDVerify()
    const currentProfileIdentify = useLastRecognizedIdentity()
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

        // Selected Persona not link current SNS
        if (
            !selectedPersona.persona.linkedProfiles.find(
                (x) => x.identifier.userId === currentProfileIdentify.identifier?.userId,
            )
        ) {
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
                            <Stack
                                key={x.persona.identifier.toText()}
                                direction="row"
                                alignItems="center"
                                gap={1}
                                onClick={() => onSelectPersona(x)}>
                                <Box flexGrow={0} position="relative">
                                    {x.avatar && (
                                        <Avatar
                                            src={x.avatar}
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                display: 'inline-block',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    )}
                                    {!x.avatar && <Icons.MenuPersonasActive size={30} />}
                                    {isSamePersona(currentPersonaIdentifier, x.persona) && (
                                        <Box className={classes.dot} />
                                    )}
                                </Box>
                                <Stack flexGrow={1}>
                                    <Typography className={classes.nickname}>
                                        <Stack
                                            component="span"
                                            display="inline-flex"
                                            direction="row"
                                            alignItems="center"
                                            gap={0.25}>
                                            {x.persona.nickname}
                                            <>
                                                {!!x.proof.find(
                                                    (p) =>
                                                        p.identity.toLowerCase() ===
                                                        currentProfileIdentify.identifier?.userId.toLowerCase(),
                                                ) && <Icons.NextIDMini width={32} height={18} />}
                                            </>
                                        </Stack>
                                    </Typography>
                                    <Typography className={classes.fingerprint}>
                                        <Stack
                                            component="span"
                                            display="inline-flex"
                                            direction="row"
                                            alignItems="center"
                                            gap={0.25}>
                                            {formatPersonaFingerprint(x.persona.identifier.rawPublicKey, 4)}
                                            <Icons.Copy
                                                style={{ cursor: 'pointer' }}
                                                size={14}
                                                onClick={(e) => onCopyPersons(e, x)}
                                            />
                                        </Stack>
                                    </Typography>
                                </Stack>
                                <Stack flexGrow={0}>
                                    {isSamePersona(selectedPersona?.persona, x.persona) ? (
                                        <Icons.CheckCircle size={20} />
                                    ) : (
                                        <Icons.RadioNo size={20} />
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
