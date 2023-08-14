import { attachReactTreeWithoutContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { Entry } from './Entry.js'
export function newPostCompositionInstagram(signal: AbortSignal) {
    attachReactTreeWithoutContainer('new-composition', <Entry />, signal)
}
