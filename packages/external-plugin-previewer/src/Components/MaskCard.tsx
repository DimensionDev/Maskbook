import { Card, CardContent, Typography, CardActions, Button } from '@material-ui/core'
import { RenderContext } from '../index'
import type { Component } from './index'
import { useContext } from 'react'
export const MaskCard: Component<MaskCardProps> = (props) => {
    const context = useContext(RenderContext)
    return (
        <Card>
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
                        const base = context.baseURL
                        const url = base ? new URL(props.href, base) : new URL(props.href)
                        context.permissionAwareOpen(url.toString())
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
