import { makeStyles } from '@masknet/theme'
import qr from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { Typography } from '@mui/material'
import { Trans } from 'react-i18next'
import { blue } from '@mui/material/colors'

interface QRProps {
    text: string
    options?: qr.QRCodeRenderersOptions
    canvasProps?: React.DetailedHTMLProps<
        React.CanvasHTMLAttributes<HTMLCanvasElement & HTMLImageElement>,
        HTMLCanvasElement & HTMLImageElement
    >
}

const CACHE_SCOPE = 'qrcode'
const useStyles = makeStyles()((theme) => ({
    text: {
        paddingTop: 50,
    },
    info: {
        color: theme.palette.mode === 'dark' ? blue[500] : blue[800],
        extDecoration: 'underline',
        cursor: 'pointer',
    },
}))

export function QRCode({ text, options = {}, canvasProps }: QRProps) {
    const ref = useRef<HTMLCanvasElement | null>(null)
    const [error, setError] = useState(false)
    const image = cache.get(CACHE_SCOPE, text)
    const { classes } = useStyles()
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
                                className={classes.info}
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

const cache = {
    get(scope: string, key: string) {
        return sessionStorage.getItem(`${scope}:${key}`)
    },
    set(scope: string, key: string, value: string) {
        return sessionStorage.setItem(`${scope}:${key}`, value)
    },
    remove(scope: string, key: string) {
        return sessionStorage.removeItem(`${scope}:${key}`)
    },
}
