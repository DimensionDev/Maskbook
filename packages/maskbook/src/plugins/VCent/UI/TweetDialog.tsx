import { makeStyles, Button } from '@material-ui/core'
import { isDarkTheme } from '../../../utils/theme-tools'
import * as TweetAPI from '../apis/index'
import { ETHIcon } from '../icons/ETH'
import { VALUABLES_VCENT_URL } from '../constants'
import { useAsync } from 'react-use'

const useStyle = makeStyles((theme) => ({
    root: {
        marginTop: 20,
    },

    content: {
        display: 'flex',
        height: 45,
        alignItems: 'center',
        borderRadius: 25,
        justifyContent: 'center',
    },

    VCent: {
        marginLeft: -10,
        marginTop: 5,
    },

    bidInfo: {
        display: 'flex',
        fontSize: 16,
        alignItems: 'center',
        borderWidth: 2,
        marginRight: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    textUSD: {
        color: theme.palette.mode === 'dark' ? '#d9d9d9' : '#1d1d1d',
        fontSize: 15,
        fontWeight: 400,
        borderWidth: 2,
        marginRight: 5,
    },

    textETH: {
        color: theme.palette.mode === 'dark' ? '#d9d9d9' : '#6b6b6b',
        display: 'flex',
        fontSize: 15,
        alignItems: 'center',
        fontWeight: 400,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    text: {
        color: theme.palette.mode === 'dark' ? '#d9d9d9' : '#1d1d1d',
        height: 13,
        fontSize: 13,
        fontWeight: 500,
        marginRight: 5,
        borderWidth: 2,
        marginBottom: 5.5,
    },

    typography: {
        padding: theme.spacing(2),
    },

    paper: {
        padding: theme.spacing(1),
    },
}))

export default function VCentDialog({ tweetAddress }: { tweetAddress: string }) {
    const classes = useStyle()

    const tweet: TweetAPI.TweetData | undefined = useAsync(() => TweetAPI.getTweetData(tweetAddress), [tweetAddress])
        .value?.[0]
    const type = tweet?.type || ''

    return (
        <div className={classes.root}>
            {tweet && type === 'Offer' ? (
                <Button
                    className={classes.content}
                    target="_blank"
                    href={VALUABLES_VCENT_URL + tweet.tweet_id}
                    style={isDarkTheme() ? { backgroundColor: '#1a2735' } : { backgroundColor: '#f3f3f3' }}>
                    <div className={classes.bidInfo}>
                        <div className={classes.text}> LATEST OFFER at</div>
                        <div className={classes.textUSD}> ${tweet.amount_usd}</div>
                        <div className={classes.textETH}>
                            (<ETHIcon />
                            {tweet.amount_eth.toFixed(4)})
                        </div>
                    </div>
                </Button>
            ) : null}
        </div>
    )
}
