import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'

const useStyles = makeStyles()((theme) => {
    return {
        root: {},
        title: {
            fontWeight: 700,
            fontSize: 14,
            margin: theme.spacing(3, 0, 2),
        },
    }
})

export interface SectionProps {
    title: string
    additions?: React.ReactNode
    children: React.ReactNode
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
