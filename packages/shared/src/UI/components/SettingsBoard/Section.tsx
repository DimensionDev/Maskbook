import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        title: {
            fontWeight: 700,
            margin: theme.spacing(3, 0, 2),
        },
    }
})

interface SectionProps extends PropsWithChildren {
    title: React.ReactNode
    additions?: React.ReactNode
}

export function Section(props: SectionProps) {
    const { title, additions, children } = props
    const { classes } = useStyles()

    return (
        <div className={classes.root}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography className={classes.title}>{title}</Typography>
                {additions ?? <div />}
            </Box>
            {children}
        </div>
    )
}
