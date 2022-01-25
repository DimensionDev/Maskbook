import { FC, HTMLProps, useMemo } from 'react'
import '@webcomponents/custom-elements'
import '@google/model-viewer/dist/model-viewer'
import { AssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

// interface ModelViewElementProps extends HTMLProps<HTMLDivElement> {
//     'shadow-intensity': string
//     'camera-controls': boolean
//     'auto-rotate': boolean
//     ar: boolean
// }

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any
        }
    }
}

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

const useStyles = makeStyles()((theme) => ({
    // body: {
    //     width: '90%',
    //     height: '100%',
    //     margin: 'auto',
    // },
    // normal: {
    //     top: 0,
    // },
    // punk: {
    //     top: '5%',
    // },
    body: {
        display: 'flex',
        justifyContent: 'center',
    },
    player: {
        maxWidth: '90%',
        maxHeight: '100%',
        border: 'none',
    },
    errorPlaceholder: {
        padding: '82px 0',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '100%',
    },
    loadingPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '74px 0',
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
}))

const ModelView: FC<ModelViewProps> = ({ source, ...rest }) => {
    const { classes } = useStyles()
    console.log('source', source)
    return useMemo(() => {
        if (!source) return null
        return (
            <div {...rest}>
                <AssetPlayer
                    url={source}
                    options={{
                        playsInline: true,
                    }}
                    classes={classes}
                />
                {/* <model-viewer
                    style={{ width: '90%', height: '100%', top: source === Punk3D.url ? '5%' : 0, margin: 'auto' }}
                    src={source}
                    shadow-intensity="1"
                    camera-controls
                    auto-rotate
                    ar
                /> */}
            </div>
        )
    }, [source])
}

export default ModelView
