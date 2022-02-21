import {
    MessageRenderUIComponentsContext,
    MetadataRenderProps,
    RenderRegistryContext,
    TransformerContext,
} from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { TypedMessageTransformers } from './transformer'
import { useSubscription } from 'use-subscription'
import { emptyTransformationContext, TransformationContext } from '@masknet/typed-message'
import { useMemo } from 'react'
import { Text, Anchor as Link } from './Components/Text'

export interface TypedMessageRenderContextProps extends React.PropsWithChildren<{}> {
    context?: TransformationContext
    metadataRender?: React.ComponentType<MetadataRenderProps>
}

export function TypedMessageRenderContext(props: TypedMessageRenderContextProps) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const f = useSubscription(TypedMessageTransformers.subscription)
    const val = useMemo(() => {
        return [f, props.context || emptyTransformationContext] as const
    }, [f, props.context])
    const Provider = useMemo((): MessageRenderUIComponentsContext => {
        return { Text, Link, Metadata: props.metadataRender }
    }, [props.metadataRender])

    return (
        <MessageRenderUIComponentsContext.Provider value={Provider}>
            <RenderRegistryContext.Provider value={registry}>
                <TransformerContext.Provider value={val}>{props.children}</TransformerContext.Provider>
            </RenderRegistryContext.Provider>
        </MessageRenderUIComponentsContext.Provider>
    )
}
