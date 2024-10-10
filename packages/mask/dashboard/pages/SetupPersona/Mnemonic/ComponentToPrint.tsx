import { type RefAttributes, useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { QRCode } from 'react-qrcode-logo'
import { MaskWallet, PrintBackground } from '../../../assets/index.js'
import { Words } from './Words.js'
import { Icons } from '@masknet/icons'
import { Trans } from '@lingui/macro'

interface ComponentToPrintProps extends RefAttributes<unknown> {
    personaName: string
    words: string[]
    privateKey: string
    publicKey: string
}

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: theme.spacing(6),
        backgroundColor: theme.palette.maskColor.white,
        width: 630,
    },
    card: {
        width: '100%',
        background: `url(${PrintBackground}) no-repeat`,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
        color: theme.palette.maskColor.white,
        display: 'flex',
        alignItems: 'center',
        backgroundSize: 'cover',
    },
    personaName: {
        fontSize: 24,
        lineHeight: '120%',
        fontWeight: 700,
    },
    publicKeyTitle: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
    },
    publicKey: {
        fontSize: 10,
        lineHeight: '10px',
    },
    title: {
        fontSize: 16,
        lineHeight: '20px',
        margin: theme.spacing(2.5, 0),
        fontWeight: 700,
    },
    tips: {
        marginTop: theme.spacing(4.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        color: theme.palette.maskColor.publicMain,
        display: 'flex',
        alignItems: 'center',
        columnGap: 12,
    },
    wordCard: {
        backgroundColor: theme.palette.maskColor.publicBg,
        color: theme.palette.maskColor.publicThird,
        '&::marker': {
            backgroundColor: theme.palette.maskColor.publicBg,
            color: theme.palette.maskColor.publicThird,
        },
    },
    text: {
        color: theme.palette.maskColor.publicMain,
    },
}))

export function ComponentToPrint(props: ComponentToPrintProps) {
    const { words, privateKey, personaName, publicKey, ref } = props
    const { classes } = useStyles()

    const qrValue = useMemo(() => {
        const main = words?.length ? `mnemonic/${btoa(words.join(' '))}` : `privatekey/${privateKey}`
        return `mask://persona/${main}?nickname=${personaName}`
    }, [words?.join(','), privateKey, personaName])

    return (
        <Box className={classes.container} ref={ref}>
            <Box className={classes.card}>
                <Box flex={1}>
                    <Typography className={classes.personaName}>
                        <Trans>Persona: {personaName}</Trans>
                    </Typography>
                    <Typography className={classes.publicKeyTitle}>
                        <Trans>
                            Public Key:{' '}
                            <Typography component="span" className={classes.publicKey}>
                                {publicKey}
                            </Typography>
                        </Trans>
                    </Typography>
                </Box>
                <QRCode
                    value={qrValue}
                    ecLevel="L"
                    size={136}
                    quietZone={6}
                    logoImage={MaskWallet}
                    logoWidth={28}
                    logoHeight={28}
                />
            </Box>
            <Typography className={classes.title}>
                <Trans>Identity ID</Trans>
            </Typography>
            <Words words={words} classes={{ text: classes.text, wordCard: classes.wordCard }} />
            <Typography className={classes.tips}>
                <Icons.Info variant="light" size={20} />
                <Trans>This QR includes your identity, please keep it safely.</Trans>
            </Typography>
        </Box>
    )
}
