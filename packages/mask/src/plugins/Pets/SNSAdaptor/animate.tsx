import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { getAssetAsBlobURL } from '../../../utils'
import Drag from './drag'
import AnimatedMessage from './animatedMsg'
import Tip from './tooltip'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
    img: {
        zIndex: 999,
        width: '100%',
        height: '100%',
        backgroundSize: 'contain',
    },
    close: {
        width: 25,
        height: 25,
        cursor: 'pointer',
        backgroundSize: 'contain',
        position: 'absolute',
        top: 10,
        right: 0,
    },
}))

const AnimatePic = () => {
    const classes = useStylesExtends(useStyles(), {})
    const Background = getAssetAsBlobURL(new URL('../assets/loot.gif', import.meta.url))
    const Close = getAssetAsBlobURL(new URL('../assets/close.png', import.meta.url))

    const [show, setShow] = useState(false)

    const identity = useCurrentVisitingIdentity()
    useEffect(() => {
        const userId = identity.identifier.userId
        const maskId = 'realMaskNetwork'
        setShow(userId === maskId)
    }, [identity])

    const handleClose = () => setShow(false)

    return (
        <div className={classes.root}>
            {show ? (
                <Drag>
                    <AnimatedMessage />
                    <div className={classes.img} style={{ backgroundImage: `url(${Background})` }} />
                    <Tip />
                    <div className={classes.close} onClick={handleClose} style={{ backgroundImage: `url(${Close})` }} />
                </Drag>
            ) : null}
        </div>
    )
}

export default AnimatePic
