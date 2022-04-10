// Render
export { TypedMessageRender, TypedMessageRenderInline, type RenderProps } from './Renderer/Entry.js'
export { useMetadataRender, type MetadataRenderProps } from './Renderer/MetadataRender.js'

// Render behavior
export { TextResizeContext } from './Renderer/utils/TextResizerContext.js'
export { TUPLE_RENDER_STYLE } from './Renderer/Core/Tuple.js'

// Render Registry
export { type RenderConfig, createTypedMessageRenderRegistry } from './Renderer/registry.js'
export {
    RenderFragmentsContext,
    type RenderFragmentsContextType,
    DefaultRenderFragments,
} from './Renderer/utils/RenderFragments.js'
export { RegistryContext } from './Renderer/utils/RegistryContext.js'

// Transformation
export {
    TransformerProvider,
    useTransformedValue,
    TransformationContextProvider,
} from './Renderer/utils/TransformContext.js'
