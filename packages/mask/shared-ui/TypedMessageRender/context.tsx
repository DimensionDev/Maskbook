import { MessageRenderUIComponentsContext, RenderRegistryContext, TransformerContext } from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { TypedMessageTransformers } from './transformer'
import { useSubscription } from 'use-subscription'
import { emptyTransformationContext, TransformationContext } from '@masknet/typed-message/base'
import { useMemo } from 'react'
import { Text, Anchor } from './Components/Text'

export function TypedMessageRenderContext(props: React.PropsWithChildren<{ context?: TransformationContext }>) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const f = useSubscription(TypedMessageTransformers.subscription)
    const val = useMemo(() => {
        return [f, props.context || emptyTransformationContext] as const
    }, [f, props.context])

    return (
        <MessageRenderUIComponentsContext.Provider value={{ Text, Link: Anchor }}>
            <RenderRegistryContext.Provider value={registry}>
                <TransformerContext.Provider value={val}>{props.children}</TransformerContext.Provider>
            </RenderRegistryContext.Provider>
        </MessageRenderUIComponentsContext.Provider>
    )
}
