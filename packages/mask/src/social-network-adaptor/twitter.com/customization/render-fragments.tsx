import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'
import { memo } from 'react'
import { Link } from '@mui/material'
import { useTagEnhancer } from '../../../../shared-ui/TypedMessageRender/Components/Text'
export const TwitterRenderFragments: RenderFragmentsContextType = {
    AtLink: memo(function (props) {
        const target = '/' + props.children.slice(1)
        return (
            <Link
                sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
                href={target}
                children={props.children}
            />
        )
    }),
    HashLink: memo(function (props) {
        const target = '/hashtag/' + encodeURIComponent(props.children.slice(1))
        return (
            <Link
                {...useTagEnhancer('hash', props.children.slice(1))}
                sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
                href={target}
                children={props.children}
            />
        )
    }),
    CashLink: memo(function (props) {
        const target = `/search?q=${encodeURIComponent(props.children)}&src=cashtag_click`
        return (
            <Link
                {...useTagEnhancer('cash', props.children.slice(1))}
                sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
                href={target}
                children={props.children}
            />
        )
    }),
}
