import React from 'react'
import { makeStyles } from '@masknet/theme'
import { CSSTransition } from 'react-transition-group'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()(() => ({
    txt: {
        position: 'absolute',
        opacity: 0,
        top: -40,
        fontSize: '12px',
        color: '#737373',
        fontWeight: 600,
        width: '100%',
        fontFamily: 'TwitterChirp',
    },
    enter: {
        left: 150,
        opacity: 0,
    },
    enterActive: {
        left: 0,
        opacity: 1,
        transition: 'all 1500ms ease-in',
    },
    enterDone: {
        left: 0,
        opacity: 1,
    },
    // exit: {
    //     left: 0,
    //     opacity: 1
    // },
    exitActive: {
        left: 150,
        opacity: 0,
        transition: 'all 1500ms ease-out',
    },
    // exitDone: {
    //     left: 150,
    //     opacity: 0
    // }
}))

const AnimatedMessage = () => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [start, setStart] = React.useState(false)
    //@ts-ignore
    const txts = Array.from({ length: 9 }, (_v, k) => t(`plugin_pets_loot_des_${k}`))
    const [show, setShow] = React.useState(txts[0])

    React.useEffect(() => {
        let count = 0
        const timer = setInterval(() => {
            setStart(count % 9 < 5)
            count = count + 1
        }, 1000 * 1)
        return () => {
            clearInterval(timer)
        }
    }, [])

    React.useEffect(() => {
        if (start) return
        const timer = setTimeout(() => {
            const idx = Math.round(Math.random() * (txts.length - 1))
            setShow(txts[idx])
        }, 1500)
        return () => {
            clearInterval(timer)
        }
    }, [start])

    return (
        <CSSTransition
            in={start}
            timeout={{
                appear: 1000,
                enter: 1500,
                exit: 1500,
            }}
            classNames={{
                enter: classes.enter,
                enterActive: classes.enterActive,
                enterDone: classes.enterDone,
                exit: classes.enterDone,
                exitActive: classes.exitActive,
                exitDone: classes.enter,
            }}>
            <div className={classes.txt}>{show}</div>
        </CSSTransition>
    )
}

export default AnimatedMessage
