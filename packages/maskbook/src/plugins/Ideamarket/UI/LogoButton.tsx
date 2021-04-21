import { useState } from 'react'
import { makeStyles, IconButton, Typography } from '@material-ui/core'
import Listing from './Listing'
import { IdeaLogo, IdeaLogoGray } from './assets'

const useStyles = makeStyles((theme) => ({
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
    },

    rankText: {
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
        if (clicked) {
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
        } else if (hover) {
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
        } else if (extendedHover) {
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
                        <Typography className={classes.rankText}>{props.rank}</Typography>
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
