import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { makeStyles } from '@material-ui/core'
import Services from '../../../extension/service'

const settings = new LiveSelector().querySelector('.mSideMenu').enableSingleMode()
export function injectOptionsPageLinkAtFacebook() {
    if (location.hostname !== 'm.facebook.com') return
    const watcher = new MutationObserverWatcher(settings)
        .setDOMProxyOption({
            beforeShadowRootInit: { mode: 'closed' },
        })
        .startWatch({ subtree: true, childList: true })
    renderInShadowRoot(<Link></Link>, watcher.firstDOMProxy.beforeShadow)
}

const useStyle = makeStyles({
    root: {
        display: 'block',
        minHeight: 42,
        lineHeight: '42px',
        borderBottom: '1px solid rgb(233, 234, 237)',
        paddingLeft: '1em',
    },
})
function Link() {
    const style = useStyle()
    return (
        <a
            className={style.root}
            onClick={() => {
                Services.Welcome.openOptionsPage('/')
            }}>
            Maskbook Settings
        </a>
    )
}
