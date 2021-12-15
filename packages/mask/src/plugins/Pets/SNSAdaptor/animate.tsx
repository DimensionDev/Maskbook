import { useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Typography, Box } from '@mui/material'
import { getAssetAsBlobURL } from '../../../utils'
import Drag from './drag'
import { useUser, useNfts, useEssay, useDefaultEssay, useCurrentVisitingUser } from '../hooks'

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
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 0 8px #ddd',
        opacity: 1,
        pointerEvents: 'none',
        transition: 'all 200ms',
        padding: 12,
        textAlign: 'left',
        animation: 'word-show 0.9s both',
        '&:before': {
            content: '""',
            width: 8,
            height: 8,
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: -4,
            left: '50%',
            boxShadow: '3px 3px 6px #ccc',
            transform: 'translateX(-50%) rotate(45deg)',
        },
        '@keyframes word-show': {
            '0%': {
                opacity: '0',
                transform: 'scale3d(1, 1, 1)',
            },
            '30%': {
                transform: 'scale3d(1.25, 0.75, 1)',
            },
            '40%': {
                transform: 'scale3d(0.75, 1.25, 1)',
            },
            '50%': {
                transform: 'scale3d(1.15, 0.85, 1)',
            },
            '65%': {
                transform: 'scale3d(0.95, 1.05, 1)',
            },
            '75%': {
                transform: 'scale3d(1.05, 0.95, 1)',
            },
            '100%': {
                transform: 'scale3d(1, 1, 1)',
            },
        },
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
        let meta
        if (user.userId === visitor.userId) {
            meta = userMeta ?? defMeta
        } else {
            meta = visitorMeta ?? defMeta
        }
        setShowMeta({ image: meta?.image ?? '', word: meta?.word ?? '' })
    }, [userMeta, visitorMeta, defMeta])

    const handleClose = () => setShow(false)
    const handleMouseEnter = () => setInfoShow(true)
    const handleMouseLeave = () => setInfoShow(false)

    useEffect(() => {
        let count = 0
        const timer = setInterval(() => {
            const check = count % 9 < 5
            setStart(check)
            count = count + 1
        }, 1000 * 1)
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
                        <Box className={classes.wordBox}>
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
