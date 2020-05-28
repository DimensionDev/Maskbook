import { IntervalWatcher, LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { dispatchCustomEvents, sleep, timeout } from '../../../utils/utils'
import { isMobileFacebook } from '../isMobile'
import { SocialNetworkUI } from '../../../social-network/ui'
import { untilDocumentReady } from '../../../utils/dom'

export async function openPostDialogFacebook() {
    await untilDocumentReady()
    const notActivated = isMobileFacebook
        ? new LiveSelector().querySelector<HTMLDivElement>('[role="textbox"]')
        : new LiveSelector()
              .querySelector(`[role="region"]`)
              .querySelector('textarea, [aria-multiline="true"]')
              .closest<HTMLDivElement>(1)
    const activated = new LiveSelector().querySelector<HTMLDivElement | HTMLTextAreaElement>(
        isMobileFacebook ? 'form textarea' : '.notranslate',
    )
    const dialog = new LiveSelector().querySelector<HTMLDivElement>('[role=main] [role=dialog]')
    if (notActivated.evaluate()[0]) {
        if (isMobileFacebook) {
            try {
                notActivated.evaluate()[0].click()
                await timeout(new MutationObserverWatcher(activated), 2000)
                await sleep(1000)
            } catch (e) {
                clickFailed(e)
            }
        } else {
            try {
                console.log('Awaiting to click the post box')
                const [dom1] = await timeout(new MutationObserverWatcher(notActivated), 1000)
                dom1.click()
                console.log('Non-activated post box found Stage 1', dom1)
                const [dom2] = await timeout(new IntervalWatcher(notActivated.clone().filter((x) => x !== dom1)), 3000)
                console.log('Non-activated post box found Stage 2', dom2)
                dom2.click()
                await timeout(new MutationObserverWatcher(activated), 1000)
                if (!dialog.evaluate()[0]) throw new Error('Click not working')
            } catch (e) {
                clickFailed(e)
            }
            console.log('Awaiting dialog')
        }
    }
    await sleep(500)
    try {
        await timeout(new MutationObserverWatcher(isMobileFacebook ? activated : dialog), 2000)
        console.log('Dialog appeared')
    } catch {}
    function clickFailed(e: unknown) {
        console.warn(e)
        if (!dialog.evaluate()[0]) alert('请点击输入框')
    }
}

/**
 * Access: https://(www|m).facebook.com/
 */
export async function pasteIntoPostBoxFacebook(
    text: string,
    options: Parameters<SocialNetworkUI['taskPasteIntoPostBox']>[1],
) {
    const { shouldOpenPostDialog, warningText } = options
    await untilDocumentReady()
    // Save the scrolling position
    const scrolling = document.scrollingElement || document.documentElement
    const scrollBack = ((top) => () => scrolling.scroll({ top }))(scrolling.scrollTop)

    const activated = new LiveSelector().querySelector<HTMLDivElement | HTMLTextAreaElement>(
        isMobileFacebook ? 'form textarea' : '.notranslate',
    )
    // If page is just loaded
    if (shouldOpenPostDialog) {
        await openPostDialogFacebook()
        console.log('Awaiting dialog')
    }
    try {
        const [element] = activated.evaluate()
        element.focus()
        await sleep(100)
        // HACK: the is workaround
        // https://github.com/eraeco/party.lol/blob/f63ae89b0b339b52aac12f65eb7a0865e522530a/content.js#L102
        element.querySelector('br')?.replaceWith(document.createTextNode(text))
        onToggleInput(element)
        await sleep(400)
        if (isMobileFacebook) {
            const e = document.querySelector<HTMLDivElement | HTMLTextAreaElement>('.mentions-placeholder')
            if (e) e.style.display = 'none'
        }
        // Prevent Custom Paste failed, this will cause service not available to user.
        if (!(element.innerText.includes(text) || ('value' in element && element.value.includes(text)))) {
            copyFailed()
        }
    } catch {
        copyFailed()
    }
    scrollBack()
    function copyFailed() {
        console.warn('Text not pasted to the text area')
        prompt(warningText, text)
    }
}

function onToggleInput(element: Element) {
    try {
        const init = { bubbles: true, cancelable: true }
        for (const name of ['input', 'change']) {
            element.dispatchEvent(new Event(name, init))
        }
        for (const name of ['keydown', 'keypress', 'keyup']) {
            element.dispatchEvent(new KeyboardEvent(name, init))
        }
    } catch {
        return false
    }
    return true
}
