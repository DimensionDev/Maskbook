import { memo } from 'react'
import { Box, Stack, Typography } from '@material-ui/core'
import { EmptyIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../../../locales'

interface PlaceholderProps {
    network: string
}

export const Placeholder = memo<PlaceholderProps>(({ network }) => {
    const t = useDashboardI18N()
    return (
        <Stack height="100%" alignItems="center" justifyContent="center">
            <Box textAlign="center">
                <EmptyIcon sx={{ fontSize: 100 }} />
                <Typography variant="body2" mb={3}>
                    {t.personas_post_is_empty()}
                </Typography>
            </Box>
        </Stack>
    )
})
