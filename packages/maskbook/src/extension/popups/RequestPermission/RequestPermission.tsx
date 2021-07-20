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

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        margin: theme.spacing(2, 2, 2, 2),
    },
}))
export interface RequestPermissionProps extends browser.permissions.Permissions {
    onRequestApprove(): void
    onCancel(): void
}
export function RequestPermission(props: RequestPermissionProps) {
    const classes = useStyles()
    const { origins, permissions } = props
    return (
        <Card className={classes.root}>
            <DialogTitle>Mask needs the following permissions</DialogTitle>
            <DialogContent>
                {origins?.length ? (
                    <List dense subheader={<ListSubheader>Sites</ListSubheader>}>
                        {origins?.map((x) => (
                            <ListItem key={x}>
                                <ListItemText primary={x} />
                            </ListItem>
                        ))}
                    </List>
                ) : null}
                {permissions?.length ? (
                    <List dense subheader={<ListSubheader>Permissions</ListSubheader>}>
                        {permissions?.map((x) => (
                            <ListItem key={x}>
                                <ListItemText primary={x} />
                            </ListItem>
                        ))}
                    </List>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} variant="text">
                    Cancel
                </Button>
                <Button onClick={props.onRequestApprove} variant="contained">
                    Approve
                </Button>
            </DialogActions>
        </Card>
    )
}
