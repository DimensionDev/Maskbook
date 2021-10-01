import type { ArticleTabProps } from '../../../Collectible/SNSAdaptor/ArticleTab'
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

    const deifinitions = [
        {
            title: 'Rule Introduction',
            content: `Life is full of surprises in all forms of vibrant and luscious splendours. This year My Neighbour Alice brings an NFT festival referencing the real-world Midsummer celebrations during the summer solstice in Scandinavia. This Special Mystery Basket is hand-picked by Alice for you and your loved ones to celebrate the hottest season of the year - Midsummer. The Midsummer with Alice is a time of merriment and festivities. Festival bonfires are lit around all of Alice's farms and villages to celebrate this special occasion.`,
        },
    ]

    return (
        <Box className={classes.main}>
            <section className={classes.section}>
                <Typography className={classes.title} color="textPrimary" variant="h3">
                    Draw Probability
                </Typography>
            </section>
            {deifinitions.map((x, i) => (
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
