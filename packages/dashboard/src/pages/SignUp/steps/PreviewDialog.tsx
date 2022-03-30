import { QRCode } from 'react-qrcode-logo'
import { makeStyles, MaskDialog, MaskColorVar, MaskLightTheme, useCustomSnackbar } from '@masknet/theme'
import { Box, Button, DialogContent, ThemeProvider, Typography } from '@mui/material'
import { MnemonicReveal } from '../../../components/Mnemonic'
import { MiniMaskIcon, InfoIcon, CopyIcon } from '@masknet/icons'
import { ForwardedRef, forwardRef, useEffect, useMemo, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { toJpeg } from 'html-to-image'
import { WatermarkURL } from '../../../assets'
import { useDashboardI18N } from '../../../locales'
import { useCopyToClipboard } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    preview: {
        position: 'relative',
        background: `url(${WatermarkURL}) repeat`,
        backgroundSize: '141px',
    },
    wordClass: {
        background: 'rgba(28, 104, 243, 0.1)',
        color: '#1C68F3',
    },
    card: {
        background: 'linear-gradient(180deg, #003EAF 0%, #1C68F3 100%)',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
        color: '#fff',
    },
    name: {
        maxWidth: 350,
        paddingLeft: 10,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    infoIcon: {
        color: MaskColorVar.secondaryInfoText,
        fontSize: 24,
        marginRight: 12,
    },
    copyIcon: {
        stroke: '#F6F6F8',
        fontSize: '14px',
        cursor: 'pointer',
        verticalAlign: 'middle',
    },
}))

interface PreviewDialogProps {
    open: boolean
    type: 'print' | 'download'
    personaName: string
    id?: string
    privateKey: string
    words?: string[]
    onClose(): void
}

export function PreviewDialog(props: PreviewDialogProps) {
    const { personaName, open, type, onClose } = props
    const t = useDashboardI18N()
    const ref = useRef(null)

    const onPrint = useReactToPrint({
        content: () => ref.current,
    })

    const onDownload = async () => {
        if (!ref.current) return

        const dataUrl = await toJpeg(ref.current, { quality: 0.95 })
        const link = document.createElement('a')
        link.download = `mask-persona-${personaName}.jpeg`
        link.href = dataUrl
        link.click()
    }

    const onClick = async () => {
        type === 'print' ? onPrint() : await onDownload()
        onClose()
    }

    return (
        <ThemeProvider theme={MaskLightTheme}>
            <MaskDialog
                title={type === 'print' ? t.print_preview() : t.download_preview()}
                open={open}
                onClose={onClose}>
                <DialogContent sx={{ marginTop: '-24px', padding: '0' }}>
                    <ComponentToPrint {...props} ref={ref} />

                    <Box padding="0 24px 24px">
                        <Button size="large" fullWidth onClick={onClick}>
                            {type === 'print' ? t.print() : t.download()}
                        </Button>
                    </Box>
                </DialogContent>
            </MaskDialog>
        </ThemeProvider>
    )
}

const ComponentToPrint = forwardRef((props: PreviewDialogProps, ref: ForwardedRef<any>) => {
    const { personaName, id, privateKey, words } = props
    const { classes } = useStyles()
    const t = useDashboardI18N()
    const [state, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = useCustomSnackbar()

    const qrValue = useMemo(() => {
        const main = words?.length ? `mnemonic/${btoa(words.join(' '))}` : `privatekey/${privateKey}`
        return `mask://persona/${main}?nickname=${personaName}`
    }, [words?.join(), privateKey, personaName])

    useEffect(() => {
        if (state.value) {
            showSnackbar(t.personas_export_persona_copy_success(), { variant: 'success' })
        }
        if (state.error?.message) {
            showSnackbar(t.personas_export_persona_copy_failed(), { variant: 'error' })
        }
    }, [state])

    return (
        <Box
            display="flex"
            justifyContent="center"
            height="100%"
            padding="24px 24px 0"
            ref={ref}
            color="#111432"
            sx={{ background: '#fff' }}>
            <Box maxWidth={746} className={classes.preview}>
                <Box className={classes.card} display="flex" alignItems="center">
                    <Box flex={1}>
                        <Box display="flex" alignItems="center" paddingBottom="8px">
                            <MiniMaskIcon />
                            <Typography fontSize={24} fontWeight={600} className={classes.name}>
                                {t.persona()}: {personaName}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                            <Typography fontSize={14} fontWeight={600} width={102}>
                                {t.create_account_mask_id()}
                            </Typography>
                            <Typography fontSize={10} fontWeight={600} sx={{ wordBreak: 'break-all', flex: 1 }}>
                                {id?.replace('ec_key:secp256k1/', '')}
                            </Typography>
                        </Box>

                        <Box display="flex">
                            <Typography fontSize={14} fontWeight={600} width={102}>
                                <span style={{ verticalAlign: 'middle' }}>{t.create_account_private_key()} </span>
                                <CopyIcon className={classes.copyIcon} onClick={() => copyToClipboard(privateKey)} />
                            </Typography>
                            <Typography
                                fontSize={10}
                                fontWeight={600}
                                sx={{ wordBreak: 'break-all', flex: 1, paddingRight: '8px' }}>
                                {privateKey}
                            </Typography>
                        </Box>
                    </Box>
                    <QRCode value={qrValue} ecLevel="L" size={120} quietZone={6} qrStyle="dots" />
                </Box>
                {words?.length ? (
                    <>
                        <Typography margin="24px 0" fontWeight={600}>
                            {t.create_account_identity_id()}
                        </Typography>
                        <MnemonicReveal words={words} indexed wordClass={classes.wordClass} />
                    </>
                ) : null}

                <Box display="flex" alignItems="center" margin="24px 0">
                    <InfoIcon className={classes.infoIcon} />
                    <Typography fontSize={12} fontWeight={700}>
                        {t.create_account_preview_tip()}
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
})
