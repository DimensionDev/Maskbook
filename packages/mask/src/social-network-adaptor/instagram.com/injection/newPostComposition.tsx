import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { Entry } from './Entry'
export function newPostCompositionInstagram(signal: AbortSignal) {
    const container = document.createElement('div')
    const shadow = container.attachShadow({ mode: 'closed' })

    createReactRootShadowed(shadow, { signal }).render(<Entry />)

    document.body.appendChild(container)
    signal.addEventListener('abort', () => container.remove())
}
