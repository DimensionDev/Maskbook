import { makeStyles } from '@material-ui/core/styles'
import qr from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { cache } from '@dimensiondev/maskbook-shared'
import { Typography } from '@material-ui/core'
import { Trans } from 'react-i18next'
import classNames from 'classnames'
import { blue } from '@material-ui/core/colors'

interface QRProps {
    text: string
    options?: qr.QRCodeRenderersOptions
    canvasProps?: React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement & HTMLImageElement>,
        HTMLCanvasElement & HTMLImageElement
    >
}

const CACHE_SCOPE = 'qrcode'
const useStyles = makeStyles((theme) => ({
    text: {
        paddingTop: 50,
    },
    tryAgainText: { textDecoration: 'underline', cursor: 'pointer' },
    info: {
        color: theme.palette.mode === 'dark' ? blue[500] : blue[800],
    },
}))

export function QRCode({ text, options = {}, canvasProps }: QRProps) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    const [error, setError] = useState(false)
    const image = cache.get(CACHE_SCOPE, text)
    const classes = useStyles()

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
