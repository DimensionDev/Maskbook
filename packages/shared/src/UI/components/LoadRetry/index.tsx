import { memo } from 'react'
import { Button, type ButtonProps, Stack, Typography } from '@mui/material'
import { Trans } from '@lingui/macro'

interface RetryHintProps {
    hint?: boolean
    retry?(): void
    ButtonProps?: ButtonProps
}

/**
 * @deprecated use ReloadStatus instead
 */
export const RetryHint = memo<RetryHintProps>(({ retry, hint = true, ButtonProps }) => {
    return (
        <Stack justifyContent="center" direction="row" alignItems="center" height={hint ? '100%' : '100px'}>
            <Stack gap={2.75}>
                {hint ?
                    <Typography textAlign="center" fontSize={12} fontWeight={700}>
                        <Trans>Load failed</Trans>
                    </Typography>
                :   null}
                <Button {...ButtonProps} size="small" style={{ borderRadius: 16 }} onClick={() => retry?.()}>
                    <Trans>Reload</Trans>
                </Button>
            </Stack>
        </Stack>
    )
})

RetryHint.displayName = 'RetryHint'
