import { useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useEssay, useDefaultEssay, useCurrentVisitingUser } from '../hooks'
import { ModelNFT } from './ModelNFT'
import { NormalNFT } from './NormalNFT'
import { ImageType } from '../types'
import { PluginPetMessages } from '../messages'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
}))

const AnimatePic = () => {
    const classes = useStylesExtends(useStyles(), {})

    const [start, setStart] = useState(true)
    const [refresh, setRefresh] = useState(0)

    const visitor = useCurrentVisitingUser(refresh)
    const visitorMeta = useEssay(visitor, refresh)
    const defMeta = useDefaultEssay(visitor)
    const showMeta = visitorMeta ?? defMeta

    const [hidden, setHidden] = useState(false)
    const [infoShow, setInfoShow] = useState(false)

    const handleClose = () => setHidden(true)
    const handleMouseEnter = () => setInfoShow(true)
    const handleMouseLeave = () => setInfoShow(false)

    useEffect(() => {
        const refreshHandle = async (data: number) => setRefresh(data)
        PluginPetMessages.events.setResult.on(refreshHandle)
        let count = 0
        const timer = setInterval(() => {
            const check = count % 9 < 5
            setStart(check)
            count += 1
        }, 1000)
        return () => {
            clearInterval(timer)
            PluginPetMessages.events.setResult.off(refreshHandle)
        }
    }, [])
    if (!visitor.userId || visitor.userId === '$unknown' || hidden || !showMeta?.image) return null
    return (
        <div
            className={classes.root}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            key={visitor.userId}>
            {showMeta.type === ImageType.GLB ? (
                <ModelNFT start={start} showMeta={showMeta} />
            ) : (
                <NormalNFT start={start} infoShow={infoShow} showMeta={showMeta} handleClose={handleClose} />
            )}
        </div>
    )
}

export default AnimatePic
