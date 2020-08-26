import React from 'react'
import { makeStyles } from '@material-ui/core'
import { PageInspector, PageInspectorProps } from '../../components/InjectedComponents/PageInspector'
import { renderInShadowRoot } from '../../utils/jss/renderInShadowRoot'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { Flags } from '../../utils/flags'

export function injectPageInspectorDefault<T extends string>(
    config: InjectPageInspectorDefaultConfig = {},
    additionalPropsToPageInspector: (classes: Record<T, string>) => Partial<PageInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PageInspectorDefault = React.memo(function PageInspectorDefault() {
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPageInspector(classes)
        return <PageInspector {...additionalProps} />
    })

    return function injectPageInspector() {
        const watcher = new MutationObserverWatcher(new LiveSelector().querySelector('body'))
            .setDOMProxyOption({
                afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
            })
            .startWatch({
                childList: true,
                subtree: true,
            })

        return renderInShadowRoot(<PageInspectorDefault />, {
            shadow: () => watcher.firstDOMProxy.afterShadow,
            normal: () => watcher.firstDOMProxy.after,
        })
    }
}

interface InjectPageInspectorDefaultConfig {}
