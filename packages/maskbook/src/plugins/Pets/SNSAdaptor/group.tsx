import React from 'react'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { CSSTransition } from 'react-transition-group'

const useStyles = makeStyles()((theme) => ({
    txt: {
        position: 'absolute',
        opacity: 0,
        top: -40,
        fontSize: '12px',
        color: '#737373',
        fontWeight: 600,
        width: '100%',
        fontFamily: 'TwitterChirp',
        //TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
    },
}))

const txts = [
    'What’s up buddy! How’s everything going?',
    "Good to see you! I've been waiting awhile, how can I help you?",
    'I am the LOOTER from Mask, wanna join for fun? Line up!',
    'Beep! Beep! Clicking unavailable for now... Come later!',
    'Mask, Mask, I love Mask!',
    'I wanna go for a ride, but code won’t let me...',
    'Go talk with Suji! I wanna hangout for Worlds!',
    'Did you know that you are the boss of Mask?',
    'Heard the news? You guys are almost available for NFT show!',
]

const Group = (props: any) => {
    const classes = useStylesExtends(useStyles(), props)
    const [start, setStart] = React.useState(false)
    const [show, setShow] = React.useState(txts[0])

    React.useEffect(() => {
        let count = 0
        setInterval(() => {
            setStart(count % 5 < 3)
            count = count + 1
        }, 1000 * 2)
    }, [])

    React.useEffect(() => {
        if (!start) {
            const idx = Math.round(Math.random() * (txts.length - 1))
            setShow(txts[idx])
        }
    }, [start])

    return (
        <CSSTransition
            in={start}
            timeout={1000 * 3}
            onEnter={(e: any) => {
                e.style.left = '150px'
                e.style.opacity = 1
            }}
            onEntering={(e: any) => {
                ;(e.style.left = '0px'), (e.style.opacity = 1), (e.style.transition = 'all 2000ms ease-in')
            }}
            onEntered={(e: any) => {
                ;(e.style.left = '0px'), (e.style.opacity = 0)
            }}
            onExit={(e: any) => {
                ;(e.style.left = '0px'), (e.style.opacity = 0)
            }}
            onExiting={(e: any) => {
                ;(e.style.left = '150px'), (e.style.opacity = 0)
            }}
            onExited={(e: any) => {
                ;(e.style.left = '150px'), (e.style.opacity = 0)
            }}>
            <div className={classes.txt}>{show}</div>
        </CSSTransition>
    )
}

export default Group
