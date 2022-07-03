import { memo } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Empty as EmptyIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../../../locales'
import urlcat from 'urlcat'
import { MaskColorVar } from '@masknet/theme'
import { openWindow } from '@masknet/shared-base-ui'

interface PlaceholderProps {
    network: string
}

export const Placeholder = memo<PlaceholderProps>(({ network }) => {
    const t = useDashboardI18N()
    const url = urlcat('https://www.:network', { network })

    const handleClick = () => openWindow(url)

    return (
        <Stack height="100%" alignItems="center" justifyContent="center" mt={-3.5}>
            <Box textAlign="center">
                <EmptyIcon sx={{ fontSize: 100 }} />
                <Typography variant="body2" mb={3} sx={{ color: MaskColorVar.textSecondary }}>
                    {t.personas_post_is_empty()}
                </Typography>
                {/* TODO: should use a link and href here. */}
                <Button onClick={handleClick}>{t.personas_post_create()}</Button>
            </Box>
        </Stack>
    )
})
