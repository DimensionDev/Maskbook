import { makeStyles, Typography, Button } from '@material-ui/core'
import type { Dispatch, SetStateAction, SyntheticEvent } from 'react'

const useStyles = makeStyles((theme) => ({
    root: {
        width: '147px',
        height: '54px',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: '#ffffff',
        marginRight: '10%',
        overflow: 'hidden',
        display: 'block',
        zIndex: 1,
    },
    inner: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '6px',
    },
    price: {
        width: '50%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceText: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#373737',
    },
    button: {
        width: '50%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1534d9',
        borderRadius: '6px',
        '&:hover': {
            backgroundColor: '#1534d9',
        },
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: 'white',
    },
}))

interface ListedProps {
    username: string
    rank: number
    price: string
    dayChange: number
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}

export default function Listed(props: ListedProps) {
    const classes = useStyles()
    function clicked(e: SyntheticEvent) {
        e.stopPropagation() // This is to prevent event bubbling. Without this, the tweet will also get clicked.
    }

    return (
        <>
            <div
                className={classes.root}
                onMouseEnter={() => props.setExtendedHover(true)}
                onMouseLeave={() =>
                    setTimeout(() => {
                        props.setExtendedHover(false)
                    }, 200)
                }>
                <div className={classes.inner}>
                    <div className={classes.price}>
                        <Typography className={classes.priceText}>${props.price}</Typography>
                    </div>
                    <Button
                        onClick={clicked}
                        href={`https://app.ideamarket.io/i/twitter/${props.username}`}
                        target="_blank"
                        rel="noopener"
                        className={classes.button}>
                        <Typography className={classes.buttonText}>Buy</Typography>
                    </Button>
                </div>
            </div>
        </>
    )
}
