import { useState } from 'react'
import { makeStyles, IconButton, Typography } from '@material-ui/core'
import Listing from './Listing'
import { IdeaLogo, IdeaLogoGray } from './assets'

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },

    logoButton: {
        display: 'flex',
        position: 'absolute',
        width: '2em',
        height: '2em',
        marginRight: '12px',
    },

    priceText: {
        fontSize: '12px',
        color: 'gray',
        marginRight: '4px',
    },
}))

interface LogoButtonProps {
    username: string
    rank?: number
    dayChange?: string
    price?: string
    found: boolean
}

export default function LogoButton(props: LogoButtonProps) {
    const [hover, setHover] = useState(false)
    const [extendedHover, setExtendedHover] = useState(false)
    const [clicked, setClicked] = useState(false)

    const classes = useStyles()

    const doWeRender = () => {
        if (clicked || hover || extendedHover) {
            return (
                <Listing
                    username={props.username}
                    setExtendedHover={setExtendedHover}
                    found={props.found}
                    rank={props.rank}
                    dayChange={props.dayChange}
                    price={props.price}
                />
            )
        } else {
            return null
        }
    }

    return (
        <div className={classes.root}>
            <IconButton
                onMouseEnter={() =>
                    setTimeout(() => {
                        setHover(true)
                    }, 300)
                }
                onMouseLeave={() =>
                    setTimeout(() => {
                        setHover(false)
                    }, 500)
                }
                onClick={() => setClicked(!clicked)}
                className={classes.logoButton}>
                {props.found ? (
                    <>
                        <Typography className={classes.priceText}>${Number(props.price).toFixed(2)}</Typography>
                        <IdeaLogo fontSize="small" />
                    </>
                ) : (
                    <IdeaLogoGray fontSize="small" />
                )}
            </IconButton>

            {doWeRender()}
        </div>
    )
}
