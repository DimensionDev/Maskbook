import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'
import { memo } from 'react'
import { Link } from '@mui/material'
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
        const target = '/hashtag/' + props.children.slice(1)
        return (
            <Link
                sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
                href={target}
                children={props.children}
            />
        )
    }),
}
