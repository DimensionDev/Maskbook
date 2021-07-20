import { Card, CardContent, Typography, CardActions, Button } from '@material-ui/core'
import { hostConfig } from '../host'
import type { Component } from './index'
import { useRef } from 'react'
export const MaskCard: Component<MaskCardProps> = (props) => {
    const ref = useRef<HTMLDivElement>(null)
    return (
        <Card ref={ref}>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {String(props.caption)}
                </Typography>
                <Typography variant="h5" component="div">
                    <slot name="title" />
                </Typography>
                <Typography variant="body2" component="p">
                    <slot />
                </Typography>
            </CardContent>
            <CardActions>
                <Button
                    onClick={() => {
                        const base = getContext(ref.current)?.trim()
                        const url = base ? new URL(props.href, base) : new URL(props.href)
                        hostConfig.permissionAwareOpen(url.toString())
                    }}
                    size="small">
                    {String(props.button)}
                </Button>
            </CardActions>
        </Card>
    )
}
MaskCard.displayName = 'mask-card'
export interface MaskCardProps {
    caption: string
    title: string
    button: string
    href: string
}
function getContext(node: Node | ShadowRoot | null): string | null {
    if (!node) return null
    if (node instanceof Element && node.hasAttribute('data-plugin')) {
        return node.getAttribute('data-plugin')
    }
    if (node instanceof ShadowRoot) return getContext(node.host)
    if (node.parentNode) return getContext(node.parentNode)
    return null
}
