import { useCallback } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'

export function useNotifyConnected() {
    const { _ } = useLingui()
    const { showSnackbar } = useCustomSnackbar()
    const notify = useCallback(() => {
        showSnackbar(_(msg`Verify Account`), {
            variant: 'success',
            message: _(msg`Account successfully connected to persona`),
        })
    }, [_, showSnackbar])
    return notify
}
