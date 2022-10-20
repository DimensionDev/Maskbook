import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { PageInspector, PageInspectorProps } from '../../../components/InjectedComponents/PageInspector.js'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'

export interface InjectPageInspectorDefaultConfig {}

export function injectPageInspectorDefault<T extends string>(
    config: InjectPageInspectorDefaultConfig = {},
    additionalPropsToPageInspector: (classes: Record<T, string>) => Partial<PageInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => {
        classes: Record<T, string>
    } = makeStyles()({}) as any,
) {
    const PageInspectorDefault = memo(function PageInspectorDefault() {
        const { classes } = useCustomStyles()
        const additionalProps = additionalPropsToPageInspector(classes)
        return <PageInspector {...additionalProps} />
    })

    return function injectPageInspector(signal: AbortSignal) {
        const dom = document.body
            .appendChild(document.createElement('div'))
            .attachShadow({ mode: process.env.shadowRootMode })

        createReactRootShadowed(dom, { signal, key: 'page-inspector' }).render(<PageInspectorDefault />)
    }
}
