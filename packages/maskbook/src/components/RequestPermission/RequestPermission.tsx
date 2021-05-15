import { makeStyles, createStyles, Theme, Button, Card, DialogTitle, DialogActions } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { MaskMessage } from '../../utils/messages'
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: theme.spacing(2, 2, 2, 2),
        },
    }),
)
interface RequestPermissionProps {
    onRequestApprove(): void
    onReject(): void
    reason: string
}
export function RequestPermission(props: RequestPermissionProps) {
    const classes = useStyles()
    return (
        <Card className={classes.root}>
            <DialogTitle>{props.reason}</DialogTitle>
            <DialogActions>
                <Button onClick={props.onReject} variant="text">
                    Reject
                </Button>
                <Button onClick={props.onRequestApprove} variant="contained">
                    Approve
                </Button>
            </DialogActions>
        </Card>
    )
}

export function RequestPermissionPage() {
    const param = useLocation()
    const _ = new URLSearchParams(param.search)
    const origins = _.getAll('origin')
    const permissions = _.getAll('permission') as browser.permissions.Permission[]
    const reason = _.get('reason') as string
    const onRequestApprove = () =>
        browser.permissions.request({ origins, permissions }).then(() => {
            MaskMessage.events.permissionsGranted.sendToAll(Object.fromEntries(permissions.map((p) => [p, true])))
            window.close()
        })
    const onReject = () => {
        MaskMessage.events.permissionsGranted.sendToAll(Object.fromEntries(permissions.map((p) => [p, false])))
        window.close()
    }
    return (
        <div style={{ width: 'fit-content', maxWidth: 600, margin: 'auto' }}>
            <RequestPermission reason={reason} onReject={onReject} onRequestApprove={onRequestApprove} />
        </div>
    )
}
