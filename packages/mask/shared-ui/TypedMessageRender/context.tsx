import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { emptyTransformationContext, type TransformationContext } from '@masknet/typed-message'
import {
    RenderFragmentsContext,
    type RenderFragmentsContextType,
    type MetadataRenderProps,
    RegistryContext,
    TransformerProvider,
    TransformationContextProvider,
    TextResizeContext,
    type TextResizer,
} from '@masknet/typed-message-react'
import { TypedMessageRenderRegistry } from './registry.js'
import { Container, Link } from './Components/Text.js'
import { TypedMessageTransformers } from './transformer.js'

interface TypedMessageRenderContextProps extends React.PropsWithChildren {
    context?: TransformationContext
    metadataRender?: React.ComponentType<MetadataRenderProps>
    renderFragments?: RenderFragmentsContextType
    textResizer?: TextResizer | boolean
}

export function TypedMessageRenderContext(props: TypedMessageRenderContextProps) {
    const registry = useSubscription(TypedMessageRenderRegistry.subscription)
    const transformerFunction = useSubscription(TypedMessageTransformers.subscription)
    const Provider = useMemo((): RenderFragmentsContextType => {
        return { Container, Link, Metadata: props.metadataRender, ...props.renderFragments }
    }, [props.metadataRender, props.renderFragments])

    return (
        <TextResizeContext value={props.textResizer ?? true}>
            {/* basic render fragments provider: Text, Link, Image and Metadata */}
            <RenderFragmentsContext value={Provider}>
                {/* transformer pipeline */}
                <TransformerProvider value={transformerFunction}>
                    {/* transformation context */}
                    <TransformationContextProvider value={props.context || emptyTransformationContext}>
                        {/* components provider */}
                        <RegistryContext value={registry}>{props.children}</RegistryContext>
                    </TransformationContextProvider>
                </TransformerProvider>
            </RenderFragmentsContext>
        </TextResizeContext>
    )
}
