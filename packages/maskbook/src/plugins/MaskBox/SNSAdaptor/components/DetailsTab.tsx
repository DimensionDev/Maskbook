import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { BoxInfo } from '../../type'

const useStyles = makeStyles()((theme) => ({
    main: {
        maxHeight: 500,
        overflow: 'auto',
        marginBottom: theme.spacing(2.75),
    },
    section: {
        margin: theme.spacing(4, 0),
        '&:first-child': {
            marginTop: 0,
        },
        '&:last-child': {
            marginBottom: 0,
        },
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
        marginBottom: theme.spacing(4),
    },
    content: {
        fontSize: 14,
        lineHeight: '24px',
    },
}))

export interface DetailsTabProps {
    boxInfo: BoxInfo
}

export function DetailsTab(props: DetailsTabProps) {
    const { boxInfo } = props
    const { classes } = useStyles()

    const definitions = [
        {
            title: 'Rule Introduction',
            content: `A novel is a relatively long work of narrative fiction, typically written in prose and published as a book. The present English word for a long work of prose fiction derives from the Italian: novella for "new", "news", or "short story of something new", itself from the Latin: novella, a singular noun use of the neuter plural of novellus, diminutive of novus, meaning "new".`,
        },
    ]

    return (
        <Box className={classes.main}>
            <section className={classes.section}>
                <Typography className={classes.title} color="textPrimary" variant="h3">
                    Draw Probability
                </Typography>
            </section>
            {definitions.map((x, i) => (
                <section className={classes.section} key={i}>
                    <Typography className={classes.title} color="textPrimary" variant="h3">
                        {x.title}
                    </Typography>
                    <Typography className={classes.content} color="textPrimary" variant="body2">
                        {x.content}
                    </Typography>
                </section>
            ))}
        </Box>
    )
}
