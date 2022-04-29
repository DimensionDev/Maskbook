import { useState, useMemo } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
// import { InjectedDialog } from '@masknet/shared'
import { styled } from '@mui/material/styles'
// import DialogContent from '@mui/material/DialogContent'
import classNames from 'classnames'
import { IconClose, IconFull } from '../constants'
const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 99999,
    },
    body: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
    },
    iframeBox: {
        position: 'relative',
        width: '700px',
        height: '400px',
        overflow: 'hidden',
        borderRadius: '12px',
        border: 'solid 4px rgba(235,235,235,1)',
        backgroundColor: '#222',
        zIndex: 2,
    },
    fullScreen: {
        width: '100vw !important',
        height: '100vh !important',
        border: 'none',
        borderRadius: 0,
    },
    control: {
        position: 'absolute',
        top: 0,
        right: '-30px',
        width: '40px',
        borderRadius: '0 12px 12px 0',
        backgroundColor: 'rgba(255,255,255,.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingLeft: '10px',
        boxSizing: 'border-box',
        zIndex: 1,
        '&>img': {
            cursor: 'pointer',
            display: 'block',
            width: '18px',
            height: 'auto',
            padding: '5px',
        },
    },
    fullControl: {
        borderRadius: '12px',
        right: '20px',
        top: '20px',
        paddingLeft: 0,
        zIndex: 3,
    },
}))

const IFrame = styled('iframe')`
    display: block;
    border: none;
    width: 100%;
    height: 100%;
`
const gameUrls = [
    { id: 1, url: 'https://elevenzhou.github.io/Space/' },
    { id: 2, url: 'https://whitelist.helloweb3.io/token/1' },
    { id: 3, url: 'https://vf-prod.strictlyfromnowhere.com/' },
]

interface Props {
    id: number | string
    isShow: boolean
    onClose: () => void
}

const GameWindow = (props: Props) => {
    const classes = useStylesExtends(useStyles(), {})

    const [isFullScreen, setFullScreen] = useState(false)

    const handleClose = () => {
        setFullScreen(false)
        props.onClose()
    }

    const toggleFullscreen = () => {
        setFullScreen((prev) => !prev)
    }

    const gameUrl = useMemo(() => {
        return gameUrls.find((item) => item.id === props.id)?.url
    }, [props.id])

    return props.isShow ? (
        <div className={classes.root}>
            <div className={classes.body}>
                <div className={classNames(classes.iframeBox, { [classes.fullScreen]: isFullScreen })}>
                    {!!gameUrl && <IFrame src={gameUrl} />}
                </div>
                <div className={classNames(classes.control, { [classes.fullControl]: isFullScreen })}>
                    <img src={IconClose} onClick={handleClose} alt="close" />
                    <img src={IconFull} onClick={toggleFullscreen} alt="fullscreen" />
                </div>
            </div>
        </div>
    ) : null
}

export default GameWindow
