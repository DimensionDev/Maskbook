import { useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { useValueRef } from '@masknet/shared-base-ui'
import { useEssay, useDefaultEssay, useCurrentVisitingUser, DEFAULT_USER } from '../hooks/index.js'
import { NormalNFT } from './NormalNFT.js'
import { PluginPetMessages } from '../messages.js'
import { petShowSettings } from '../settings.js'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
}))

function AnimatePic() {
    const { classes } = useStyles()

    const petShow = useValueRef<boolean>(petShowSettings)

    const { value: visitor = DEFAULT_USER, retry: retryUser } = useCurrentVisitingUser()
    const { value: visitorMeta, retry: retryEssay } = useEssay(visitor)
    const defMeta = useDefaultEssay(visitor)
    const showMeta = visitorMeta ?? defMeta

    const [infoShow, setInfoShow] = useState(false)

    const handleClose = () => (petShowSettings.value = false)
    const handleMouseEnter = () => setInfoShow(true)
    const handleMouseLeave = () => setInfoShow(false)

    useEffect(() => {
        return PluginPetMessages.setResult.on(() => {
            retryUser()
            retryEssay()
        })
    }, [])
    if (!petShow || !visitor.userId || visitor.userId === '$unknown' || !showMeta?.image) return null
    return (
        <div
            className={classes.root}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            key={visitor.userId}>
            <NormalNFT infoShow={infoShow} showMeta={showMeta} handleClose={handleClose} />
        </div>
    )
}

export default AnimatePic
