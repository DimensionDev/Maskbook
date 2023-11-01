import { Typography, Card, CardContent, Button, CardActions } from '@mui/material'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { Trans } from 'react-i18next'

export function PermissionAwareRedirectUI(props: PermissionAwareRedirectProps) {
    const t = useMaskSharedTrans()
    if (props.granted) {
        return (
            <>
                {t.redirect_to()} {props.url}.
                <br />
                <Trans i18nKey="redirect_alert" components={{ terms: <a href={props.url} /> }} />
            </>
        )
    }
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{t.popups_permission_request()}</Typography>
                <Typography variant="body1">{t.popups_permission_request_content()}</Typography>
                <br />
                <Typography variant="body1">{props.url}</Typography>
                <br />
                <Typography variant="body1">{t.popups_permission_request_content2()}</Typography>
            </CardContent>
            <CardActions sx={{ flexDirection: 'row-reverse' }}>
                <Button variant="contained" onClick={props.onRequest}>
                    {t.popups_grant()}
                </Button>
                <Button onClick={props.onCancel}>{t.cancel()}</Button>
            </CardActions>
        </Card>
    )
}
interface PermissionAwareRedirectProps {
    url: string
    onRequest(): void
    onCancel(): void
    granted: boolean
}
