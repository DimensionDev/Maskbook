import { useCallback } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
import { useMaskSharedTrans } from '../../../../../shared-ui/index.js'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'

export function useNotifyConnected() {
    const t = useMaskSharedTrans()
    const { showSnackbar } = useCustomSnackbar()
    const { configuration } = activatedSiteAdaptorUI!
    const platform = configuration.nextIDConfig?.platform
    const notify = useCallback(() => {
        if (!platform) return
        showSnackbar(t.setup_guide_connected_title(), {
            variant: 'success',
            message: t.setup_guide_connected_description(),
        })
    }, [t, showSnackbar])
    return notify
}
