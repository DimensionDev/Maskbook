import { v4 as uuid } from 'uuid'
import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'
import { lastActivatedTabIdSettings } from '../settings/settings'
import { sideEffect } from '../utils/side-effects'
import { untilDocumentReady } from '../utils/dom'

OnlyRunInContext(['content', 'options', 'debugging'], 'tab')

export const TAB_ID = uuid() // create an id for every tab

const setId = () => {
    if (document.visibilityState === 'visible') console.log(`set id to ${TAB_ID}`)
    if (document.visibilityState === 'visible') lastActivatedTabIdSettings.value = TAB_ID
}

sideEffect.then(untilDocumentReady).then(() => {
    if (typeof location !== 'undefined' && location.href.includes('popup.html')) return
    setId()
    document.addEventListener('visibilitychange', setId)
    window.onfocus = setId // https://stackoverflow.com/a/7389367/1986338
    if (process.env.NODE_ENV === 'development') console.log(`The tab id is ${TAB_ID}.`)
})
