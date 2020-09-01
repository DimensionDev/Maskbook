import React, { useMemo } from 'react'
import { Typography, IconButton, MenuItem, ListItem, ListItemTypeMap, useMediaQuery } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactDialog, DashboardContactDeleteConfirmDialog } from '../DashboardDialogs/Contact'
import DashboardMenu from './DashboardMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'

const useStyles = makeStyles((theme) =>
    createStyles({
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
            [theme.breakpoints.down('xs')]: {
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
    }),
)

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

    const menus = useMemo(
        () => [<MenuItem onClick={() => openDeleteContactConfirmDialog()}>{t('delete')}</MenuItem>].filter((x) => x),
        [openDeleteContactConfirmDialog, contact],
    )
    const [menu, , openMenu] = useModal(DashboardMenu, { menus })

    return (
        <>
            <ListItem button selected={false} onClick={() => openContactDialog()} className={classes.line} {...rest}>
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
                        openMenu({ anchorEl: e.currentTarget })
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
