import { MessageRenderUIComponentsContext, MetadataRenderProps, RegistryContext } from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { useSubscription } from 'use-subscription'
import type { TransformationContext } from '@masknet/typed-message'
import { useMemo } from 'react'
import { Text, Anchor as Link } from './Components/Text'

export interface TypedMessageRenderContextProps extends React.PropsWithChildren<{}> {
    context?: TransformationContext
    metadataRender?: React.ComponentType<MetadataRenderProps>
}

export function TypedMessageRenderContext(props: TypedMessageRenderContextProps) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    // const transformerFunction = useSubscription(TypedMessageTransformers.subscription)
    const Provider = useMemo((): MessageRenderUIComponentsContext => {
        return { Text, Link, Metadata: props.metadataRender }
    }, [props.metadataRender])

    return (
        // basic components provider: Text, Link, Image and Metadata
        <MessageRenderUIComponentsContext.Provider value={Provider}>
            {/* Typed message render provider: a registry */}
            <RegistryContext.Provider value={registry}>{props.children}</RegistryContext.Provider>
        </MessageRenderUIComponentsContext.Provider>
    )
}
