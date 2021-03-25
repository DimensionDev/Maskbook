import { Flags } from '../../../utils/flags'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { Entry } from './Entry'
export function newPostCompositionInstagram(signal: AbortSignal) {
    const container = document.createElement('div')
    const shadow = container.attachShadow({ mode: Flags.using_ShadowDOM_attach_mode })

    renderInShadowRoot(<Entry />, {
        shadow: () => shadow,
        concurrent: true,
        signal,
    })

    document.body.appendChild(container)
    signal.addEventListener('abort', () => container.remove())
}
