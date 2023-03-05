import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { memo, useCallback, useEffect } from 'react'
import { Box, Button, Popover, Typography } from '@mui/material'
import { useI18N } from '../../locales/i18n_generated.js'
import { Icon, useSharedI18N } from '@masknet/shared'
import { useAllPersonas, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'
import { useAsync } from 'react-use'
import { SmartPayFunder } from '@masknet/web3-providers'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { useQueryQualifications } from '../../hooks/useQueryQualifications.js'
import { SmartPayContext } from '../../hooks/useSmartPayContext.js'
import { CrossIsolationMessages, DashboardRoutes, PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginSmartPayMessages } from '../../message.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(3),
        background: theme.palette.maskColor.bottom,
        maxWidth: 320,
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
        lineHeight: '20px',
        textAlign: 'center',
    },
    info: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1.5),
        columnGap: theme.spacing(1.5),
    },
    name: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
    },
    identifier: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
    },
    tips: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
    },
}))

export interface AddSmartPayPopoverProps {
    open: boolean
    anchorEl: HTMLElement | null
    onClose: () => void
}

export const AddSmartPayPopover = memo<AddSmartPayPopoverProps>(({ open, anchorEl, onClose }) => {
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const { setSigner } = SmartPayContext.useContainer()
    const personas = useAllPersonas()
    const currentProfile = useLastRecognizedIdentity()
    const { value = 0 } = useAsync(async () => {
        if (!currentProfile?.identifier?.userId) return 0
        return SmartPayFunder.getRemainFrequency(currentProfile.identifier.userId)
    }, [currentProfile])

    const { value: qualifications, loading } = useQueryQualifications()

    const { setDialog: setPersonaSelectPanelDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.PersonaSelectPanelDialogUpdated,
    )

    const { setDialog: setCreatePersonaConfirmDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.openPageConfirm,
    )

    const { closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)

    const handleCreate = useCallback(() => {
        if (loading || !qualifications) return

        // If there is no persona and no signer
        if (!personas.length && !qualifications.signPersona && !qualifications.signWallet) {
            setCreatePersonaConfirmDialog({
                open: true,
                target: 'dashboard',
                url: DashboardRoutes.Setup,
                text: sharedI18N.create_persona_hint(),
                title: sharedI18N.create_persona_title(),
                actionHint: sharedI18N.create_persona_action(),
                position: 'center',
            })
            return
        }

        // if there is verified persona but current persona isn't verified
        if (
            (qualifications.hasVerifiedPersona || personas.length) &&
            !qualifications.signPersona &&
            !qualifications.signWallet
        ) {
            setPersonaSelectPanelDialog({
                open: true,
                enableVerify: true,
                target: PluginID.SmartPay,
            })
            return
        }

        setSigner({
            signPersona: qualifications?.signPersona,
            signWallet: qualifications?.signWallet,
        })
        navigate(RoutePaths.Deploy, {
            state: {
                canBack: true,
            },
        })
    }, [loading, qualifications])

    useEffect(() => {
        return CrossIsolationMessages.events.applicationDialogEvent.on(({ selectedPersona, pluginID, open }) => {
            if (!open) return closeDialog()
            if (pluginID !== PluginID.SmartPay) return
            setSigner({
                signPersona: selectedPersona,
            })
            navigate(RoutePaths.Deploy, {
                state: {
                    canBack: true,
                },
            })
        })
    }, [closeDialog])

    return usePortalShadowRoot((container) => (
        <Popover
            disableScrollLock
            container={container}
            open={open}
            onClose={onClose}
            anchorEl={anchorEl}
            disableRestoreFocus
            classes={{ paper: classes.paper }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
            <Typography className={classes.title}>{t.add_smart_pay_wallet()}</Typography>
            <Box className={classes.info}>
                <Icon logoURL={currentProfile?.avatar} name={currentProfile?.nickname} size={30} />
                <Box>
                    <Typography className={classes.name}>{currentProfile?.nickname}</Typography>
                    <Typography className={classes.identifier}>@{currentProfile?.identifier?.userId}</Typography>
                </Box>
            </Box>
            <Typography className={classes.tips}>{t.remain_times_tips({ count: value })}</Typography>
            <Button fullWidth variant="roundedContained" onClick={handleCreate}>
                {t.create()}
            </Button>
        </Popover>
    ))
})
