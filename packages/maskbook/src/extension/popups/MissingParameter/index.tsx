import { Card, CardContent, Typography } from '@material-ui/core'

export function MissingParameter(props: { message: string }) {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5">{props.message}</Typography>
                <Typography variant="caption">Please close this page.</Typography>
            </CardContent>
        </Card>
    )
}
