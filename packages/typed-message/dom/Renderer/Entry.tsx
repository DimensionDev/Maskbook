import { useContext } from 'react'
import type { TypedMessage } from '../../base/index.js'
import { TypedMessageUnknownRenderer as TypedMessageUnknownRender } from './Core/Unknown.js'
import { RegistryContext } from './utils/RegistryContext.js'
import { RenderFragmentsContext } from './utils/RenderFragments.js'
import { useTextResize } from './utils/TextResizerContext.js'
export interface RenderProps {
    message: TypedMessage
}
export function TypedMessageRender(props: RenderProps) {
    const { Container = 'p' } = useContext(RenderFragmentsContext)
    const isEmpty = props.message.type === 'empty'
    const textResize = useTextResize(!isEmpty)

    if (isEmpty) return null

    return (
        <span ref={textResize}>
            <Container>
                <TypedMessageRenderInline {...props} />
            </Container>
        </span>
    )
}

export function TypedMessageRenderInline(props: RenderProps) {
    const { message } = props

    const Registry = useContext(RegistryContext)
    if (message.type === 'empty') return null

    const Render = Registry(message.type)?.component || TypedMessageUnknownRender
    if (process.env.NODE_ENV === 'development') {
        return (
            <span
                data-kind={message.type}
                ref={(ref) => {
                    if (ref) (ref as any).message = message
                }}>
                <Render {...message} />
            </span>
        )
    }
    return <Render {...message} />
}
