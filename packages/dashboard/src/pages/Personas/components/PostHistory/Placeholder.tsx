import { memo } from 'react'
import { Box, Button, Stack, Typography } from '@material-ui/core'
import { EmptyIcon } from '@masknet/icons'
import { useDashboardI18N } from '../../../../locales'
import { Services } from '../../../../API'
import urlcat from 'urlcat'

interface PlaceholderProps {
    network: string
}

export const Placeholder = memo<PlaceholderProps>(({ network }) => {
    const t = useDashboardI18N()
    const url = urlcat('https://www.:network', { network: network })

    const handleClick = () => Services.Settings.openSNSAndActivatePlugin(url, 'none')

    return (
        <Stack height="100%" alignItems="center" justifyContent="center" mt={-3.5}>
            <Box textAlign="center">
                <EmptyIcon sx={{ fontSize: 100 }} />
                <Typography variant="body2" mb={3}>
                    {t.personas_post_is_empty()}
                </Typography>
                <Button onClick={handleClick}>{t.personas_post_create()}</Button>
            </Box>
        </Stack>
    )
})
