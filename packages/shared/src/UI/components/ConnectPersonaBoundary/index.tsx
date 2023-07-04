import { memo, type ReactNode, useCallback, useMemo } from 'react'
import { Button, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import type { DashboardRoutes, PersonaInformation, PluginID } from '@masknet/shared-base'
import { type PersonaConnectStatus, useCurrentPersonaConnectStatus, useSharedI18N } from '../../../index.js'
import type { IdentityResolved } from '@masknet/plugin-infra'

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
    personas: PersonaInformation[]
    beforeAction?: (status: PersonaConnectStatus) => Promise<void> | void
    afterAction?: (status: PersonaConnectStatus) => Promise<void> | void
    currentPersonaIdentifier: string
    openDashboard: (route?: DashboardRoutes, search?: string) => ReturnType<typeof browser.tabs.create>
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
        const t = useSharedI18N()
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
                        {t.persona_boundary_create_persona()}
                    </Button>
                )

            if (!status.connected)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Connect size={18} sx={{ marginRight: '8px', color: '#fff' }} />
                        {t.persona_boundary_connect_persona()}
                    </Button>
                )
            if (!status.verified)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Connect size={18} sx={{ marginRight: '8px', color: '#fff' }} />
                        {t.persona_boundary_verify_persona()}
                    </Button>
                )
            return null
        }, [t, status, statusLoading, customHint, isFnChildren, children])

        const handleClick = useCallback(() => {
            beforeAction?.(status)
            if (!status.verified || !status.hasPersona || !status.connected)
                status.action?.(directTo, handlerPosition, enableVerify, !createConfirm)
            afterAction?.(status)
        }, [directTo, handlerPosition, status, createConfirm])

        return (
            <Stack className={classes.root} display="inline-flex" onClick={handleClick}>
                <Stack style={{ pointerEvents: status.action ? 'none' : 'auto' }} display="inline-flex">
                    {actionComponent}
                </Stack>
                {status.action || statusLoading ? <Stack className={classes.mask} display="inline-flex" /> : null}
            </Stack>
        )
    },
)
