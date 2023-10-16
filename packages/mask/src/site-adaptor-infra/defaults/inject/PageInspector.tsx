import { memo } from 'react'
import { PageInspector } from '../../../components/InjectedComponents/PageInspector.js'
import { attachReactTreeWithoutContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'

export function injectPageInspectorDefault() {
    const PageInspectorDefault = memo(function PageInspectorDefault() {
        return <PageInspector />
    })

    return function injectPageInspector(signal: AbortSignal) {
        attachReactTreeWithoutContainer('page-inspector', <PageInspectorDefault />, signal)
    }
}
