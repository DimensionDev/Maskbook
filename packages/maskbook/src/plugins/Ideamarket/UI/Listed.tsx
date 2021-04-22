import { makeStyles, Typography, Button, Divider, Box } from '@material-ui/core'
import type { SetStateAction } from 'react'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'block',
        width: '160px',
        borderRadius: '10px',
        boxShadow: '0px 0px 3px 1px #ADADAD',
        marginRight: '10%',
        overflow: 'hidden',
        zIndex: 1,
    },
    topInfo: {
        display: 'flex',
    },

    topText: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        color: '#2946ba',
    },

    topBox: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7',
    },

    rankText: {
        color: 'gray',
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        fontSize: 12,
    },

    priceText: {
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        fontSize: 13,
    },

    listButton: {
        backgroundColor: '#2946ba',
        borderRadius: '10px',
        margin: theme.spacing(1),
        width: '53%',
        '&:hover': {
            backgroundColor: '#415bc3',
        },
    },

    buttonText: {
        textTransform: 'none',
        color: 'white',
    },
    bottomText: {
        fontSize: '12px !important',
        color: 'black',
    },
    divider: {
        borderColor: '#ABABAB',
        height: 'auto',
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

    const isPositive = props.dayChange >= 0

    function clicked(e: MouseEvent) {
        e.preventDefault()
        window.open(`https://ideamarket.io/i/twitter/${props.username}`, '_blank', 'noopener')
    }

    return (
        <div
            className={classes.root}
            onMouseEnter={() => props.setExtendedHover(true)}
            onMouseLeave={() =>
                setTimeout(() => {
                    props.setExtendedHover(false)
                }, 200)
            }>
            <div className={classes.topInfo}>
                <Box className={classes.topBox}>
                    <Typography className={classes.topText}>
                        <b>${props.price}</b>
                    </Typography>
                    <Typography className={classes.priceText} style={{ color: isPositive ? 'green' : 'red' }}>
                        {isPositive ? '+' : null}
                        {props.dayChange}
                    </Typography>
                </Box>
                <Divider orientation="vertical" className={classes.divider} />
                <Box display="flex" sx={{ backgroundColor: '#f7f7f7' }} justifyContent="center">
                    <Button className={classes.listButton} onClick={clicked}>
                        <Typography className={classes.buttonText}>Buy</Typography>
                    </Button>
                </Box>
            </div>
        </div>
    )
}
