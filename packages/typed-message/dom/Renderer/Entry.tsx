import { useMemo, useContext } from 'react'
import type { TypedMessage } from '../../base'
import { TypedMessageUnknownRenderer } from './Core/Unknown'
import { __allowTextEnlargeContext } from './utils/AllowTextEnlargeContext'
import { RegistryContext } from './utils/RegistryContext'
import { TransformerContext } from './utils/TransformContext'
export interface MetadataRenderProps {
    metadata: TypedMessage['meta']
    message: TypedMessage
}
export interface MessageRenderProps<T extends TypedMessage = TypedMessage> {
    /** The TypedMessage */
    message: T
    footerMetadataRenderer?: React.ComponentType<MetadataRenderProps>
}
export interface RenderProps extends MessageRenderProps {
    /** TODO: remove this property */
    allowTextEnlarge?: boolean
}
export function TypedMessageRender(props: RenderProps) {
    const { message } = props
    const transform = useContext(TransformerContext)
    const message2 = useMemo(() => transform(message), [message, transform])

    const Render = useContext(RegistryContext)(message.type)?.component || TypedMessageUnknownRenderer

    if (message.type === 'empty') return null
    return (
        <__allowTextEnlargeContext.Provider value={!!props.allowTextEnlarge}>
            <Render message={message2} />
        </__allowTextEnlargeContext.Provider>
    )
}
