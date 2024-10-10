import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import type { OwnerERC721TokenInfo } from '../types.js'
import { ImageLoader } from './ImageLoader.js'
import ModelView from './ModelView.js'
import { Trans } from '@lingui/macro'

export const useStyles = makeStyles()((theme) => ({
    box: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100% - 16px)',
        border: '1px dashed #bbb',
        borderRadius: '4px',
        marginTop: '16px',
        boxSizing: 'border-box',
        padding: '8px',
        overflow: 'hidden',
    },
    msgBox: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 0 8px #ddd',
        opacity: 1,
        pointerEvents: 'none',
        transition: 'all 200ms',
        padding: '12px',
        fontSize: '12px',
        lineHeight: '16px',
        color: '#222',
        textAlign: 'center',
        marginBottom: '12px',
        '&::before': {
            content: '""',
            width: '8px',
            height: '8px',
            backgroundColor: '#fff',
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            boxShadow: '3px 3px 6px #ccc',
            transform: 'translateX(-50%) rotate(45deg)',
        },

        '@keyframes word-show': {
            '0%': {
                opacity: 0,
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
    wordShow: {
        animation: 'word-show 0.9s both;',
        fontSize: '12px',
        fontFamily: 'TwitterChirp',
        lineHeight: '16px',
        color: '#222',
        textAlign: 'left',
        overflowWrap: 'break-word',
    },
    image: {
        borderRadius: '4px',
        width: '100%',
        opacity: 0,
        transition: 'all 200ms',
        '@keyframes image-show': {
            '0%': {
                opacity: 0,
            },
            '100%': {
                opacity: '1',
            },
        },
        animation: 'image-show 0.4s both;',
    },
    video: {
        width: '100%',
        height: '100%',
        transition: 'all 200ms',
    },
    noData: {
        paddingBottom: '-12px',
        color: '#7b8192',
        fontSize: '12px',
        textAlign: 'center',
    },
    glbView: {
        width: '100%',
        height: 150,
    },
}))

interface Props {
    message?: string
    imageUrl?: string
    mediaUrl?: string
    tokenInfo?: OwnerERC721TokenInfo | null
}

export function PreviewBox(props: Props) {
    const { classes, cx } = useStyles()

    const renderPreview = (mediaUrl: string, imageUrl: string) => {
        if (/\.(mp4|webm|ogg)/.test(mediaUrl ?? '')) {
            return (
                <video className={classes.video} autoPlay loop muted playsInline poster={imageUrl}>
                    <source
                        src={mediaUrl}
                        type={`video/${mediaUrl.slice(Math.max(0, mediaUrl.lastIndexOf('.') + 1))}`}
                    />
                </video>
            )
        } else {
            return <ImageLoader className={classes.image} src={imageUrl} />
        }
    }

    return (
        <div className={classes.box}>
            {props.message ?
                <div
                    className={cx({
                        [classes.msgBox]: true,
                        [classes.wordShow]: true,
                    })}>
                    {props.message}
                </div>
            :   null}
            {props.mediaUrl ?
                props.tokenInfo?.glbSupport ?
                    <div>
                        <ModelView className={classes.glbView} source={props.mediaUrl} />
                    </div>
                :   renderPreview(props.mediaUrl, props.imageUrl ?? '')
            :   null}
            {!(props.message || props.mediaUrl) && (
                <div className={classes.noData}>
                    <Typography color="textPrimary">
                        <Trans>Preview</Trans>
                    </Typography>
                </div>
            )}
        </div>
    )
}
