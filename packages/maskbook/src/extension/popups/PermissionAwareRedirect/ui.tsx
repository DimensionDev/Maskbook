import { Typography, Card, CardContent, Button, CardActions } from '@mui/material'

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
                <Typography variant="h6">Permission request</Typography>
                <Typography variant="body1">
                    To continue, Mask Network needs permission to access the following URL:
                </Typography>
                <br />
                <Typography variant="body1">{props.url}</Typography>
                <br />
                <Typography variant="body1">
                    This gives Mask Network the necessary abilities to provide the requested function properly.
                </Typography>
            </CardContent>
            <CardActions sx={{ flexDirection: 'row-reverse' }}>
                <Button variant="contained" onClick={props.onRequest}>
                    Grant
                </Button>
                <Button onClick={props.onCancel}>Cancel</Button>
            </CardActions>
        </Card>
    )
}
export interface PermissionAwareRedirectProps {
    url: string
    onRequest(): void
    onCancel(): void
    granted: boolean
}
