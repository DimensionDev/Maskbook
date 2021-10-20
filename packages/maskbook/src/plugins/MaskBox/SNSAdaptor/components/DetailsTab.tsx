import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { BoxInfo, BoxMetadata } from '../../type'

const useStyles = makeStyles()((theme) => ({
    main: {
        height: 360,
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
    placeholder: {
        textAlign: 'center',
        marginTop: 170,
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
        wordBreak: 'break-all',
        marginBottom: theme.spacing(4),
    },
    content: {
        fontSize: 14,
        lineHeight: '24px',
        wordBreak: 'break-all',
    },
}))

export interface DetailsTabProps {
    boxInfo: BoxInfo
    boxMetadata?: BoxMetadata
}

export function DetailsTab(props: DetailsTabProps) {
    const { boxInfo, boxMetadata } = props
    const { classes } = useStyles()

    const definitions = boxMetadata?.activities.map((x) => ({
        title: x.title,
        content: x.body,
    }))

    if (!definitions)
        return (
            <Box className={classes.main}>
                <Typography className={classes.placeholder} color="textPrimary">
                    No detailed information.
                </Typography>
            </Box>
        )

    return (
        <Box className={classes.main}>
            {definitions?.map((x, i) => (
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
