import React from 'react'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import { getAssetAsBlobURL } from '../../../utils'
import Comp from './comp'
import Group from './group'
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
        backgroundRepeat: 'round',
    },
    close: {
        width: 25,
        height: 25,
        cursor: 'pointer',
        backgroundRepeat: 'round',
        position: 'absolute',
        top: 20,
        right: 0,
    },
}))

export function AnimatePic(props: any) {
    const classes = useStylesExtends(useStyles(), props)
    const Background = getAssetAsBlobURL(new URL('../assets/loot.gif', import.meta.url))
    const Close = getAssetAsBlobURL(new URL('../assets/close.png', import.meta.url))

    const [show, setShow] = React.useState(false)

    const identity = useCurrentVisitingIdentity()
    React.useEffect(() => {
        const userId = identity.identifier.userId
        const maskId = 'realMaskNetwork'
        setShow(userId === maskId)
    }, [identity])

    const handleClose = () => setShow(false)

    return (
        <div className={classes.root}>
            {show ? (
                <Comp>
                    <Group />
                    <div className={classes.img} style={{ backgroundImage: `url(${Background})` }} />
                    <Tip />
                    <div className={classes.close} onClick={handleClose} style={{ backgroundImage: `url(${Close})` }} />
                </Comp>
            ) : null}
        </div>
    )
}
