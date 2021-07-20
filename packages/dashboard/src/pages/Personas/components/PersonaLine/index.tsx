import { memo, MouseEvent } from 'react'
import { Link, Typography } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'

export interface UnconnectedPersonaLineProps {
    onConnect: () => void
    networkIdentifier: string
}

export const UnconnectedPersonaLine = memo<UnconnectedPersonaLineProps>(({ onConnect, networkIdentifier }) => {
    const t = useDashboardI18N()
    return (
        <Link
            underline="none"
            onClick={(e: MouseEvent) => {
                e.stopPropagation()
                onConnect()
            }}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
            }}>
            <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary }}>
                {t.personas_connect_to({ internalName: networkIdentifier })}
            </Typography>
        </Link>
    )
})

export interface ConnectedPersonaLineProps {
    onDisconnect: () => void
    userId: string
}

export const ConnectedPersonaLine = memo<ConnectedPersonaLineProps>(({ userId, onDisconnect }) => {
    const t = useDashboardI18N()
    return (
        <Link
            underline="none"
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
            }}>
            <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary }}>
                {userId}
            </Typography>
            <Link
                component="button"
                variant="caption"
                onClick={(e: MouseEvent) => {
                    e.stopPropagation()
                    onDisconnect()
                }}>
                {t.personas_disconnect()}
            </Link>
        </Link>
    )
})
