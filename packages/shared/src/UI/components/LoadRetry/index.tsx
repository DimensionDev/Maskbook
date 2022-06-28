import { memo } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'

interface RetryHintProps {
    hint?: boolean
    retry(): void
}

export const RetryHint = memo<RetryHintProps>(({ retry, hint = true }) => {
    const t = useSharedI18N()
    return (
        <Stack justifyContent="center" direction="row" alignItems="center" height={hint ? '100%' : '100px'}>
            <Stack gap={2.75}>
                {hint && (
                    <Typography textAlign="center" fontSize={12} fontWeight={700}>
                        {t.load_failed()}
                    </Typography>
                )}
                <Button size="small" style={{ borderRadius: 16 }} onClick={retry}>
                    {t.load_retry()}
                </Button>
            </Stack>
        </Stack>
    )
})
