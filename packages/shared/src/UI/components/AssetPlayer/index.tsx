import { memo, useRef, useCallback, useState } from 'react'
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react'
import { mediaViewerUrl } from '../../../constants'
import { useTimeoutFn, useUpdateEffect } from 'react-use'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Box, SvgIconProps } from '@mui/material'
import { AssetLoadingIcon, MaskGreyIcon } from '@masknet/icons'

interface AssetPlayerProps
    extends withClasses<'errorPlaceholder' | 'errorIcon' | 'loadingPlaceholder' | 'loadingIcon'> {
    url?: string
    type?: string
    options?: {
        autoPlay?: boolean
        controls?: boolean
        playsInline?: boolean
        loop?: boolean
        muted?: boolean
    }
    iconProps?: SvgIconProps
}
const useStyles = makeStyles()((theme) => ({
    errorPlaceholder: {
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '100%',
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
    loadingPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
}))

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
    const [playerState, setPlayerState] = useState(url ? AssetPlayerState.LOADING : AssetPlayerState.ERROR)

    // #region If onResized is not triggered within the specified time, set player state to error
    const [, cancel, reset] = useTimeoutFn(() => {
        if (playerState !== AssetPlayerState.NORMAL) {
            setPlayerState(AssetPlayerState.ERROR)
        }
    }, TIMEOUT)
    // #endregion

    // #region setup iframe when url and options be changed
    const setIframe = useCallback(() => {
        // if iframe isn't be init or the load error has been existed
        if (!ref.current || playerState === AssetPlayerState.ERROR) return
        if (!url) {
            setPlayerState(AssetPlayerState.ERROR)
            return
        }
        if (playerState === AssetPlayerState.INIT || playerState === AssetPlayerState.NORMAL) {
            reset()
            ref.current.iFrameResizer.sendMessage({
                url,
                type,
                ...options,
            })
            return
        }
    }, [url, type, JSON.stringify(options), playerState])
    // #endregion

    // #region resource loaded error
    const onMessage = useCallback(({ message }: { message: { name: string } }) => {
        if (message?.name === 'Error') {
            setPlayerState(AssetPlayerState.ERROR)
        }
    }, [])
    // #endregion

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
                    <MaskGreyIcon className={classes.errorIcon} viewBox="0 0 36 36" {...iconProps} />
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
                onResized={({ type }) => {
                    if (type === 'init') return
                    cancel()
                    setPlayerState(AssetPlayerState.NORMAL)
                }}
                style={{ width: playerState !== AssetPlayerState.NORMAL ? 0 : undefined }}
                checkOrigin={false}
                onMessage={onMessage}
                frameBorder="0"
                allow="autoplay"
                allowFullScreen
            />
        </>
    )
})
