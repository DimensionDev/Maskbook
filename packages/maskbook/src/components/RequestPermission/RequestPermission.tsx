import {
    makeStyles,
    Theme,
    Button,
    Card,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { MaskMessage } from '../../utils/messages'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        margin: theme.spacing(2, 2, 2, 2),
    },
}))
interface RequestPermissionProps {
    permission: browser.permissions.Permissions
    onRequestApprove(): void
    onReject(): void
    reason: string
}
export function RequestPermission(props: RequestPermissionProps) {
    const classes = useStyles()
    return (
        <Card className={classes.root}>
            <DialogTitle>{props.reason || 'Maskbook needs the following permissions'}</DialogTitle>
            <DialogContent>
                <List dense subheader={<ListSubheader>Sites</ListSubheader>}>
                    {props.permission.origins?.map((x) => (
                        <ListItem key={x}>
                            <ListItemText primary={x}></ListItemText>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
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
            <RequestPermission
                reason={reason}
                onReject={onReject}
                onRequestApprove={onRequestApprove}
                permission={{ origins, permissions }}
            />
        </div>
    )
}
