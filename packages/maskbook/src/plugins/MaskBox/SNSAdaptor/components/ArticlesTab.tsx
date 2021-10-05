import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import type { BoxInfo } from '../../type'

const useStyles = makeStyles()((theme) => ({
    main: {},
    body: {
        width: '100%',
        maxHeight: 360,
        overflow: 'hidden',
        borderRadius: 8,
    },
    footer: {
        margin: theme.spacing(2.75, 0),
    },
    hero: {
        display: 'block',
        width: '100%',
        maxHeight: 360,
        minHeight: 360,
    },
    name: {
        whiteSpace: 'nowrap',
        maxWidth: '50%',
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
}))

export interface ArticlesTabProps {
    boxInfo: BoxInfo
}

export function ArticlesTab(props: ArticlesTabProps) {
    const { boxInfo } = props
    const { classes } = useStyles()

    return (
        <Box className={classes.main}>
            <Box className={classes.body}>
                <img className={classes.hero} src={boxInfo.heroImageURL} />
            </Box>
            <Box className={classes.footer} display="flex" alignItems="center" justifyContent="space-between">
                <Typography className={classes.name} color="textPrimary">
                    {boxInfo.name}
                </Typography>
                <Typography color="textPrimary">
                    {boxInfo.remaining}/{boxInfo.total}
                </Typography>
            </Box>
        </Box>
    )
}
