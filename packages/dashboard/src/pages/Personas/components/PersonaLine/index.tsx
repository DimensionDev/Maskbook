import { memo, MouseEvent } from 'react'
import { Link, Typography } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { useDashboardI18N } from '../../../../locales'

export interface PersonaLineProps {
    internalName: string
    connected: boolean
    onConnect: () => void
    onDisConnect: () => void
    userId?: string
}

export const PersonaLine = memo<PersonaLineProps>(({ userId, internalName, connected, onConnect, onDisConnect }) => {
    const t = useDashboardI18N()
    return (
        <Link
            underline="none"
            onClick={(e: MouseEvent) => {
                e.stopPropagation()
                !connected && onConnect()
            }}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                cursor: connected ? 'unset' : 'pointer',
            }}>
            <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary }}>
                {userId ?? t.personas_connect_to({ internalName })}
            </Typography>
            {connected && (
                <Link
                    component="button"
                    variant="caption"
                    onClick={(e: MouseEvent) => {
                        e.stopPropagation()
                        onDisConnect()
                    }}>
                    {t.personas_disconnect()}
                </Link>
            )}
        </Link>
    )
})
