import { useCallback } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
import { useMaskSharedTrans } from '../../../../../shared-ui/index.js'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export function useNotifyConnected() {
    const { _ } = useLingui()
    const t = useMaskSharedTrans()
    const { showSnackbar } = useCustomSnackbar()
    const { configuration } = activatedSiteAdaptorUI!
    const platform = configuration.nextIDConfig?.platform
    const notify = useCallback(() => {
        if (!platform) return
        showSnackbar(_(msg`Verify Account`), {
            variant: 'success',
            message: _(msg`Account successfully connected to persona`),
        })
    }, [t, showSnackbar])
    return notify
}
