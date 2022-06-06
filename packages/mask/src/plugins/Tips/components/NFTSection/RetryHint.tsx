import { memo } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useI18N } from '../../locales'

interface RetryHintProps {
    retry(): void
}

export const RetryHint = memo<RetryHintProps>(({ retry }) => {
    const t = useI18N()
    return (
        <Stack justifyContent="center" direction="row" alignItems="center" height="100%">
            <Stack gap={2.75}>
                <Typography textAlign="center" fontSize={12} fontWeight={700}>
                    {t.tip_load_failed()}
                </Typography>
                <Button onClick={retry}>{t.tip_load_retry()}</Button>
            </Stack>
        </Stack>
    )
})
