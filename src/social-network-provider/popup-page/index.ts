import { defineSocialNetworkUI, definedSocialNetworkUIs, SocialNetworkUI } from '../../social-network/ui'
import '../../provider.ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import { GetContext, ValueRef } from '@dimensiondev/holoflows-kit/es'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'

export const hasPermissionCheckAtPopupPage = new ValueRef(true)
const popupPageUISelf = defineSocialNetworkUI({
    ...emptyDefinition,
    internalName: 'Popup page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
        const activeTab = ((await browser.tabs.query({ active: true, currentWindow: true })) || [])[0]
        if (activeTab === undefined) return
        const location = new URL(activeTab.url || globalThis.location.href)
        for (const ui of definedSocialNetworkUIs) {
            if (ui.shouldActivate(location) && ui.networkIdentifier !== 'localhost') {
                popupPageUISelf.networkIdentifier = ui.networkIdentifier
                popupPageUISelf.hasPermission = ui.hasPermission.bind(ui)
                popupPageUISelf.requestPermission = ui.requestPermission.bind(ui)
                InitMyIdentitiesValueRef(popupPageUISelf, ui.networkIdentifier)
                return
            }
        }
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
