import { first } from 'lodash-unified'
import { memo, useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { getRPCConstants } from '@masknet/web3-shared-evm'
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react'
import { mediaViewerUrl } from '../../../constants'
import { useUpdateEffect } from 'react-use'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, SvgIconProps } from '@mui/material'
import { Icon } from '@masknet/icons'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

interface ERC721TokenQuery {
    contractAddress: string
    tokenId: string
    chainId?: Web3Helper.ChainIdAll
}

interface AssetPlayerProps
    extends withClasses<
        'errorPlaceholder' | 'errorIcon' | 'loadingPlaceholder' | 'loadingIcon' | 'loadingFailImage' | 'iframe'
    > {
    url?: string
    type?: string
    options?: {
        autoPlay?: boolean
        controls?: boolean
        playsInline?: boolean
        loop?: boolean
        muted?: boolean
    }
    loadingIcon?: React.ReactNode
    erc721Token?: ERC721TokenQuery
    renderTimeout?: number
    iconProps?: SvgIconProps
    fallbackImage?: URL
    isFixedIframeSize?: boolean
    showIframeFromInit?: boolean
    fallbackResourceLoader?: JSX.Element
    setERC721TokenName?: (name: string) => void
    setSourceType?: (type: string) => void
}
const useStyles = makeStyles()({
    hidden: {
        position: 'absolute',
        visibility: 'hidden',
    },
})

enum AssetPlayerState {
    LOADING = 0,
    INIT = 1,
    NORMAL = 2,
    ERROR = 3,
}

export const AssetPlayer = memo<AssetPlayerProps>((props) => {
    const ref = useRef<IFrameComponent | null>(null)
    const { url, type, options, iconProps, isFixedIframeSize = true } = props
    const classes = useStylesExtends(useStyles(), props)
    const [hidden, setHidden] = useState(Boolean(props.renderTimeout))
    const { RPC_URLS } = getRPCConstants(props.erc721Token?.chainId)
    const rpc = first(RPC_URLS)
    const erc721Token = rpc ? ({ ...props.erc721Token, rpc } as ERC721TokenQuery) : undefined
    const [playerState, setPlayerState] = useState(
        url || erc721Token ? AssetPlayerState.LOADING : AssetPlayerState.ERROR,
    )

    useEffect(() => {
        if (!props.renderTimeout || !hidden) return

        const timer = setTimeout(() => {
            setHidden(false)
        }, props.renderTimeout)

        return () => clearTimeout(timer)
    }, [props.renderTimeout, hidden])

    // #region setup iframe when url and options be changed
    const setIframe = useCallback(() => {
        // if iframe isn't be init or the load error has been existed
        if (!ref.current || playerState === AssetPlayerState.ERROR || playerState === AssetPlayerState.NORMAL) return
        if (!url && !erc721Token) {
            setPlayerState(AssetPlayerState.ERROR)
            return
        }
        if (playerState === AssetPlayerState.INIT) {
            ref.current.iFrameResizer.sendMessage({
                url,
                erc721Token,
                type,
                ...options,
            })
            return
        }
    }, [url, JSON.stringify(erc721Token), type, JSON.stringify(options), playerState])
    // endregion
    type ERC721TokenNameMsg = { message: { type: 'name'; name: string } | { type: 'sourceType'; name: string } }
    // #region resource loaded error
    const onMessage = useCallback(
        ({
            message,
        }: {
            message: { name: string } | ERC721TokenNameMsg | { type: 'webglContextLost' } | { type: 'reload' }
        }) => {
            if ((message as { name: string })?.name === 'Error') {
                setPlayerState(AssetPlayerState.ERROR)
            }
            if ((message as { type: 'webglContextLost' })?.type === 'webglContextLost') {
                setHidden(true)
                setPlayerState(AssetPlayerState.LOADING)
                setTimeout(() => setHidden(false), 1000)
            }
            if ((message as ERC721TokenNameMsg).message?.type === 'name') {
                props.setERC721TokenName?.((message as ERC721TokenNameMsg).message.name)
            }
            if ((message as ERC721TokenNameMsg).message?.type === 'sourceType') {
                props.setSourceType?.((message as ERC721TokenNameMsg).message.name)
            }
        },
        [],
    )
    // #endregion

    useUpdateEffect(() => {
        setIframe()
    }, [setIframe])

    // Workaround for a bug of `iframe-resizer-react`:
    // When the content of iframe loaded, `IframeResizer` triggers a `size` event,
    // but the `height` and `width` value of that `size` event isn't equal to the content.
    // (Sometimes it doesn't matter, if the size of iframe has been set fixed already)
    // Meanwhile `IframeResizer` triggers a `resize` event when the size of
    // parent of iframe changed, this time the returned `height` and `width` is right.
    // So resize the parent manually.
    useEffect(() => {
        if (playerState !== AssetPlayerState.NORMAL && isFixedIframeSize) return
        const resize = (height: string) => () => {
            if (!ref.current?.parentElement) return
            ref.current.parentElement.style.height = height
        }
        const noSenseHeight = '100px'
        const timerOne = setTimeout(resize(noSenseHeight), 100)
        const timerTwo = setTimeout(resize(''), 150)
        return () => {
            clearTimeout(timerOne)
            clearTimeout(timerTwo)
        }
    }, [playerState, ref.current])

    useEffect(() => {
        if (playerState === AssetPlayerState.NORMAL) {
            ref.current?.iFrameResizer.sendMessage({ loaded: true })
        }
    }, [playerState, ref.current])

    const IframeResizerMemo = useMemo(
        () =>
            hidden ? null : (
                <IframeResizer
                    src={mediaViewerUrl}
                    onInit={(iframe: IFrameComponent) => {
                        ref.current = iframe
                        setPlayerState(AssetPlayerState.INIT)
                        setIframe()
                    }}
                    className={
                        ![AssetPlayerState.NORMAL, AssetPlayerState.INIT].includes(playerState)
                            ? classes.hidden
                            : classes.iframe
                    }
                    onResized={({ type }) => {
                        if (type === 'init' || playerState === AssetPlayerState.NORMAL) return
                        setPlayerState(AssetPlayerState.NORMAL)
                    }}
                    style={{
                        width: playerState !== AssetPlayerState.NORMAL ? 0 : undefined,
                        height: playerState !== AssetPlayerState.NORMAL ? 0 : undefined,
                    }}
                    checkOrigin={false}
                    onMessage={onMessage}
                    frameBorder="0"
                    resizeFrom="child"
                    allow="autoplay"
                    allowFullScreen
                />
            ),
        [hidden, playerState, classes.hidden, classes.iframe, mediaViewerUrl],
    )

    return (
        <>
            <Box
                className={
                    playerState === AssetPlayerState.ERROR ? classes.errorPlaceholder : classes.loadingPlaceholder
                }
                style={{
                    display: [AssetPlayerState.NORMAL, AssetPlayerState.INIT].includes(playerState)
                        ? 'none'
                        : undefined,
                }}>
                {playerState === AssetPlayerState.ERROR
                    ? props.fallbackResourceLoader ??
                      (props.fallbackImage ? (
                          <img className={classes.loadingFailImage} src={props.fallbackImage.toString()} />
                      ) : (
                          <Icon type="maskPlaceholder" className={classes.errorIcon} />
                      ))
                    : props.loadingIcon ?? <Icon type="assetLoading" className={classes.loadingIcon} />}
            </Box>
            {IframeResizerMemo}
        </>
    )
})
