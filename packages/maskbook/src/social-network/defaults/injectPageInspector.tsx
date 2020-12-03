import { memo } from 'react'
import { makeStyles } from '@material-ui/core'
import { PageInspector, PageInspectorProps } from '../../components/InjectedComponents/PageInspector'
import { renderInShadowRoot } from '../../utils/shadow-root/renderInShadowRoot'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { startWatch } from '../../utils/watcher'

export function injectPageInspectorDefault<T extends string>(
    config: InjectPageInspectorDefaultConfig = {},
    additionalPropsToPageInspector: (classes: Record<T, string>) => Partial<PageInspectorProps> = () => ({}),
    useCustomStyles: (props?: any) => Record<T, string> = makeStyles({}) as any,
) {
    const PageInspectorDefault = memo(function PageInspectorDefault() {
        const classes = useCustomStyles()
        const additionalProps = additionalPropsToPageInspector(classes)
        return <PageInspector {...additionalProps} />
    })

    return function injectPageInspector() {
        const watcher = new MutationObserverWatcher(new LiveSelector().querySelector('body'))
        startWatch(watcher)
        return renderInShadowRoot(<PageInspectorDefault />, { shadow: () => watcher.firstDOMProxy.afterShadow })
    }
}

interface InjectPageInspectorDefaultConfig {}
