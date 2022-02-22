import { emptyTransformationContext, TransformationContext } from '@masknet/typed-message'
import {
    RenderFragmentsContext,
    type RenderFragmentsContextType,
    MetadataRenderProps,
    RegistryContext,
    TransformerProvider,
    TransformationContextProvider,
} from '@masknet/typed-message/dom'
import { TypedMessageRenderRegistry } from './registry'
import { useSubscription } from 'use-subscription'
import { useMemo } from 'react'
import { Text, Link } from './Components/Text'
import { TypedMessageTransformers } from './transformer'

export interface TypedMessageRenderContextProps extends React.PropsWithChildren<{}> {
    context?: TransformationContext
    metadataRender?: React.ComponentType<MetadataRenderProps>
    renderFragments?: RenderFragmentsContextType
}

export function TypedMessageRenderContext(props: TypedMessageRenderContextProps) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const transformerFunction = useSubscription(TypedMessageTransformers.subscription)
    const Provider = useMemo((): RenderFragmentsContextType => {
        return { Text, Link, Metadata: props.metadataRender, ...props.renderFragments }
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
