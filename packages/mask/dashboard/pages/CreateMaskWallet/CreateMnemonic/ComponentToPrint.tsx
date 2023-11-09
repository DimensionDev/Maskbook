import { forwardRef, type ForwardedRef, useMemo } from 'react'
import { QRCode } from 'react-qrcode-logo'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { NetworkType } from '@masknet/web3-shared-evm'
import { EVMNetworkResolver } from '@masknet/web3-providers'
import { PrintBackground } from '../../../assets/index.js'
import { MnemonicReveal } from '../../../components/Mnemonic/index.js'
import { useDashboardTrans } from '../../../locales/i18n_generated.js'

interface ComponentToPrintProps {
    words: string[]
    address: string
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
    publicKeyTitle: {
        fontSize: 14,
        color: theme.palette.maskColor.white,
        lineHeight: '18px',
        fontWeight: 700,
    },
    publicKey: {
        fontSize: 10,
        color: theme.palette.maskColor.white,
        lineHeight: '10px',
    },
    title: {
        fontSize: 16,
        color: theme.palette.maskColor.publicMain,
        lineHeight: '20px',
        margin: theme.spacing(2.5, 0),
        fontWeight: 700,
    },
    tips: {
        marginTop: theme.spacing(4.5),
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
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
    qrWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: 148,
        height: 148,
        borderRadius: 6,
    },
}))

export const ComponentToPrint = forwardRef(function ComponentToPrint(
    props: ComponentToPrintProps,
    ref: ForwardedRef<any>,
) {
    const { words, address } = props
    const t = useDashboardTrans()
    const { classes } = useStyles()

    const qrValue = useMemo(() => {
        return `mask://wallet/mnemonic/${btoa(words.join(' '))}`
    }, [words.join(',')])

    return (
        <Box className={classes.container} ref={ref}>
            <Box className={classes.card}>
                <Box flex={1}>
                    <Typography className={classes.publicKeyTitle}>
                        {t.address()}:{' '}
                        <Typography component="span" className={classes.publicKey}>
                            {address}
                        </Typography>
                    </Typography>
                </Box>
                <div className={classes.qrWrapper}>
                    <QRCode
                        value={qrValue}
                        ecLevel="L"
                        size={136}
                        quietZone={6}
                        logoImage={EVMNetworkResolver.networkIcon(NetworkType.Ethereum)?.toString()}
                    />
                </div>
            </Box>
            <Typography className={classes.title}>{t.wallets_mnemonic_word()}</Typography>
            <MnemonicReveal words={words} indexed classes={{ wordCard: classes.wordCard, text: classes.text }} />
            <Typography className={classes.tips}>
                <Icons.Info variant="light" size={24} />
                {t.wallets_print_tips()}
            </Typography>
        </Box>
    )
})
