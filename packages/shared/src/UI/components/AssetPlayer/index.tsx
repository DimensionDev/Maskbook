import { memo, useRef, useCallback, useState } from 'react'
import { ChainId, getRPCConstants } from '@masknet/web3-shared-evm'
import { first } from 'lodash-unified'
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react'
import { mediaViewerUrl } from '../../../constants'
import { useTimeoutFn, useUpdateEffect } from 'react-use'
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
    erc721Token?: ERC721TokenQuery
    iconProps?: SvgIconProps
    fallbackImage?: URL
    setERC721TokenName?: (name: string) => void
}
const useStyles = makeStyles()({})

enum AssetPlayerState {
    LOADING = 0,
    INIT = 1,
    NORMAL = 2,
    ERROR = 3,
}

const TIMEOUT = 10000

export const AssetPlayer = memo<AssetPlayerProps>(({ url, type, options, iconProps, ...props }) => {
    const ref = useRef<IFrameComponent | null>(null)
    const classes = useStylesExtends(useStyles(), props)
    const { RPC: RPC_Entries } = getRPCConstants(props.erc721Token?.chainId)
    const rpc = first(RPC_Entries)
    const erc721Token = rpc ? ({ ...props.erc721Token, rpc } as ERC721TokenQuery) : undefined
    const [playerState, setPlayerState] = useState(
        url || erc721Token ? AssetPlayerState.LOADING : AssetPlayerState.ERROR,
    )

    //#region If onResized is not triggered within the specified time, set player state to error
    const [, cancel, reset] = useTimeoutFn(() => {
        if (playerState !== AssetPlayerState.NORMAL) {
            setPlayerState(AssetPlayerState.ERROR)
        }
    }, TIMEOUT)
    //#endregion

    //#region setup iframe when url and options be changed
    const setIframe = useCallback(() => {
        // if iframe isn't be init or the load error has been existed
        if (!ref.current || playerState === AssetPlayerState.ERROR || playerState === AssetPlayerState.NORMAL) return
        if (!url && !erc721Token) {
            setPlayerState(AssetPlayerState.ERROR)
            return
        }
        if (playerState === AssetPlayerState.INIT) {
            reset()
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

    type ERC721TokenNameMsg = { type: 'name'; name: string }
    //#region resource loaded error
    const onMessage = useCallback(({ message }: { message: { name: string } | ERC721TokenNameMsg }) => {
        if (message?.name === 'Error') {
            setPlayerState(AssetPlayerState.ERROR)
        }

        if ((message as ERC721TokenNameMsg).type === 'name') {
            props.setERC721TokenName?.((message as ERC721TokenNameMsg).name)
        }
    }, [])
    //#endregion

    useUpdateEffect(() => {
        setIframe()
    }, [setIframe])

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
                    <AssetLoadingIcon className={classes.loadingIcon} />
                )}
            </Box>
            <IframeResizer
                src={mediaViewerUrl}
                onInit={(iframe: IFrameComponent) => {
                    ref.current = iframe
                    setPlayerState(AssetPlayerState.INIT)
                    setIframe()
                }}
                className={playerState !== AssetPlayerState.NORMAL ? '' : classes.iframe}
                onResized={({ type }) => {
                    if (type === 'init' || playerState === AssetPlayerState.NORMAL) return
                    cancel()
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
        </>
    )
})
