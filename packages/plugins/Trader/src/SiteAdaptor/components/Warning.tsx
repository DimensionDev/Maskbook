import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'

const useStyles = makeStyles()((theme) => ({
    container: {
        backgroundColor: 'rgba(255, 177, 0, 0.1)',
        padding: 12,
        borderRadius: 12,
        display: 'flex',
        gap: theme.spacing(1),
        color: theme.palette.maskColor.warn,
        alignItems: 'center',
    },
    title: {
        lineHeight: '18px',
        fontWeight: 700,
        fontSize: 14,
        marginBottom: theme.spacing(0.5),
    },
    description: {
        lineHeight: '18px',
        fontWeight: 400,
        fontSize: 14,
    },
}))

interface WarningProps extends HTMLProps<HTMLDivElement> {
    title?: string
    description: string
}

export const Warning = memo(function Warning({ title, description, ...rest }: WarningProps) {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.container)} {...rest}>
            <Icons.WarningTriangle size={20} />
            <div>
                {title ?
                    <Typography className={classes.title}>{title}</Typography>
                :   null}
                <Typography className={classes.description}>{description}</Typography>
            </div>
        </div>
    )
})
