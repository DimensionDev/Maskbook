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
import { useI18N } from '../../../utils/index.js'
import type { Permissions } from 'webextension-polyfill'

export interface RequestPermissionProps extends Permissions.AnyPermissions {
    onRequestApprove(): void
    onCancel(): void
}
export function RequestPermission(props: RequestPermissionProps) {
    const { t } = useI18N()
    const { origins, permissions } = props
    return (
        <>
            <DialogTitle>{t('popups_mask_requests_permission')}</DialogTitle>
            <DialogContent>
                {origins?.length ? (
                    <List dense subheader={<ListSubheader>{t('popups_sites')}</ListSubheader>}>
                        {origins.map((origin, key) => (
                            <ListItem key={key}>
                                <ListItemText primary={origin} />
                            </ListItem>
                        ))}
                    </List>
                ) : null}
                {permissions?.length ? (
                    <List dense subheader={<ListSubheader>{t('popups_permissions')}</ListSubheader>}>
                        {permissions.map((permission, key) => (
                            <ListItem key={key}>
                                <ListItemText primary={permission} />
                            </ListItem>
                        ))}
                    </List>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} variant="text">
                    {t('cancel')}
                </Button>
                <Button onClick={props.onRequestApprove} variant="contained">
                    {t('approve')}
                </Button>
            </DialogActions>
        </>
    )
}
