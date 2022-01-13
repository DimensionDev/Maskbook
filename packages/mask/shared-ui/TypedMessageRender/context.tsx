import { RenderRegistryContext, TransformerContext } from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { TypedMessageTransformers } from './transformer'
import { useSubscription } from 'use-subscription'

export function TypedMessageRenderContext(props: React.PropsWithChildren<{}>) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const f = useSubscription(TypedMessageTransformers.subscription)

    return (
        <RenderRegistryContext.Provider value={registry}>
            <TransformerContext.Provider value={f}>{props.children}</TransformerContext.Provider>
        </RenderRegistryContext.Provider>
    )
}
