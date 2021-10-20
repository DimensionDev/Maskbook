import { useMemo } from 'react'

import { Card, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import DescriptionIcon from '@mui/icons-material/Description'
import FingerprintIcon from '@mui/icons-material/Fingerprint'

import { useI18N } from '../../../utils'

import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from './Base'
import { DebounceButton } from '../DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    logo: {
        fontSize: 30,
    },
    section: {
        padding: '26px 0',
        margin: theme.spacing(3, 0),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2, 0),
        },
    },
    list: {
        [theme.breakpoints.down('sm')]: {
            marginLeft: theme.spacing(-2),
            marginRight: theme.spacing(-2),
        },
    },
    listItemRoot: {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    listItemText: {
        fontWeight: 500,
    },
}))

interface PluginProps {
    id?: string
    description?: string
    icon?: React.ReactNode
    name?: string
}

//#region persona create dialog
export function DashboardPluginDetailDialog({ ComponentProps, ...rest }: WrappedDialogProps<PluginProps>) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const metaFields = useMemo(() => {
        if (!ComponentProps?.id || !ComponentProps?.name) {
            return []
        }
        return [
            {
                field: 'id',
                value: ComponentProps.id,
                icon: <FingerprintIcon />,
            },
            {
                field: 'description',
                value: ComponentProps.description,
                icon: <DescriptionIcon />,
            },
        ]
    }, [ComponentProps?.id, ComponentProps?.description, ComponentProps?.name])

    return (
        <DashboardDialogCore fullScreen={false} {...rest}>
            <DashboardDialogWrapper
                icon={<span className={classes.logo}>{ComponentProps?.icon}</span>}
                primary={ComponentProps?.name ?? '-'}
                secondary=" "
                content={
                    <Paper className={classes.section} component="section" elevation={0}>
                        <Card elevation={0}>
                            <List className={classes.list} disablePadding>
                                {metaFields.map((meta) => (
                                    <ListItem
                                        key={meta.field}
                                        classes={{
                                            root: classes.listItemRoot,
                                        }}>
                                        <ListItemIcon>{meta.icon}</ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.listItemText }}
                                            primary={meta.value}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Card>
                    </Paper>
                }
                footer={
                    <DebounceButton type="submit" variant="contained" onClick={rest.onClose}>
                        {t('ok')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
//#endregion
