import { memo } from 'react'
import { Button, type ButtonProps, Stack, Typography } from '@mui/material'
import { useSharedTrans } from '../../../locales/index.js'

interface RetryHintProps {
    hint?: boolean
    retry?(): void
    ButtonProps?: ButtonProps
}

/**
 * @deprecated use ReloadStatus instead
 */
export const RetryHint = memo<RetryHintProps>(({ retry, hint = true, ButtonProps }) => {
    const t = useSharedTrans()
    return (
        <Stack justifyContent="center" direction="row" alignItems="center" height={hint ? '100%' : '100px'}>
            <Stack gap={2.75}>
                {hint ?
                    <Typography textAlign="center" fontSize={12} fontWeight={700}>
                        {t.load_failed()}
                    </Typography>
                :   null}
                <Button {...ButtonProps} size="small" style={{ borderRadius: 16 }} onClick={() => retry?.()}>
                    {t.load_retry()}
                </Button>
            </Stack>
        </Stack>
    )
})

RetryHint.displayName = 'RetryHint'
