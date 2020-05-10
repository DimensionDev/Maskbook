import React from 'react'
import {
    makeStyles,
    createStyles,
    Theme,
    Avatar,
    CardHeader,
    IconButton,
    Button,
    Card,
    CardActions,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Typography,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@material-ui/core'
import { MoreVert as MoreVertIcon } from '@material-ui/icons'
import { getUrl } from '../../utils/utils'
import { useLocation } from 'react-router-dom'
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: theme.spacing(2, 2, 2, 2),
        },
    }),
)
interface RequestPermissionProps {
    permission: browser.permissions.Permissions
    onRequestApprove(): void
    onCancel(): void
}
export function RequestPermission(props: RequestPermissionProps) {
    const classes = useStyles()
    return (
        <Card className={classes.root}>
            <DialogTitle>Maskbook needs the following permissions</DialogTitle>
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
                <Button onClick={props.onCancel} variant="text" color="default">
                    Cancel
                </Button>
                <Button onClick={props.onRequestApprove} variant="contained" color="primary">
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
    return (
        <div style={{ width: 'fit-content', maxWidth: 600, margin: 'auto' }}>
            <RequestPermission
                onCancel={() => window.close()}
                onRequestApprove={() => browser.permissions.request({ origins }).then(() => window.close())}
                permission={{ origins }}
            />
        </div>
    )
}
