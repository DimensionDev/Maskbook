import { useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useUser, useEssay, useDefaultEssay, useCurrentVisitingUser } from '../hooks'
import { ModelNFT } from './ModelNFT'
import { NormalNFT } from './NormalNFT'
import { ImageType, ShowMeta } from '../types'

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

    const user = useUser()
    const visitor = useCurrentVisitingUser()
    //visitor cannot get address, but user can
    const visitorMeta = useEssay(user.userId === visitor.userId ? user : visitor, start)
    const defMeta = useDefaultEssay(visitor)

    const [showMeta, setShowMeta] = useState<ShowMeta | undefined>(undefined)
    const [show, setShow] = useState(true)
    const [infoShow, setInfoShow] = useState(false)

    useEffect(() => {
        setShowMeta(visitorMeta ?? defMeta)
    }, [visitor, visitorMeta, defMeta])

    const handleClose = () => setShow(false)
    const handleMouseEnter = () => setInfoShow(true)
    const handleMouseLeave = () => setInfoShow(false)

    useEffect(() => {
        let count = 0
        const timer = setInterval(() => {
            const check = count % 9 < 5
            setStart(check)
            count += 1
        }, 1000)
        return () => {
            clearInterval(timer)
        }
    }, [])
    if (!visitor.userId || visitor.userId === '$unknown' || !show || !showMeta?.image) return <></>
    return (
        <div className={classes.root} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {showMeta.type === ImageType.GLB ? (
                <ModelNFT start={start} showMeta={showMeta} />
            ) : (
                <NormalNFT start={start} infoShow={infoShow} showMeta={showMeta} handleClose={handleClose} />
            )}
        </div>
    )
}

export default AnimatePic
