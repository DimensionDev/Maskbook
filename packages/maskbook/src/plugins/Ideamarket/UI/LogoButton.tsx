import { useState } from 'react'
import { makeStyles, IconButton, SvgIcon } from '@material-ui/core'
import Listing from './Listing'
import { IdeamarketLogo } from './assets/index'

const useStyles = makeStyles((theme) => ({
    // root is for aligning the button in twitter itself.. Write a selector bitch.
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
}))

interface LogoButtonProps {
    username: string
}

export default function LogoButton(props: LogoButtonProps) {
    const [hover, setHover] = useState(false)
    const [clicked, setClicked] = useState(false)

    const classes = useStyles()

    const doWeRender = () => {
        if (clicked) {
            return <Listing username={props.username} />
        } else if (hover) {
            return <Listing username={props.username} />
        } else {
            return null
        }
    }

    return (
        <div className={classes.root}>
            <IconButton
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={() => setClicked(!clicked)}
                className={classes.logoButton}>
                <IdeamarketLogo />
            </IconButton>

            {doWeRender()}
        </div>
    )
}
