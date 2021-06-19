import type { TypedMessage } from '../../../protocols/typed-message'
import { renderWithRedPacketMetadata } from '../helpers'
import { RedPacketInPost } from './RedPacketInPost'

export interface RedPacketInspectorProps {
    message: TypedMessage
}

export function RedPacketInspector(props: RedPacketInspectorProps) {
    if (process.env.STORYBOOK) return null

    return renderWithRedPacketMetadata(props.message.meta, (r) => {
        return <RedPacketInPost payload={r} />
    })
}
