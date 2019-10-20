import { defineSocialNetworkUI, definedSocialNetworkUIs, SocialNetworkUI } from '../../social-network/ui'
import '../../provider.ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import { GetContext } from '@holoflows/kit/es'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'

const popupPageUISelf = defineSocialNetworkUI({
    ...emptyDefinition,
    internalName: 'Popup page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
        const activeTab = ((await browser.tabs.query({ active: true, currentWindow: true })) || [])[0]
        const location = new URL(activeTab.url || window.location.href)
        for (const ui of definedSocialNetworkUIs) {
            if (ui.shouldActivate(location) && ui.networkIdentifier !== 'localhost') {
                popupPageUISelf.networkIdentifier = ui.networkIdentifier
                InitMyIdentitiesValueRef(popupPageUISelf, ui.networkIdentifier)
                return
            }
        }
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
