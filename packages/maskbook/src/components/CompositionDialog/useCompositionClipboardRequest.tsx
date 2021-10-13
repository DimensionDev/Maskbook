import { useCallback } from 'react'
import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'
import type { CompositionProps } from './CompositionUI'

export function useCompositionClipboardRequest(
    requireClipboardPermission: boolean,
): Pick<CompositionProps, 'hasClipboardPermission' | 'requireClipboardPermission' | 'onRequestClipboardPermission'> {
    const { retry, value: hasClipboardPermission = true } = useAsyncRetry(async () => {
        if (!requireClipboardPermission) return true
        return Services.Helper.queryExtensionPermission({ permissions: ['clipboardRead'] })
    }, [requireClipboardPermission])

    const onRequestClipboardPermission = useCallback(() => {
        if (!requireClipboardPermission) return
        Services.Helper.requestExtensionPermission({ permissions: ['clipboardRead'] }).finally(retry)
    }, [requireClipboardPermission, retry])

    return {
        requireClipboardPermission,
        hasClipboardPermission,
        onRequestClipboardPermission,
    }
}
