import { memo } from 'react'
import { Button, Stack } from '@mui/material'
import { useI18N } from '../../../../utils'

interface RetryHintProps {
    retry(): void
}

export const RetryHint = memo<RetryHintProps>(({ retry }) => {
    const { t } = useI18N()
    return (
        <Stack justifyContent="center" direction="row">
            <Button onClick={retry}>{t('plugin_collectible_retry')}</Button>
        </Stack>
    )
})
