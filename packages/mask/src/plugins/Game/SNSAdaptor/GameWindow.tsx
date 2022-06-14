import { useState, useMemo } from 'react'
import classNames from 'classnames'
import { styled } from '@mui/material/styles'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { IconClose, IconFull, IconShare } from '../constants'
import { getTwitterId } from '../../../social-network-adaptor/twitter.com/utils/user'
import { useLocation } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import type { GameInfo, GameNFT } from '../types'

const useStyles = makeStyles()(() => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
    },
    shadow: {
        zIndex: 1000,
        pointerEvents: 'none',
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

interface Props {
    gameInfo: GameInfo | undefined
    tokenProps: GameNFT | undefined
    isShow: boolean
    isShadow: boolean
    onClose: () => void
    onShare: () => void
}

const GameWindow = (props: Props) => {
    const { gameInfo, tokenProps, isShow, onClose } = props
    const classes = useStylesExtends(useStyles(), {})

    const [isFullScreen, setFullScreen] = useState(false)

    const handleClose = () => {
        setFullScreen(false)
        onClose()
    }

    const toggleFullscreen = () => {
        setFullScreen((prev) => !prev)
    }

    const windowStyle = useMemo(() => {
        return {
            width: `${gameInfo?.width ?? 700}px`,
            height: `${gameInfo?.height ?? 400}px`,
        }
    }, [gameInfo?.width, gameInfo?.height])

    const location = useLocation()
    const twitterId = useMemo(() => {
        return getTwitterId()
    }, [location])
    const chainId = useChainId()
    const gameUrl = useMemo(() => {
        return `${gameInfo?.url}?dom=nff&twitterId=${twitterId}&contract=${tokenProps?.contract}&tokenId=${tokenProps?.tokenId}&chainId=${chainId}`
    }, [props])

    return isShow ? (
        <div className={classNames(classes.root, { [classes.shadow]: props.isShadow })}>
            <div className={classes.body}>
                <div
                    className={classNames(classes.iframeBox, { [classes.fullScreen]: isFullScreen })}
                    style={windowStyle}>
                    {!!gameInfo?.url && <IFrame src={gameUrl} />}
                </div>
                <div className={classNames(classes.control, { [classes.fullControl]: isFullScreen })}>
                    <img src={IconClose} onClick={handleClose} alt="close" />
                    <img src={IconFull} onClick={toggleFullscreen} alt="fullscreen" />
                    <img src={IconShare} onClick={props.onShare} alt="fullscreen" />
                </div>
            </div>
        </div>
    ) : null
}

export default GameWindow
