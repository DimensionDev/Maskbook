import { Box } from '@mui/material'
import { LoadingPlaceholder } from '@masknet/injected-ui/LoadingPlaceholder'

export const meta = {
    title: 'LoadingPlaceholder',
    description: 'A full-page loading spinner used across popups pages (packages/injected-ui/src/LoadingPlaceholder.tsx).',
}

export default function LoadingPlaceholderDemo() {
    return (
        <Box sx={{ height: 240, display: 'flex' }}>
            <LoadingPlaceholder title="Loading wallet..." />
        </Box>
    )
}
