import type { MessageRenderUIComponentsContext } from '@masknet/typed-message/dom'
import { Typography, Link } from '@mui/material'

export const Text: MessageRenderUIComponentsContext['Text'] = (props) => (
    <Typography
        sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined, display: 'inline' }}
        children={props.children}
    />
)

// TODO: provide SNS-aware #hast $link and @metion support
export const Anchor: MessageRenderUIComponentsContext['Link'] = (props) => (
    <Link
        sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
        href={props.href}
        children={props.children}
    />
)
