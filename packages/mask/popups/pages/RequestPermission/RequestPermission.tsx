import {
    Button,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@mui/material'
import type { Permissions } from 'webextension-polyfill'
import { Trans } from '@lingui/macro'

interface RequestPermissionProps extends Permissions.AnyPermissions {
    onRequestApprove(): void
    onCancel(): void
}
export function RequestPermission(props: RequestPermissionProps) {
    const { origins, permissions } = props
    return (
        <>
            <DialogTitle>
                <Trans>Mask needs the following permissions</Trans>
            </DialogTitle>
            <DialogContent>
                {origins?.length ?
                    <List
                        dense
                        subheader={
                            <ListSubheader>
                                <Trans>Sites</Trans>
                            </ListSubheader>
                        }>
                        {origins.map((origin, key) => (
                            <ListItem key={key}>
                                <ListItemText primary={origin} />
                            </ListItem>
                        ))}
                    </List>
                :   null}
                {permissions?.length ?
                    <List
                        dense
                        subheader={
                            <ListSubheader>
                                <Trans>Permissions</Trans>
                            </ListSubheader>
                        }>
                        {permissions.map((permission, key) => (
                            <ListItem key={key}>
                                <ListItemText primary={permission} />
                            </ListItem>
                        ))}
                    </List>
                :   null}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} variant="text">
                    <Trans>Cancel</Trans>
                </Button>
                <Button onClick={props.onRequestApprove} variant="contained">
                    <Trans>Approve</Trans>
                </Button>
            </DialogActions>
        </>
    )
}
