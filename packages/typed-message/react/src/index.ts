// Render
export { TypedMessageRender, TypedMessageRenderInline, type RenderProps } from './Renderer/Entry.js'
export { useMetadataRender, type MetadataRenderProps } from './Renderer/MetadataRender.js'

// Render behavior
export { TextResizeContext, type TextResizer } from './Renderer/utils/TextResizerContext.js'
export { DebugElementProviderContext as DebugElementProvider } from './Renderer/utils/DebugElementProvider.js'

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
    TransformerProviderContext as TransformerProvider,
    useTransformedValue,
    TransformationContextProviderContext as TransformationContextProvider,
} from './Renderer/utils/TransformContext.js'

// Metadata
export {
    createRenderWithMetadata,
    createTypedMessageMetadataReader,
    editTypedMessageMeta,
    getKnownMetadataKeys,
    getMetadataSchema,
    isDataMatchJSONSchema,
    readTypedMessageMetadataUntyped,
    registerMetadataSchema,
    renderWithMetadataUntyped,
} from './Metadata/index.js'
