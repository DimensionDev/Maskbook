import { emptyTransformationContext, TransformationContext } from '@masknet/typed-message'
import {
    RenderFragmentsContext,
    type RenderFragmentsContextType,
    MetadataRenderProps,
    RegistryContext,
    TransformerProvider,
    TransformationContextProvider,
} from '@masknet/typed-message-react'
import { TypedMessageRenderRegistry } from './registry.js'
import { useSubscription } from 'use-subscription'
import { useMemo } from 'react'
import { Container, Link } from './Components/Text.js'
import { TypedMessageTransformers } from './transformer.js'

export interface TypedMessageRenderContextProps extends React.PropsWithChildren<{}> {
    context?: TransformationContext
    metadataRender?: React.ComponentType<MetadataRenderProps>
    renderFragments?: RenderFragmentsContextType
}

export function TypedMessageRenderContext(props: TypedMessageRenderContextProps) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const transformerFunction = useSubscription(TypedMessageTransformers.subscription)
    const Provider = useMemo((): RenderFragmentsContextType => {
        return { Container, Link, Metadata: props.metadataRender, ...props.renderFragments }
    }, [props.metadataRender, props.renderFragments])

    return (
        // basic render fragments provider: Text, Link, Image and Metadata
        <RenderFragmentsContext.Provider value={Provider}>
            {/* transformer pipeline */}
            <TransformerProvider.Provider value={transformerFunction}>
                {/* transformation context */}
                <TransformationContextProvider.Provider value={props.context || emptyTransformationContext}>
                    {/* components provider */}
                    <RegistryContext.Provider value={registry}>{props.children}</RegistryContext.Provider>
                </TransformationContextProvider.Provider>
            </TransformerProvider.Provider>
        </RenderFragmentsContext.Provider>
    )
}
