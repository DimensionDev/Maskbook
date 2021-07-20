import { Typography, IconButton, MenuItem, ListItem, ListItemTypeMap } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import type { Profile } from '../../../database'
import { Avatar, useMenu, useI18N, useMatchXS } from '../../../utils'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactDialog, DashboardContactDeleteConfirmDialog } from '../DashboardDialogs/Contact'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'

const useStyles = makeStyles((theme) => ({
    line: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    avatar: {
        width: '32px',
        height: '32px',
    },
    user: {
        color: theme.palette.text.primary,
        fontWeight: 500,
        margin: theme.spacing(0, 2),
        flex: '0 1 auto',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    provider: {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            flex: 1,
        },
    },
    fingerprint: {
        color: theme.palette.text.secondary,
        marginLeft: 'auto',
        marginRight: 0,
        fontFamily: 'var(--monospace)',
    },
    more: {
        marginLeft: theme.spacing(1),
        color: theme.palette.text.primary,
    },
}))

interface ContactLineProps extends Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>> {
    contact: Profile
    onUpdated: () => void
    onDeleted: () => void
}

export function ContactLine(props: ContactLineProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { contact, onUpdated, onDeleted, ...rest } = props
    const [contactDialog, openContactDialog] = useModal(DashboardContactDialog, { contact, onUpdated })
    const xsMatched = useMatchXS()

    const [deleteContactConfirmDialog, openDeleteContactConfirmDialog] = useModal(DashboardContactDeleteConfirmDialog, {
        contact,
        onDeleted,
    })

    const [menu, openMenu] = useMenu([<MenuItem onClick={openDeleteContactConfirmDialog}>{t('delete')}</MenuItem>])

    return (
        <>
            {/* // TODO: Use standard ListItemAvatar, ListItemText and ListItemSecondaryAction instead of custom one. */}
            <ListItem button selected={false} onClick={openContactDialog} className={classes.line} {...rest}>
                <Avatar className={classes.avatar} person={contact} />
                <Typography className={classes.user}>{contact.nickname || contact.identifier.userId}</Typography>
                <Typography className={classes.provider}>@{contact.identifier.network}</Typography>
                {xsMatched ? null : (
                    <Typography className={classes.fingerprint} component="code">
                        {contact.linkedPersona?.fingerprint}
                    </Typography>
                )}
                <IconButton
                    className={classes.more}
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation()
                        openMenu(e)
                    }}>
                    <MoreHorizIcon />
                </IconButton>
            </ListItem>
            {menu}
            {contactDialog}
            {deleteContactConfirmDialog}
        </>
    )
}
