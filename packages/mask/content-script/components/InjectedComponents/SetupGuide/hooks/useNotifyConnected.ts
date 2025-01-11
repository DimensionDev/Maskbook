import { useCallback } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'

export function useNotifyConnected() {
    const { _ } = useLingui()
    const { showSnackbar } = useCustomSnackbar()
    const { configuration } = activatedSiteAdaptorUI!
    const platform = configuration.nextIDConfig?.platform
    const notify = useCallback(() => {
        if (!platform) return
        showSnackbar(_(msg`Verify Account`), {
            variant: 'success',
            message: _(msg`Account successfully connected to persona`),
        })
    }, [_, showSnackbar])
    return notify
}
