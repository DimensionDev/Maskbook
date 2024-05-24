/* eslint-disable tss-unused-classes/unused-classes */
import { Icons } from '@masknet/icons'
import { memo, type PropsWithChildren } from 'react'
import { makeStyles } from '../../UIHelper/index.js'
import { alpha, Typography } from '@mui/material'

type TagVariant = 'info' | 'success' | 'warning' | 'error'

export interface TagProps extends withClasses<'icon' | 'root'>, PropsWithChildren {
    variant?: TagVariant
    iconMapping?: Partial<Record<TagVariant, React.ReactNode>>
}

const defaultIconMapping = {
    success: <Icons.FillSuccess size={16} />,
    warning: <Icons.WarningTriangle size={16} />,
    error: <Icons.Warning size={16} />,
    info: <Icons.PrimaryInfo size={16} />,
}

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(0.5, 1),
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 400,
        borderRadius: 4,
    },
    info: {
        backgroundColor: alpha(theme.palette.maskColor.primary, 0.1),
        color: theme.palette.maskColor.primary,
    },
    success: {
        backgroundColor: alpha(theme.palette.maskColor.success, 0.1),
        color: theme.palette.maskColor.success,
    },
    warning: {
        backgroundColor: alpha(theme.palette.maskColor.warn, 0.1),
        color: theme.palette.maskColor.warn,
    },
    error: {
        backgroundColor: alpha(theme.palette.maskColor.danger, 0.1),
        color: theme.palette.maskColor.danger,
    },
    icon: {
        width: 16,
        height: 16,
    },
}))

export const Tag = memo<TagProps>(({ variant = 'info', iconMapping, children, ...props }) => {
    const { classes, cx } = useStyles(undefined, { props: { classes: props.classes } })

    return (
        <div className={cx(classes.root, classes[variant])}>
            <div className={classes.icon}>{iconMapping?.[variant] || defaultIconMapping[variant]}</div>
            <Typography component="span">{children}</Typography>
        </div>
    )
})
