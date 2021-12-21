import { useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { getAssetAsBlobURL } from '../../../utils'
import Drag from './drag'
import AnimatedMessage from './animatedMsg'
import Tip from './tooltip'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { PetsPluginID } from '../constants'
import { currentPluginMinimalModeNOTEnabled } from '../../../settings/settings'
import { useValueRef } from '@masknet/shared'

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
        width: 15,
        height: 15,
        cursor: 'pointer',
        backgroundSize: 'contain',
        position: 'absolute',
        top: 0,
        right: -10,
    },
}))

const AnimatePic = () => {
    const classes = useStylesExtends(useStyles(), {})
    const Background = getAssetAsBlobURL(new URL('../assets/loot.gif', import.meta.url))
    const Close = getAssetAsBlobURL(new URL('../assets/close.png', import.meta.url))

    const [show, setShow] = useState(false)
    const [infoShow, setInfoShow] = useState(false)
    const enabled = useValueRef(currentPluginMinimalModeNOTEnabled['plugin:' + PetsPluginID])

    const identity = useCurrentVisitingIdentity()
    useEffect(() => {
        const userId = identity.identifier.userId
        const maskId = 'realMaskNetwork'
        setShow(enabled && userId === maskId)
    }, [identity, enabled])

    const handleClose = () => setShow(false)
    const handleMouseEnter = () => setInfoShow(true)
    const handleMouseLeave = () => setInfoShow(false)

    return (
        <div className={classes.root} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {show ? (
                <Drag>
                    <AnimatedMessage />
                    <div className={classes.img} style={{ backgroundImage: `url(${Background})` }} />
                    {infoShow ? (
                        <>
                            <Tip />
                            <div
                                className={classes.close}
                                onClick={handleClose}
                                style={{ backgroundImage: `url(${Close})` }}
                            />
                        </>
                    ) : null}
                </Drag>
            ) : null}
        </div>
    )
}

export default AnimatePic
