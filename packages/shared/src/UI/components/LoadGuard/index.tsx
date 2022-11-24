import React, { memo, PropsWithChildren } from 'react'
import { RetryHint } from '../LoadRetry/index.js'
import { Stack, Typography } from '@mui/material'
import { LoadingBase } from '@masknet/theme'
import { useSharedI18N } from '../../../locales/index.js'

interface LoadGuardProps extends PropsWithChildren {
    loading: boolean
    error?: boolean
    retry: () => void
}

export const LoadGuard = memo<LoadGuardProps>(({ loading, error, retry, children }) => {
    const t = useSharedI18N()

    if (loading) {
        return (
            <Stack gap={0.5} height="100%" justifyContent="center" alignItems="center">
                <LoadingBase />
                <Typography
                    fontSize={14}
                    fontWeight={400}
                    lineHeight="18px"
                    color={(t) => t.palette.maskColor.publicMain}>
                    {t.loading()}
                </Typography>
            </Stack>
        )
    }

    if (error) {
        return <RetryHint retry={retry} hint />
    }

    return <>{children}</>
})
