import { Icon } from '@masknet/icons'
import { openWindow } from '@masknet/shared-base-ui'
import { MaskColorVar } from '@masknet/theme'
import { Box, Button, Stack, Theme, Typography, useMediaQuery } from '@mui/material'
import { memo } from 'react'
import urlcat from 'urlcat'
import { useDashboardI18N } from '../../../../locales'

interface PlaceholderProps {
    network: string
}

export const Placeholder = memo<PlaceholderProps>(({ network }) => {
    const t = useDashboardI18N()
    const isXs = useMediaQuery<Theme>((theme) => theme.breakpoints.down('xs'))
    const url = urlcat('https://www.:network', { network })

    const handleClick = () => openWindow(url)

    return (
        <Stack height="100%" alignItems="center" justifyContent="center" mt={-3.5}>
            <Box textAlign="center">
                <Icon type="empty" size={isXs ? 100 : undefined} />
                <Typography variant="body2" mb={3} sx={{ color: MaskColorVar.textSecondary }}>
                    {t.personas_post_is_empty()}
                </Typography>
                {/* TODO: should use a link and href here. */}
                <Button onClick={handleClick}>{t.personas_post_create()}</Button>
            </Box>
        </Stack>
    )
})
