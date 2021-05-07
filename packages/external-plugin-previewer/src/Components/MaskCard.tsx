import { Card, CardContent, Typography, CardActions, Button } from '@material-ui/core'
import { hostConfig } from '../host'
import type { Component } from './index'
export const MaskCard: Component<MaskCardProps> = (props) => {
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {String(props.caption)}
                </Typography>
                <Typography variant="h5" component="div">
                    {String(props.title)}
                </Typography>
                <Typography variant="body2" component="p">
                    <slot></slot>
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => hostConfig.permissionAwareOpen(props.href)} size="small">
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
