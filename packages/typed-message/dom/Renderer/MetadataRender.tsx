import { useContext } from 'react'
import { MessageRenderUIComponentsContext } from './utils/ComponentsContext'
import type { TypedMessage } from '../../base'

export function withMetadata(props: TypedMessage, jsx: React.ReactElement) {
    const { Metadata } = useContext(MessageRenderUIComponentsContext)
    if (!Metadata) return jsx
    return (
        <>
            {jsx}
            <Metadata metadata={props.meta} message={props} />
        </>
    )
}
