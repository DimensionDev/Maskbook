import React, { useMemo } from 'react'
import {
    Typography,
    ButtonBase,
    ButtonBaseProps,
    IconButton,
    MenuItem,
    ListItem,
    ListItemTypeMap,
    useMediaQuery,
} from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import type { Profile } from '../../../database'
import { Avatar } from '../../../utils/components/Avatar'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactDialog, DashboardContactDeleteConfirmDialog } from '../DashboardDialogs/Contact'
import { Skeleton } from '@material-ui/lab'
import DashboardMenu from './DashboardMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'

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
            marginLeft: 'auto',
            marginRight: 0,
            fontFamily: 'var(--monospace)',
        },
        icon: {
            marginLeft: theme.spacing(1),
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
    const xsMatched = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), {
        defaultMatches: webpackEnv.perferResponsiveTarget === 'xs',
    })

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
                    <Typography component="code" color="textSecondary" className={classes.fingerprint}>
                        {contact.linkedPersona?.fingerprint}
                    </Typography>
                )}
                <IconButton
                    className={classes.icon}
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

export function ContactLineSkeleton(props: ButtonBaseProps) {
    const classes = useStyles()
    const text = (len: number) => <Skeleton height={16} width={len} />
    return (
        <ButtonBase disabled className={classes.line} {...props}>
            <Skeleton variant="circle" className={classes.avatar} />
            <Typography className={classes.user}>{text(16 * 10)}</Typography>
            <Typography className={classes.provider}>{text(16 * 5)}</Typography>
            <Typography component="code" color="textSecondary" className={classes.fingerprint}>
                {text(16 * 25)}
            </Typography>
        </ButtonBase>
    )
}
