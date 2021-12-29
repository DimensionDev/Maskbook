import { useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography, Box } from '@mui/material'
import { getAssetAsBlobURL } from '../../../utils'
import Drag from './Drag'
import { useUser, useNfts, useEssay, useDefaultEssay, useCurrentVisitingUser } from '../hooks'
import { useStyles as boxUseStyles } from './PreviewBox'
import classNames from 'classnames'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
    },
    imgContent: {
        zIndex: 999,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imgBox: {
        width: '70%',
    },
    close: {
        width: 15,
        height: 15,
        cursor: 'pointer',
        backgroundSize: 'contain',
        position: 'absolute',
        top: 0,
        right: 0,
    },
    wordContent: {
        display: 'flex',
        justifyContent: 'center',
    },
    wordBox: {
        position: 'absolute',
        maxWidth: 150,
        maxHeight: 85,
        bottom: 150,
        width: 'auto',
        textAlign: 'left',
    },
    word: {
        fontSize: '12px',
        fontFamily: 'TwitterChirp',
        lineHeight: '16px',
        color: '#222',
        wordBreak: 'break-all',
    },
}))

const AnimatePic = () => {
    const classes = useStylesExtends(useStyles(), {})
    const boxClasses = useStylesExtends(boxUseStyles(), {})
    const Close = getAssetAsBlobURL(new URL('../assets/close.png', import.meta.url))

    const [start, setStart] = useState(true)

    const user = useUser()
    const userMeta = useEssay(user, start)
    const visitor = useCurrentVisitingUser()
    const visitorNfts = useNfts(visitor)
    const visitorMeta = useEssay(visitor, start)
    const defMeta = useDefaultEssay(visitorNfts)

    const [showMeta, setShowMeta] = useState<{ image: string; word: string } | undefined>(undefined)
    const [show, setShow] = useState(true)
    const [infoShow, setInfoShow] = useState(false)

    useEffect(() => {
        setShowMeta((user.userId === visitor.userId ? userMeta : visitorMeta) ?? defMeta)
    }, [userMeta, visitorMeta, defMeta])

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

    if (!show || !showMeta?.image) return <></>
    return (
        <div className={classes.root} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Drag>
                {start && showMeta?.word ? (
                    <Box className={classes.wordContent}>
                        <Box className={classNames(boxClasses.msgBox, classes.wordBox)}>
                            <Typography className={classes.word}>{showMeta?.word}</Typography>
                        </Box>
                    </Box>
                ) : null}
                <Box className={classes.imgContent}>
                    <div className={classes.imgBox}>
                        <img
                            src={showMeta?.image}
                            style={{
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                borderRadius: 10,
                                alignSelf: 'center',
                            }}
                        />
                    </div>
                </Box>
                {infoShow ? (
                    <div className={classes.close} onClick={handleClose} style={{ backgroundImage: `url(${Close})` }} />
                ) : null}
            </Drag>
        </div>
    )
}

export default AnimatePic
