import type { TypedMessage } from '@masknet/typed-message'
import { memo } from 'react'
import {
    RedPacketMetadataReader,
    RedPacketNftMetadataReader,
    renderWithRedPacketMetadata,
    renderWithRedPacketNftMetadata,
} from './helpers.js'
import { usePluginWrapper } from '@masknet/plugin-infra/dom'
import { RedPacketInPost } from './RedPacketInPost.js'
import { RedPacketNftInPost } from './RedPacketNftInPost.js'

interface Props {
    message: TypedMessage
}

function Render(
    props: React.PropsWithChildren<{
        name: string
    }>,
) {
    usePluginWrapper(true, { name: props.name })
    return <>{props.children}</>
}

export const RedPacketInspector = memo(function RedPacketInspector(props: Props) {
    const meta = props.message.meta
    if (RedPacketMetadataReader(meta).isOk())
        return (
            <Render name="Lucky Drop">
                {renderWithRedPacketMetadata(meta, (r) => (
                    <RedPacketInPost payload={r} />
                ))}
            </Render>
        )

    if (RedPacketNftMetadataReader(meta).isOk())
        return (
            <Render name="NFT Lucky Drop">
                {renderWithRedPacketNftMetadata(props.message.meta, (r) => (
                    <RedPacketNftInPost payload={r} />
                ))}
            </Render>
        )
    return null
})
