import { useRef, useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import qr from 'qrcode'
import { Trans } from 'react-i18next'
import { nativeAPI } from '../../utils/native-rpc'
import { useColorStyles } from '../../utils/theme'
import { cache } from '../../utils/sessionStorageCache'

interface QRProps {
    text: string
    options?: qr.QRCodeRenderersOptions
    canvasProps?: React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement & HTMLImageElement>,
        HTMLCanvasElement & HTMLImageElement
    >
}

const CACHE_SCOPE = 'qrcode'

const useStyles = makeStyles({
    text: {
        paddingTop: 50,
    },
    tryAgainText: { textDecoration: 'underline', cursor: 'pointer' },
})

export function QRCode({ text, options = {}, canvasProps }: QRProps) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    const [error, setError] = useState(false)
    const image = cache.get(CACHE_SCOPE, text)
    const classes = { ...useStyles(), ...useColorStyles() }

    useEffect(() => {
        if (!ref.current || error) return

        qr.toCanvas(ref.current, text, options, (err: Error) => {
            if (err) {
                setError(true)
                cache.remove(CACHE_SCOPE, text)
                throw err
            }
            const dataURL = ref.current?.toDataURL()
            if (dataURL) {
                cache.set(CACHE_SCOPE, text, dataURL)
            }
        })
    }, [options, text, error])

    return error ? (
        <>
            <Typography color="textPrimary" variant="body1" className={classes.text}>
                <Trans
                    i18nKey="backup_qrcode_error"
                    components={{
                        again: (
                            <span
                                onClick={() => {
                                    setError(false)
                                }}
                                className={classNames(classes.info, classes.tryAgainText)}
                            />
                        ),
                    }}
                />
            </Typography>
        </>
    ) : image ? (
        <img src={image} {...canvasProps} />
    ) : (
        <canvas {...canvasProps} ref={ref} />
    )
}

export function NativeQRScanner(props: { onScan?: (val: string) => void; onQuit?: () => void }) {
    useAsync(async () => {
        try {
            if (nativeAPI?.type === 'iOS') {
                props.onScan?.(await nativeAPI.api.scanQRCode())
            } else {
                // TODO:
                throw new Error('Not supported on Android')
            }
        } catch (e) {
            props.onQuit?.()
        }
    })
    return null
}
