import { Box, Divider, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { BoxInfo, BoxMetadata } from '../../type.js'

const useStyles = makeStyles()((theme) => ({
    main: {
        height: 360,
        overflow: 'auto',
        padding: theme.spacing(2),
    },
    section: {
        border: `1px solid ${theme.palette.maskColor.publicLine}`,
        borderRadius: 16,
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        '&:last-child': {
            marginBottom: theme.spacing(0),
        },
    },
    line: {
        borderColor: theme.palette.maskColor.publicLine,
    },
    placeholder: {
        textAlign: 'center',
        marginTop: 170,
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        lineHeight: '22px',
        paddingBottom: theme.spacing(2),
        color: theme.palette.maskColor.dark,
    },
    content: {
        lineHeight: '20px',
        whiteSpace: 'pre-line',
        fontSize: 16,
        fontWeight: 400,
        color: theme.palette.maskColor.dark,
        paddingTop: theme.spacing(2),
    },
}))

export interface DetailsTabProps {
    boxInfo: BoxInfo
    boxMetadata?: BoxMetadata
}

export function DetailsTab(props: DetailsTabProps) {
    const { boxInfo, boxMetadata } = props
    const { classes, theme } = useStyles()

    const definitions = boxMetadata?.activities.map((x) => ({
        title: x.title,
        content: x.body,
    }))

    if (!definitions)
        return (
            <Box className={classes.main}>
                <Typography className={classes.placeholder} color={theme.palette.maskColor.publicMain}>
                    No detailed information.
                </Typography>
            </Box>
        )

    return (
        <Box className={classes.main}>
            {definitions.map((x, i) => (
                <section className={classes.section} key={i}>
                    <Typography className={classes.title} color={theme.palette.maskColor.publicMain} variant="h3">
                        {x.title}
                    </Typography>
                    <Divider className={classes.line} />
                    <Typography className={classes.content} color={theme.palette.maskColor.publicMain} variant="body2">
                        {x.content}
                    </Typography>
                </section>
            ))}
        </Box>
    )
}
