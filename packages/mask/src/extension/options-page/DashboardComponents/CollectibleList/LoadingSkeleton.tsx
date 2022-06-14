import { makeStyles } from '@masknet/theme'
import { Box, Skeleton } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(172px, 1fr))',
        gridGap: theme.spacing(1),
    },
    card: {
        width: 172,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1, 0),
    },
}))

export const LoadingSkeleton = () => {
    const { classes } = useStyles()
    return (
        <Box className={classes.root}>
            {Array.from({ length: 3 })
                .fill(0)
                .map((_, i) => (
                    <Box className={classes.card} display="flex" flexDirection="column" key={i}>
                        <Skeleton animation="wave" variant="rectangular" width={172} height={172} />
                        <Skeleton animation="wave" variant="text" width={172} height={20} style={{ marginTop: 4 }} />
                    </Box>
                ))}
        </Box>
    )
}
