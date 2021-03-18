import { useAsync } from 'react-use'
import { makeStyles, Typography, Button } from '@material-ui/core'
import { getTweetBid } from '../api'

// import { ETHIcon } from '@dimensiondev/icons'
// <i class="fab fa-ethereum"></i>

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    bidButton: {
        borderRadius: '20px',
        backgroundColor: theme.palette.mode === 'light' ? '#EFF1F2' : '#1E2024',
        width: '100vw',
        margin: theme.spacing(1),
    },
    bidLink: {
        color: theme.palette.text.primary,
        textDecoration: 'none',
    },
    bidText: {
        margin: theme.spacing(0.7),
        color: '#1C68F3',
    },
}))

interface BidCardProps {
    id: string
}

export default function BidCard(props: BidCardProps) {
    const classes = useStyles()

    const tweetBidResponse = useAsync(
        async function () {
            const response = await getTweetBid(props.id)

            return response
        },
        [props.id],
    )

    return !tweetBidResponse.loading && !tweetBidResponse.error && tweetBidResponse.value ? (
        <div className={classes.root}>
            <Button
                className={classes.bidButton}
                variant="outlined"
                size="small"
                href={`https://v.cent.co/tweet/${props.id}`}
                target="_blank"
                rel="noopener noreferrer">
                <Typography className={classes.bidText}>
                    Bid: ${tweetBidResponse.value?.amount_usd} ({tweetBidResponse.value?.amount_eth} ETH)
                </Typography>
            </Button>
        </div>
    ) : null
}
