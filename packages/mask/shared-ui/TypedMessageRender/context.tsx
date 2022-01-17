import { RenderRegistryContext, TransformerContext } from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { TypedMessageTransformers } from './transformer'
import { useSubscription } from 'use-subscription'
import type { TransformationContext } from '@masknet/typed-message/base'
import { useMemo } from 'react'

export function TypedMessageRenderContext(props: React.PropsWithChildren<{ context?: TransformationContext }>) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const f = useSubscription(TypedMessageTransformers.subscription)
    const val = useMemo(() => [f, props.context] as const, [f, props.context])

    return (
        <RenderRegistryContext.Provider value={registry}>
            <TransformerContext.Provider value={val}>{props.children}</TransformerContext.Provider>
        </RenderRegistryContext.Provider>
    )
}
