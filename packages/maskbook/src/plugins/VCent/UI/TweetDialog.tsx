import { useEffect, useState } from 'react'
import { makeStyles, createStyles, Button } from '@material-ui/core'
import { isDarkTheme } from '../../../utils/theme-tools'
import * as TweetAPI from '../apis/index'
import { ETHIcon } from '../Icons/ETH'
import { VCentIconLight, VCentIconDark } from '../Icons/VCent'
import { VALUABLES_VCENT_URL } from '../constants'

const useLightTheme = makeStyles((themeLight) => ({
    root: {
        marginTop: 20,
    },

    content: {
        display: 'flex',
        height: 45,
        alignItems: 'center',
        borderRadius: 25,
        justifyContent: 'space-between',
    },

    VCent: {
        marginLeft: -10,
        marginTop: 5,
    },

    bidInfo: {
        color: '#6b6b6b',
        display: 'flex',
        fontSize: 16,
        alignItems: 'center',
        borderWidth: 2,
        marginRight: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    textUSD: {
        color: '#1d1d1d',
        fontSize: 15,
        fontWeight: 400,
        borderWidth: 2,
        marginRight: 5,
    },

    textETH: {
        color: '#6b6b6b',
        display: 'flex',
        fontSize: 15,
        alignItems: 'center',
        fontWeight: 400,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    text: {
        color: '#1d1d1d',
        height: 13,
        fontSize: 13,
        fontWeight: 500,
        marginRight: 5,
        borderWidth: 2,
        marginBottom: 5.5,
    },

    typography: {
        padding: themeLight.spacing(2),
    },

    paper: {
        padding: themeLight.spacing(1),
    },
}))

const useDarkTheme = makeStyles((themeDark) => ({
    root: {
        marginTop: 20,
    },

    content: {
        display: 'flex',
        height: 45,
        alignItems: 'center',
        borderRadius: 25,
        justifyContent: 'space-between',
    },

    VCent: {
        marginLeft: -10,
        marginTop: 5,
    },

    bidInfo: {
        color: '#d9d9d9',
        display: 'flex',
        fontSize: 16,
        alignItems: 'center',
        borderWidth: 2,
        marginRight: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    textUSD: {
        color: '#d9d9d9',
        fontSize: 15,
        fontWeight: 400,
        borderWidth: 2,
        marginRight: 5,
    },

    textUSD_dark: {
        color: 'white',
        fontSize: 15,
        fontWeight: 400,
        borderWidth: 2,
        marginRight: 5,
    },

    textETH: {
        color: '#d9d9d9',
        display: 'flex',
        fontSize: 15,
        alignItems: 'center',
        fontWeight: 400,
        flexDirection: 'row',
        justifyContent: 'center',
    },

    text: {
        color: '#d9d9d9',
        height: 13,
        fontSize: 13,
        fontWeight: 500,
        marginRight: 5,
        borderWidth: 2,
        marginBottom: 5.5,
    },

    typography: {
        padding: themeDark.spacing(2),
    },

    paper: {
        padding: themeDark.spacing(1),
    },
}))

export default function VCentDialog(tweetAddress: any) {
    const lightTheme = useLightTheme()
    const darkTheme = useDarkTheme()

    const [tweet, setTweets] = useState<TweetAPI.TweetData>()
    const [type, setType] = useState('')

    useEffect(() => {
        TweetAPI.getTweetData(tweetAddress).then((res) => {
            setTweets(res.results[0])
            setType(res.results[0].type)
        })
    }, [])

    return (
        <div className={isDarkTheme() ? darkTheme.root : lightTheme.root}>
            {tweet && type === 'Offer' ? (
                <Button
                    className={isDarkTheme() ? darkTheme.content : lightTheme.content}
                    target="_blank"
                    href={VALUABLES_VCENT_URL + tweet.tweet_id}
                    style={isDarkTheme() ? { backgroundColor: '#1a2735' } : { backgroundColor: '#f3f3f3' }}>
                    <div className={isDarkTheme() ? darkTheme.VCent : lightTheme.VCent}>
                        {isDarkTheme() ? <VCentIconDark /> : <VCentIconLight />}
                    </div>
                    <div className={isDarkTheme() ? darkTheme.bidInfo : lightTheme.bidInfo}>
                        <div className={isDarkTheme() ? darkTheme.text : lightTheme.text}> LATEST OFFER at</div>
                        <div className={isDarkTheme() ? darkTheme.textUSD : lightTheme.textUSD}>
                            {' '}
                            ${tweet.amount_usd}
                        </div>
                        <div className={isDarkTheme() ? darkTheme.textETH : lightTheme.textETH}>
                            (<ETHIcon />
                            {tweet.amount_eth.toFixed(4)})
                        </div>
                    </div>
                </Button>
            ) : null}
        </div>
    )
}
