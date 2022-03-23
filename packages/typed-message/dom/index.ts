// Render
export { TypedMessageRender, TypedMessageRenderInline, type RenderProps } from './Renderer/Entry'
export { useMetadataRender, type MetadataRenderProps } from './Renderer/MetadataRender'

// Render behavior
export { TextResizeContext } from './Renderer/utils/TextResizerContext'
export { TUPLE_RENDER_STYLE } from './Renderer/Core/Tuple'

// Render Registry
export { type RenderConfig, createTypedMessageRenderRegistry } from './Renderer/registry'
export {
    RenderFragmentsContext,
    type RenderFragmentsContextType,
    DefaultRenderFragments,
} from './Renderer/utils/RenderFragments'
export { RegistryContext } from './Renderer/utils/RegistryContext'

// Transformation
export {
    TransformerProvider,
    useTransformedValue,
    TransformationContextProvider,
} from './Renderer/utils/TransformContext'
