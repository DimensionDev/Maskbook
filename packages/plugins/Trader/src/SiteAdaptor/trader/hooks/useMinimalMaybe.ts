import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { Sniffings } from '@masknet/shared-base'
import { useRef } from 'react'

export function useActivatedPlugins(mode: boolean | 'any' = true) {
    const isPopup = useRef(Sniffings.is_popup_page).current
    if (isPopup) {
        console.warn('Workaround: refactor needed. useActivatedPlugins should not be called in popup.')
        return []
    }

    // I know what I'm doing.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useActivatedPluginsSiteAdaptor(mode)
}
