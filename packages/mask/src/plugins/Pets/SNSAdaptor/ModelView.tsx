import { FC, HTMLProps, useMemo } from 'react'
import { AssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'

interface ModelViewProps extends HTMLProps<HTMLDivElement> {
    source: string
}

const useStyles = makeStyles()((theme) => ({
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
    iframe: {
        minHeight: 1,
        minWidth: 1,
    },
}))

const ModelView: FC<ModelViewProps> = ({ source, ...rest }) => {
    const { classes } = useStyles()
    return useMemo(() => {
        if (!source) return null
        return (
            <div {...rest}>
                <AssetPlayer
                    url={source}
                    options={{
                        playsInline: true,
                    }}
                    classes={{
                        errorPlaceholder: classes.errorPlaceholder,
                        errorIcon: classes.errorIcon,
                        loadingPlaceholder: classes.loadingPlaceholder,
                        loadingIcon: classes.loadingIcon,
                        iframe: classes.iframe,
                    }}
                    showIframeFromInit
                />
            </div>
        )
    }, [source])
}

export default ModelView
