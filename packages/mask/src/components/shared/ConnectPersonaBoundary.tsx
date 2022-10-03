import { memo, ReactNode, useCallback, useMemo } from 'react'
import { Button, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import type { PluginID } from '@masknet/plugin-infra'
import { PersonaConnectStatus, useCurrentPersonaConnectStatus } from '../DataSource/usePersonaConnectStatus.js'
import { useI18N } from '../../utils/index.js'

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
    enableVerify?: boolean
    beforeVerify?: () => void | Promise<void>
    createConfirm?: boolean
}

export const ConnectPersonaBoundary = memo<ConnectPersonaBoundaryProps>(
    ({
        children,
        directTo,
        handlerPosition = 'center',
        customHint = false,
        beforeVerify,
        enableVerify = true,
        createConfirm = true,
    }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

        const { value: status, loading: statusLoading } = useCurrentPersonaConnectStatus()
        const isFnChildren = typeof children === 'function'

        const actionComponent = useMemo(() => {
            if (children && customHint && !isFnChildren) return children
            if (isFnChildren) return children(status)

            if (!status.action) return null
            if (!status.hasPersona)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Identity size={18} sx={{ marginRight: '8px' }} />
                        {t('persona_boundary_create_persona')}
                    </Button>
                )

            if (!status.connected)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Connect size={18} sx={{ marginRight: '8px' }} />
                        {t('persona_boundary_connect_persona')}
                    </Button>
                )
            if (!status.verified)
                return (
                    <Button disabled={statusLoading} className={classes.button}>
                        <Icons.Connect size={18} sx={{ marginRight: '8px' }} />
                        {t('persona_boundary_verify_persona')}
                    </Button>
                )
            return null
        }, [status, t, statusLoading, customHint, isFnChildren])

        const handleClick = useCallback(() => {
            if (!status.verified && status.connected && enableVerify) beforeVerify?.()
            status.action?.(directTo, handlerPosition, enableVerify, !createConfirm)
        }, [directTo, handlerPosition, JSON.stringify(status), enableVerify, createConfirm])

        return (
            <Stack className={classes.root} display="inline-flex" onClick={handleClick}>
                <Stack style={{ pointerEvents: status.action ? 'none' : 'auto' }} display="inline-flex">
                    {actionComponent}
                </Stack>
                {(status.action || statusLoading) && <Stack className={classes.mask} display="inline-flex" />}
            </Stack>
        )
    },
)
