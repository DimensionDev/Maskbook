import { memo, MouseEvent } from 'react'
import { Link, Typography } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

export interface PersonaLineProps {
    internalName: string
    connected: boolean
    onConnect: () => void
    onDisConnect: () => void
    userId?: string
}

export const PersonaLine = memo<PersonaLineProps>(({ userId, internalName, connected, onConnect, onDisConnect }) => {
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
                {userId ?? `Connect to ${internalName}`}
            </Typography>
            {connected && (
                <Link
                    component="button"
                    variant="caption"
                    onClick={(e: MouseEvent) => {
                        e.stopPropagation()
                        onDisConnect()
                    }}>
                    Disconnect
                </Link>
            )}
        </Link>
    )
})
