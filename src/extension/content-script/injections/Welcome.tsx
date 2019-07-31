import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { Banner } from '../../../components/Welcomes/Banner'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import Services from '../../service'
import { getStorage, setStorage } from '../../../utils/browser.storage'
import { isMobile } from '../../../social-network-provider/facebook.com/isMobile'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'

async function main() {
    const ids = await Services.People.queryMyIdentity()
    const storage = await getStorage()
    if (ids.length) return
    if (storage.userDismissedWelcome) return
    const to = new MutationObserverWatcher(
        new LiveSelector().querySelector<HTMLDivElement>(isMobile ? '#MComposer' : '#pagelet_composer'),
    )
        .enableSingleMode()
        .setDomProxyOption({ beforeShadowRootInit: { mode: 'closed' } })
        .startWatch()
    const unmount = renderInShadowRoot(<BannerContainer unmount={() => unmount()} />, to.firstVirtualNode.beforeShadow)
}
main()
function BannerContainer({ unmount }: { unmount: () => void }) {
    const id = useLastRecognizedIdentity().identifier
    return (
        <Banner
            disabled={id.isUnknown}
            close={() => {
                setStorage({ userDismissedWelcome: true })
                unmount()
            }}
            getStarted={() => {
                unmount()
                Services.Welcome.openWelcomePage(id)
            }}
        />
    )
}
