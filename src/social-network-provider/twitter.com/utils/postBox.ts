import { sleep } from '../../../utils/utils'
import { newPostEditorFocusAnchor, newPostEditorSelector } from './selector'
import { equal } from '../../../utils/assert'
import { untilDocumentReady, untilElementAvailable } from '../../../utils/dom'
import { LiveSelector } from '@holoflows/kit'

export const postBoxInPopup = () => {
    return globalThis.location.pathname.includes('compose')
}

export const getFocus = async () => {
    await sleep(2000)
    await untilDocumentReady()
    await untilElementAvailable(newPostEditorSelector())

    const i = newPostEditorFocusAnchor()

    if (!hasFocus(i)) {
        try {
            i.evaluate()!.focus()
        } catch {
            await requestManualClick()
        }
    }

    equal(hasFocus(i), true, 'Failed to get focus')
}

const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

const requestManualClick = async () => {
    const i = newPostEditorFocusAnchor()
    alert('Please manually select the post box')
    while (!hasFocus(i)) {
        await sleep(1000)
    }
}

export const getText = () => newPostEditorSelector().evaluate()!.innerText
