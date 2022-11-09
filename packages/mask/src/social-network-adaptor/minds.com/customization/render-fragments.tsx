import type { RenderFragmentsContextType } from '@masknet/typed-message-react'
import { memo } from 'react'
import { Link } from '@mui/material'
import { useTagEnhancer } from '../../../../shared-ui/TypedMessageRender/Components/Text.js'

export const MindsRenderFragments: RenderFragmentsContextType = {
    AtLink: memo(function (props) {
        const target = '/' + props.children.slice(1)
        return <Link fontSize="inherit" href={target} children={props.children} />
    }),
    HashLink: memo(function (props) {
        const text = props.children.slice(1)
        const target = `/discovery/search?q=%23${encodeURIComponent(text)}`
        const { hasMatch, ...events } = useTagEnhancer('hash', text)
        return (
            <Link
                {...events}
                fontSize="inherit"
                href={target}
                children={props.children}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            />
        )
    }),
    CashLink: memo(function (props) {
        const text = props.children.slice(1)
        const target = `/discovery/search?q=$${encodeURIComponent(text)}`
        const { hasMatch, ...events } = useTagEnhancer('cash', text)
        return (
            <Link
                {...events}
                fontSize="inherit"
                href={target}
                children={props.children}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            />
        )
    }),
    Image: () => null,
}
