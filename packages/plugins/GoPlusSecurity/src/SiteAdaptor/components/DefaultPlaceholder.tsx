import { Box, Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

export function DefaultPlaceholder() {
    return (
        <Stack alignItems="center" spacing={2.5}>
            <Box>
                <Icons.SecurityChecker size={48} />
            </Box>
            <Box>
                <Typography variant="body2">
                    <Trans>Note: Scams detections might not be 100% guaranteed.</Trans>
                </Typography>
            </Box>
        </Stack>
    )
}
