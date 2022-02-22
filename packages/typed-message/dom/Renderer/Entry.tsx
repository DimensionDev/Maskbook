import { useContext } from 'react'
import type { TypedMessage } from '../../base'
import { TypedMessageUnknownRenderer as TypedMessageUnknownRender } from './Core/Unknown'
import { RegistryContext } from './utils/RegistryContext'
import { TextEnlargeContext } from './utils/TextEnlargeContext'
export interface RenderProps {
    message: TypedMessage
    /** @deprecated */
    allowTextEnlarge?: boolean
}
export function TypedMessageRender(props: RenderProps) {
    const { message } = props
    const Registry = useContext(RegistryContext)
    if (message.type === 'empty') return null

    const Render = Registry(message.type)?.component || TypedMessageUnknownRender
    if (process.env.NODE_ENV === 'development') {
        return (
            <TextEnlargeContext.Provider value={!!props.allowTextEnlarge}>
                <span
                    data-kind={message.type}
                    ref={(ref) => {
                        if (ref) (ref as any).message = message
                    }}>
                    <Render {...message} />
                </span>
            </TextEnlargeContext.Provider>
        )
    }
    return (
        <TextEnlargeContext.Provider value={!!props.allowTextEnlarge}>
            <Render {...message} />
        </TextEnlargeContext.Provider>
    )
}
