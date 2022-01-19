import type { TypedMessageMaskPayload } from '@masknet/typed-message/base'
import { MessageRenderProps, TypedMessageRender } from '@masknet/typed-message/dom'
import { styled } from '@mui/material'
export function MaskPayloadRender(props: MessageRenderProps<TypedMessageMaskPayload>) {
    return (
        <Round>
            <TypedMessageRender message={props.message.message} />
        </Round>
    )
}

const Round = styled('span')`
    border: 1px solid green;
`
