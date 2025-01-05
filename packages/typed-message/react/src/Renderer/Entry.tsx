import { useContext } from 'react'
import type { TypedMessage } from '@masknet/typed-message'
import { TypedMessageUnknownRender } from './Core/Unknown.js'
import { RegistryContext } from './utils/RegistryContext.js'
import { RenderFragmentsContext } from './utils/RenderFragments.js'
import { useTextResize } from './utils/TextResizerContext.js'
import { DebugElementProvider } from './utils/DebugElementProvider.js'
export interface RenderProps {
    message: TypedMessage
}
export function TypedMessageRender(props: RenderProps) {
    const { Container = 'p' } = useContext(RenderFragmentsContext)
    const isEmpty = props.message.type === 'empty'
    const textResize = useTextResize(!isEmpty)

    if (isEmpty) return null

    return (
        <span ref={textResize} onClick={(e) => e.stopPropagation()}>
            <Container>
                <TypedMessageRenderInline {...props} />
            </Container>
        </span>
    )
}

export function TypedMessageRenderInline(props: RenderProps) {
    const { message } = props

    const Registry = useContext(RegistryContext)
    const isDebug = useContext(DebugElementProvider)

    if (message.type === 'empty') return null

    const Render = Registry(message.type)?.component || TypedMessageUnknownRender
    if (isDebug) {
        return (
            <span
                data-kind={message.type}
                ref={(ref) => {
                    ref && Object.assign(ref, { message })
                }}>
                <Render {...message} />
            </span>
        )
    }
    return <Render {...message} />
}
