import { Stack } from '@mui/material'
import { memo } from 'react'
import { useCurrentPersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { makeStyles } from '@masknet/theme'
import type { PluginId } from '@masknet/plugin-infra'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        '&:after': {},
    },
    mask: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
}))
interface PersonaBoundaryProps extends React.PropsWithChildren<{}> {
    handlerPosition?: 'center' | 'top-right'
    directTo?: PluginId
}

export const PersonaBoundary = memo<PersonaBoundaryProps>(({ children, directTo, handlerPosition = 'center' }) => {
    const { classes } = useStyles()
    const { value: status, loading: statusLoading } = useCurrentPersonaConnectStatus()

    // TODO: how to show the loading status
    return !statusLoading ? (
        <Stack display="inline-flex" onClick={() => status.action?.(directTo, handlerPosition)}>
            <Stack style={{ pointerEvents: status.action ? 'none' : 'auto' }} display="inline-flex">
                {children}
            </Stack>
            {status.action && <Stack className={classes.mask} display="inline-flex" />}
        </Stack>
    ) : null
})
