import { Icons } from '@masknet/icons'
import { LoadingStatus, SOCIAL_MEDIA_ROUND_ICON_MAPPING } from '@masknet/shared'
import { ProfileIdentifier, SOCIAL_MEDIA_NAME, type PersonaIdentifier, MaskMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventType } from '@masknet/web3-telemetry/types'
import { Box, Button, Typography } from '@mui/material'
import { useEffect } from 'react'
import { Trans } from 'react-i18next'
import { useAsyncFn } from 'react-use'
import Services from '#services'
import { EventMap } from '../../../extension/popups/pages/Personas/common.js'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import { useMaskSharedTrans } from '../../../utils/index.js'
import { BindingDialog, type BindingDialogProps } from './BindingDialog.js'
import { useSetupGuideStepInfo } from './useSetupGuideStepInfo.js'
import { queryClient } from '@masknet/shared-base-ui'

export const useFindUsernameStyles = makeStyles()((theme) => ({
    main: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: theme.spacing(3),
        height: '100%',
        boxSizing: 'border-box',
    },
    icon: {
        marginTop: theme.spacing(3),
    },
    title: {
        fontSize: 18,
        margin: theme.spacing(1.5),
        fontWeight: 700,
    },
    loadingBox: {
        width: 320,
        height: 130,
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.palette.maskColor.second,
    },
}))

export interface FindUsernameProps extends BindingDialogProps {
    persona: PersonaIdentifier
    onDone?: () => void
}

export function FindUsername({ persona, onClose, onDone }: FindUsernameProps) {
    const { t } = useMaskSharedTrans()
    const { classes } = useFindUsernameStyles()
    const site = activatedSiteAdaptorUI!.networkIdentifier
    const siteName = SOCIAL_MEDIA_NAME[site] || ''
    const Icon = SOCIAL_MEDIA_ROUND_ICON_MAPPING[site] || Icons.Globe
    const { step, userId, currentIdentityResolved, destinedPersonaInfo: personaInfo } = useSetupGuideStepInfo(persona)
    const connected = personaInfo?.linkedProfiles.some(
        (x) => x.identifier.network === site && x.identifier.userId === userId,
    )

    const [{ loading }, onConnect] = useAsyncFn(async () => {
        const id = ProfileIdentifier.of(activatedSiteAdaptorUI!.networkIdentifier, userId)
        if (!id.isSome()) return
        // attach persona with site profile
        await Services.Identity.attachProfile(id.value, persona, {
            connectionConfirmState: 'confirmed',
        })

        if (currentIdentityResolved.avatar) {
            await Services.Identity.updateProfileInfo(id.value, {
                avatarURL: currentIdentityResolved.avatar,
            })
        }
        // auto-finish the setup process
        if (!personaInfo) throw new Error('invalid persona')
        await Services.Identity.setupPersona(personaInfo?.identifier)
        queryClient.invalidateQueries(['query-persona-info', persona.publicKeyAsHex])
        MaskMessages.events.ownPersonaChanged.sendToAll()

        Telemetry.captureEvent(EventType.Access, EventMap[activatedSiteAdaptorUI!.networkIdentifier])
    }, [activatedSiteAdaptorUI!.networkIdentifier, personaInfo, step, persona, userId, currentIdentityResolved.avatar])

    // Auto connect
    useEffect(() => {
        if (connected) return
        onConnect()
    }, [connected, onConnect])

    return (
        <BindingDialog onClose={onClose}>
            <div className={classes.main}>
                <Icon size={48} className={classes.icon} />
                <Typography className={classes.title}>{t('connect_persona')}</Typography>
                {loading ? (
                    <div className={classes.loadingBox}>
                        <LoadingStatus omitText />
                    </div>
                ) : connected ? (
                    <>
                        <Typography className={classes.text}>
                            <Trans
                                i18nKey="connected_already"
                                values={{
                                    account: userId,
                                }}
                                components={{
                                    bold: <b />,
                                }}
                            />
                        </Typography>
                        <Typography className={classes.text} mt="1.5em">
                            {t('switch_for_more_connections')}
                        </Typography>
                        <Box mt="auto" width="100%">
                            <Button fullWidth onClick={() => onDone?.()}>
                                {t('done')}
                            </Button>
                        </Box>
                    </>
                ) : userId ? (
                    <>
                        <Typography className={classes.text}>{t('not_current_account')}</Typography>
                        <Typography className={classes.text} mt="1.5em">
                            <Trans
                                i18nKey="request_to_switch_account"
                                values={{
                                    account: userId,
                                }}
                                components={{
                                    bold: <b />,
                                }}
                            />
                        </Typography>
                    </>
                ) : (
                    <Typography className={classes.text}>{t('request_to_login', { siteName })}</Typography>
                )}
            </div>
        </BindingDialog>
    )
}
