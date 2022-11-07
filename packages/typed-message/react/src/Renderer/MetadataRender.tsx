import { useContext } from 'react'
import { RenderFragmentsContext } from './utils/RenderFragments.js'
import type { TypedMessage } from '@masknet/typed-message'

export interface MetadataRenderProps {
    metadata: TypedMessage['meta']
    message: TypedMessage
}
export function useMetadataRender(message: TypedMessage) {
    const { Metadata } = useContext(RenderFragmentsContext)
    if (!Metadata || !message.meta) return null
    return <Metadata metadata={message.meta} message={message} />
}
