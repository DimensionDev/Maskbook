import { Typography, Card, CardContent, Button, CardActions } from '@material-ui/core'

export function PermissionAwareRedirectUI(props: PermissionAwareRedirectProps) {
    if (props.granted) {
        return (
            <>
                Redirect to {props.url}.
                <br />
                If your browser does not redirect, please <a href={props.url}>click here</a>.
            </>
        )
    }
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Mask need permission for:</Typography>
                <Typography variant="caption">{props.url}</Typography>
            </CardContent>
            <CardActions>
                <Button onClick={props.onRequest}>Grant</Button>
            </CardActions>
        </Card>
    )
}
export interface PermissionAwareRedirectProps {
    url: string
    onRequest(): void
    granted: boolean
}
