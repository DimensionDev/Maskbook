import { forwardRef, type ForwardedRef, useMemo } from 'react'
import { useDashboardI18N } from '../../../locales/i18n_generated.js'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { QRCode } from 'react-qrcode-logo'

interface ComponentToPrintProps {
    personaName: string
    words: string[]
    privateKey: string
}

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: theme.spacing(6),
        backgroundColor: theme.palette.maskColor.white,
    },
    card: {
        background: 'linear-gradient(180deg, #003EAF 0%, #1C68F3 100%)',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
        color: theme.palette.maskColor.white,
        display: 'flex',
        alignItems: 'center',
    },
}))

export const ComponentToPrint = forwardRef((props: ComponentToPrintProps, ref: ForwardedRef<any>) => {
    const { words, privateKey, personaName } = props
    const t = useDashboardI18N()
    const { classes } = useStyles()

    const qrValue = useMemo(() => {
        const main = words?.length ? `mnemonic/${btoa(words.join(' '))}` : `privatekey/${privateKey}`
        return `mask://persona/${main}?nickname=${personaName}`
    }, [words?.join(','), privateKey, personaName])

    return (
        <Box className={classes.container} ref={ref}>
            <Box className={classes.card}>
                <Box flex={1} />
                <QRCode value={qrValue} ecLevel="L" size={136} quietZone={6} />
            </Box>
        </Box>
    )
})
