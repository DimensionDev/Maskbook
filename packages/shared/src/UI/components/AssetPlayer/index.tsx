import { memo, useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { ChainId, getRPCConstants } from '@masknet/web3-shared-evm'
import { first } from 'lodash-unified'
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react'
import { mediaViewerUrl } from '../../../constants'
import { useUpdateEffect } from 'react-use'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, SvgIconProps } from '@mui/material'
import { AssetLoadingIcon, MaskGreyIcon } from '@masknet/icons'

interface ERC721TokenQuery {
    contractAddress: string
    tokenId: string
    chainId: ChainId
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

export const AssetPlayer = memo<AssetPlayerProps>(({ url, type, options, iconProps, ...props }) => {
    const ref = useRef<IFrameComponent | null>(null)
    const classes = useStylesExtends(useStyles(), props)
    const [hidden, setHidden] = useState(Boolean(props.renderTimeout))
    const { RPC: RPC_Entries } = getRPCConstants(props.erc721Token?.chainId)
    const rpc = first(RPC_Entries)
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

    //#region setup iframe when url and options be changed
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
    //endregion

    type ERC721TokenNameMsg = { message: { type: 'name'; name: string } | { type: 'sourceType'; name: string } }
    //#region resource loaded error
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
    //#endregion

    useUpdateEffect(() => {
        setIframe()
    }, [setIframe])

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
                    className={playerState !== AssetPlayerState.NORMAL ? classes.hidden : classes.iframe}
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
                    allow="autoplay"
                    allowFullScreen
                />
            ),
        [hidden, playerState, classes, mediaViewerUrl],
    )

    return (
        <>
            <Box
                className={
                    playerState === AssetPlayerState.ERROR ? classes.errorPlaceholder : classes.loadingPlaceholder
                }
                style={{ display: playerState === AssetPlayerState.NORMAL ? 'none' : undefined }}>
                {playerState === AssetPlayerState.ERROR ? (
                    props.fallbackImage ? (
                        <img className={classes.loadingFailImage} src={props.fallbackImage.toString()} />
                    ) : (
                        <MaskGreyIcon className={classes.errorIcon} viewBox="0 0 36 36" {...iconProps} />
                    )
                ) : (
                    props.loadingIcon ?? <AssetLoadingIcon className={classes.loadingIcon} />
                )}
            </Box>
            {IframeResizerMemo}
        </>
    )
})
