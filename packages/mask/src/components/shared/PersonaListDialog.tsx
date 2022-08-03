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
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: 384,
            height: 386,
            padding: theme.spacing(1),
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
        },
        fingerprint: {
            fontSize: 12,
            lineHeight: '16px',
            color: theme.palette.maskColor.second,
        },
        copyIcon: {
            color: 'red',
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
}

function isSamePersona(p1?: PersonaIdentifier | PersonaInformation, p2?: PersonaIdentifier | PersonaInformation) {
    if (!p1 || !p2) return false
    const p1Identifier = 'toText' in p1 ? p1 : p1.identifier
    const p2Identifier = 'toText' in p2 ? p2 : p2.identifier
    return p1Identifier.toText() === p2Identifier.toText()
}

export const PersonaListDialog = ({ open, onClose }: PersonaListProps) => {
    const { t } = useI18N()
    const { classes } = useStyles()
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
                                <Box flexGrow={0}>
                                    <Icons.MenuPersonasActive size={30} />
                                </Box>
                                <Stack flexGrow={1}>
                                    <Typography className={classes.nickname}>
                                        <Stack display="inline-flex" direction="row" alignItems="center" gap={0.25}>
                                            {x.persona.nickname}
                                            <>
                                                {!!x.proof.find(
                                                    (p) =>
                                                        p.identity.toLowerCase() ===
                                                        currentProfileIdentify?.identifier.userId.toLowerCase(),
                                                ) && <Icons.NextIDMini width={32} height={18} />}
                                            </>
                                        </Stack>
                                    </Typography>
                                    <Typography className={classes.fingerprint}>
                                        <Stack display="inline-flex" direction="row" alignItems="center" gap={0.25}>
                                            {formatPersonaFingerprint(x.persona.identifier.rawPublicKey, 4)}
                                            <Icons.Copy size={14} />
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
