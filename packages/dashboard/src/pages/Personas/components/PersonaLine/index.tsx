import { memo } from 'react'
import { Box, Link, Typography } from '@material-ui/core'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

export interface PersonaLineProps {
    internalName: string
    connected: boolean
    userId?: string
}

export const PersonaLine = memo<PersonaLineProps>(({ userId, internalName, connected }) => {
    return (
        <Box display="flex" justifyContent="space-between">
            <Typography variant="caption" sx={{ color: MaskColorVar.textPrimary }}>
                {userId ?? `Connect to ${internalName}`}
            </Typography>
            {connected && (
                <Link component="button" variant="caption">
                    Disconnect
                </Link>
            )}
        </Box>
    )
})
