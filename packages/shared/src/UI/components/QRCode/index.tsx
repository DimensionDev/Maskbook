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
    const { classes } = useStyles()
    useEffect(() => {
        if (!ref.current || error) return

        qr.toCanvas(ref.current, text, options, (err) => {
            if (!err) return
            setError(true)
            throw err
        })
    }, [options, text, error])

    if (error)
        return (
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
        )
    return <canvas {...canvasProps} ref={ref} />
}
