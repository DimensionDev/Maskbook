import { memo, type ReactNode, useCallback, useMemo } from 'react'
import { Button, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { DashboardRoutes, type PersonaIdentifier, type PersonaInformation, type PluginID } from '@masknet/shared-base'
import { type PersonaConnectStatus, useCurrentPersonaConnectStatus, useSharedTrans } from '../../../index.js'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        flex: 1,
        position: 'relative',
    },
    mask: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        cursor: 'pointer',
    },
    button: {
        borderRadius: '99px',
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.maskColor.white,
        marginTop: 'auto',
        ':hover': {
            color: theme.palette.maskColor.white,
            backgroundColor: theme.palette.maskColor.dark,
        },
    },
}))

type SupportChildren = ((status: PersonaConnectStatus) => ReactNode) | ReactNode

interface ConnectPersonaBoundaryProps {
    handlerPosition?: 'center' | 'top-right'
    directTo?: PluginID
    customHint?: boolean
    children: SupportChildren
    createConfirm?: boolean
    enableVerify?: boolean
    personas: readonly PersonaInformation[]
    beforeAction?: (status: PersonaConnectStatus) => Promise<void> | void
    afterAction?: (status: PersonaConnectStatus) => Promise<void> | void
    currentPersonaIdentifier: PersonaIdentifier | undefined
    openDashboard?: (route: DashboardRoutes, search?: string) => void
    identity?: IdentityResolved
}

export const ConnectPersonaBoundary = memo<ConnectPersonaBoundaryProps>(
    ({
        children,
        directTo,
        handlerPosition = 'center',
        customHint = false,
        createConfirm = true,
        enableVerify = true,
        personas,
        beforeAction,
        afterAction,
        currentPersonaIdentifier,
        identity,
        openDashboard,
    }) => {
        const t = useSharedTrans()
        const { classes } = useStyles()

        const { value: status, loading: statusLoading } = useCurrentPersonaConnectStatus(
            personas,
            currentPersonaIdentifier,
            openDashboard,
            identity,
        )
        const isFnChildren = typeof children === 'function'

        const actionComponent = useMemo(() => {
            if (children && customHint && !isFnChildren) return children
            if (isFnChildren) return children(status)

            if (!status.action) return null
            if (!status.hasPersona)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Identity size={18} sx={{ marginRight: '8px' }} />
                        <Trans>Create Persona</Trans>
                    </Button>
                )

            if (!status.connected)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Connect size={18} sx={{ marginRight: '8px', color: '#fff' }} />
                        <Trans>Connect Persona</Trans>
                    </Button>
                )
            if (!status.verified)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Connect size={18} sx={{ marginRight: '8px', color: '#fff' }} />
                        <Trans>Verify your X ID</Trans>
                    </Button>
                )
            return null
        }, [t, status, statusLoading, customHint, isFnChildren, children])

        const handleClick = useCallback(() => {
            beforeAction?.(status)

            if (!status.hasPersona || !status.connected) {
                status.action?.(
                    directTo ?? DashboardRoutes.SignUpPersona,
                    handlerPosition,
                    enableVerify,
                    !createConfirm,
                )
                return
            }

            if (!status.verified) status.action?.(directTo, handlerPosition, enableVerify, !createConfirm)
            afterAction?.(status)
        }, [directTo, handlerPosition, status, createConfirm])

        if (statusLoading) return null
        return (
            <Stack className={classes.root} display="inline-flex" onClick={handleClick}>
                <Stack style={{ pointerEvents: status.action ? 'none' : 'auto' }} display="inline-flex">
                    {actionComponent}
                </Stack>
                {status.action || statusLoading ?
                    <Stack className={classes.mask} display="inline-flex" />
                :   null}
            </Stack>
        )
    },
)
