import {
    RenderFragmentsContext,
    type RenderFragmentsContextType,
    MetadataRenderProps,
    RegistryContext,
} from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { useSubscription } from 'use-subscription'
import type { TransformationContext } from '@masknet/typed-message'
import { useMemo } from 'react'
import { Text, Link } from './Components/Text'

export interface TypedMessageRenderContextProps extends React.PropsWithChildren<{}> {
    context?: TransformationContext
    metadataRender?: React.ComponentType<MetadataRenderProps>
    renderFragments?: RenderFragmentsContextType
}

export function TypedMessageRenderContext(props: TypedMessageRenderContextProps) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    // const transformerFunction = useSubscription(TypedMessageTransformers.subscription)
    const Provider = useMemo((): RenderFragmentsContextType => {
        return { Text, Link, Metadata: props.metadataRender, ...props.renderFragments }
    }, [props.metadataRender, props.renderFragments])

    return (
        // basic render fragments provider: Text, Link, Image and Metadata
        <RenderFragmentsContext.Provider value={Provider}>
            {/* Typed message render provider: a registry */}
            <RegistryContext.Provider value={registry}>{props.children}</RegistryContext.Provider>
        </RenderFragmentsContext.Provider>
    )
}
