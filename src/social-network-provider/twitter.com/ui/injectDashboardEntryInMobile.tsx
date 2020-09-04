import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit/es'
import React from 'react'
import { DashboardRoute } from '../../../extension/options-page/Route'
import Services from '../../../extension/service'
import { MaskbookIcon } from '../../../resources/Maskbook-Circle-WhiteGraph-BlueBackground'
import { Flags } from '../../../utils/flags'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { isMobileTwitter } from '../utils/isMobile'

export function injectDashboardEntryInMobileTwitter() {
    if (!isMobileTwitter) return
    const ls = new LiveSelector().querySelector('nav[role="navigation"] a:last-of-type').enableSingleMode()
    new MutationObserverWatcher(ls)
        .setDOMProxyOption({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
        .useForeach((e, k, meta) => {
            return renderInShadowRoot(
                <MaskbookIcon onClick={() => Services.Welcome.openOptionsPage()} style={{ zoom: 1.25 }} />,
                {
                    normal: () => meta.after,
                    shadow: () => meta.afterShadow,
                    rootProps: {
                        style: {
                            display: 'flex',
                            width: '20vw',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                    },
                },
            )
        })
        .startWatch({ subtree: true, childList: true })
}
