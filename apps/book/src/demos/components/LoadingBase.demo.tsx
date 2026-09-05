import { Stack, Typography } from '@mui/material'
import { LoadingBase } from '@masknet/theme'

export const meta = {
    title: 'LoadingBase',
    description: 'The spinner used across the extension. Accepts icon props (size, color).',
}

export default function LoadingBaseDemo() {
    return (
        <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
            {[16, 24, 36, 48].map((size) => (
                <Stack key={size} spacing={1} sx={{ alignItems: 'center' }}>
                    <LoadingBase size={size} />
                    <Typography variant="caption">{size}px</Typography>
                </Stack>
            ))}
        </Stack>
    )
}
