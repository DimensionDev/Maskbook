import Services from '#services'
import { MaskMessages, Sniffings, type PopupRoutes, type PopupRoutesParamsMap } from '@masknet/shared-base'
import urlcat from 'urlcat'

export async function openPopupWindow<T extends PopupRoutes>(
    route: T,
    params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
): Promise<void> {
    if (Sniffings.is_popup_page) {
        MaskMessages.events.popupRouteUpdated.sendToAll(urlcat(route, params || {}))
        return
    }
    return Services.Helper.openPopupWindow(route, params)
}
