import { Button, Stack } from '@mui/material'
import { memo, ReactNode, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import type { PluginId } from '@masknet/plugin-infra'
import { PersonaConnectStatus, useCurrentPersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { useI18N } from '../../utils'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    root: {
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
        color: '#fff',
        marginTop: 'auto',
        ':hover': {
            color: 'fff',
            backgroundColor: theme.palette.maskColor.dark,
        },
    },
}))

type SupportChildren = ((status: PersonaConnectStatus) => ReactNode) | ReactNode

interface PersonaBoundaryProps {
    handlerPosition?: 'center' | 'top-right'
    directTo?: PluginId
    customHint?: boolean
    children: SupportChildren
}

export const PersonaBoundary = memo<PersonaBoundaryProps>(
    ({ children, directTo, handlerPosition = 'center', customHint = false }) => {
        const { t } = useI18N()
        const { classes } = useStyles()

        const { value: status, loading: statusLoading } = useCurrentPersonaConnectStatus()
        const isFnChildren = typeof children === 'function'

        const actionComponent = useMemo(() => {
            if (children && customHint && !isFnChildren) return children
            if (isFnChildren) return children(status)

            if (!status.action) return null
            const button = status.hasPersona
                ? t('persona_boundary_connect_persona')
                : t('persona_boundary_create_persona')

            const icon = status.hasPersona ? (
                <Icons.Connect sx={{ marginRight: '8px' }} />
            ) : (
                <Icons.Identity size={18} sx={{ marginRight: '8px' }} />
            )

            return (
                <Button disabled={statusLoading} className={classes.button}>
                    {icon}
                    {button}
                </Button>
            )
        }, [status, t, statusLoading, customHint])
        // TODO: how to show the loading status
        return (
            <Stack
                className={classes.root}
                display="inline-flex"
                onClick={() => status.action?.(directTo, handlerPosition)}>
                <Stack style={{ pointerEvents: status.action ? 'none' : 'auto' }} display="inline-flex">
                    {actionComponent}
                </Stack>
                {(status.action || statusLoading) && <Stack className={classes.mask} display="inline-flex" />}
            </Stack>
        )
    },
)
