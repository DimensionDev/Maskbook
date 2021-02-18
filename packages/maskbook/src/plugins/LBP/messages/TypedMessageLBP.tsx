import { useState } from 'react'
import { Link, Typography } from '@material-ui/core'
import { registerTypedMessageRenderer, TypedMessageAnchor } from '../../../protocols/typed-message'
import type { TypedMessageRendererProps } from '../../../components/InjectedComponents/TypedMessageRenderer'
import { PluginLBP_Messages } from '../messages'
import { TagType } from '../../Trader/types'

export interface TypedMessageLBP extends Omit<TypedMessageAnchor, 'type'> {
    readonly type: 'x-lbp'
    readonly name: string
}

export function makeTypedMessageLBP(message: TypedMessageAnchor) {
    return {
        ...message,
        type: 'x-lbp',
        name: message.content.substr(1).toLowerCase(),
    } as TypedMessageLBP
}

registerTypedMessageRenderer('x-lbp', {
    component: DefaultTypedMessageLBP_Render,
    id: 'com.maskbook.lbp.x-lbp',
    priority: 0,
})

function DefaultTypedMessageLBP_Render(props: TypedMessageRendererProps<TypedMessageLBP>) {
    const [openTimer, setOpenTimer] = useState<NodeJS.Timeout | null>(null)
    const onMouseOver = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        // cache for async operations
        const element = ev.currentTarget
        if (openTimer !== null) clearTimeout(openTimer)
        setOpenTimer(
            setTimeout(async () => {
                if (props.message.category !== 'hash') return
                const { name, category } = props.message
                PluginLBP_Messages.events.tagObserved.sendToLocal({
                    name,
                    type: TagType.HASH,
                    element,
                })
            }, 500),
        )
    }
    const onMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (openTimer !== null) clearTimeout(openTimer)
    }
    const onClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        ev.stopPropagation()
    }

    return (
        <Typography component="span" color="textPrimary" variant="body1">
            <Link href={props.message.href} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} onClick={onClick}>
                {props.message.content}
            </Link>
        </Typography>
    )
}
