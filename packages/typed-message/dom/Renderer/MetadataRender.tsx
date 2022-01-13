import type { TypedMessage } from '../../base'
import type { MessageRenderProps } from './Entry'

/** @internal */
export function withMetadata(props: MessageRenderProps<TypedMessage>, jsx: React.ReactNode) {
    const FooterMetadada = props.footerMetadataRenderer || DefaultMetadataRender
    return (
        <>
            {jsx}
            <FooterMetadada metadata={props.message.meta} message={props.message} />
        </>
    )
}

export function DefaultMetadataRender() {
    return null
}
