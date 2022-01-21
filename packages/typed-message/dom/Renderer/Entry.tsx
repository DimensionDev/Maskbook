import { useContext } from 'react'
import type { TypedMessage } from '../../base'
import { TypedMessageUnknownRenderer as TypedMessageUnknownRender } from './Core/Unknown'
import { __allowTextEnlargeContext } from './utils/AllowTextEnlargeContext'
import { RegistryContext } from './utils/RegistryContext'
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
    const Registry = useContext(RegistryContext)
    if (message.type === 'empty') return null

    const Render = Registry(message.type)?.component || TypedMessageUnknownRender
    return (
        <__allowTextEnlargeContext.Provider value={!!props.allowTextEnlarge}>
            <Render message={message} />
        </__allowTextEnlargeContext.Provider>
    )
}
