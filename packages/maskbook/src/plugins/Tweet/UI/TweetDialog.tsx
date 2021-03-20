import { Typography, Card, makeStyles } from '@material-ui/core'
import type { TweetData } from '../types'
import { fetchTweet } from '../apis/index'
import { useAsync } from 'react-use'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: `1px solid ${theme.palette.divider}`,
        boxSizing: 'border-box',
        borderRadius: 12,
        cursor: 'default',
        userSelect: 'none',
        '& p': { margin: 0 },
    },
    media: {
        borderRadius: 12,
        width: '100%',
    },
    meta: {
        flex: 1,
        minWidth: '1%',
        marginLeft: 18,
        marginRight: 18,
        fontSize: 14,
        lineHeight: 1.85,
        padding: theme.spacing(2),
    },
}))

interface TweetID {
    tweet: string
}

export default function TweetDialog(props: TweetID) {
    const classes = useStyles()

    const tweetBidResponse = useAsync(async function () {
        const response = await fetchTweet(props.tweet)
        console.log('Tweet: ', response)

        //if(response?.type == 'Closed') return null
    })
    return (
        <Card className={classes.root}>
            <div className={classes.meta}>
                <Typography component="p" color="textPrimary"></Typography>
            </div>
        </Card>
    )
}
