import type { TypedMessageMaskPayload } from '@masknet/typed-message/base'
import { TypedMessageRender } from '@masknet/typed-message/dom'
import { styled } from '@mui/material'
import { MaskBlueIcon } from '@masknet/icons'
import { ShadowRootTooltip } from '../shadow-root/ShadowRootComponents'

export function MaskPayloadRender(props: TypedMessageMaskPayload) {
    return (
        <Round>
            <ShadowRootTooltip title="Decrypted by Mask">
                <Icon />
            </ShadowRootTooltip>
            <TypedMessageRender message={props.message} />
        </Round>
    )
}

const Icon = styled(MaskBlueIcon)`
    float: right;
    margin-left: 6px;
`
const Round = styled('div')`
    border: 1px solid rgb(28, 104, 243);
    padding: 0px 6px;
    display: inline-block;
`
