import { sleep, untilDocumentReady } from '../../../utils/utils'
import { isUndefined } from 'lodash-es'
import { newPostEditorFocusAnchor, newPostEditorHasFocus, newPostEditorSelector } from './selector'
import { equal } from '../../../utils/assert'

export const getFocus = async () => {
    await untilDocumentReady()
    while (isUndefined(newPostEditorSelector().evaluate())) {
        await sleep(1000)
    }

    if (!hasFocus()) {
        try {
            const i = newPostEditorFocusAnchor().evaluate()!
            i.focus()
        } catch {
            await requestManualClick()
        }
    }

    equal(hasFocus(), true, 'Failed to get focus')
}

const hasFocus = () => !isUndefined(newPostEditorHasFocus().evaluate())

const requestManualClick = async () => {
    alert('Please manually select the post box')
    while (!hasFocus()) {
        await sleep(1000)
    }
}

export const getText = () => newPostEditorSelector().evaluate()!.innerText
