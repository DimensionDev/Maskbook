import { memo, useState } from 'react'
import { Box, Typography, styled, Button, Dialog, DialogTitle, DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { LoadingButton } from '@mui/lab'
import { MaskColorVar } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { SuccessIcon, CopyIcon } from '@masknet/icons'
import { DesktopMnemonicConfirm } from '../../../../components/Mnemonic'
import { useDashboardI18N } from '../../../../locales'
import { useCopyToClipboard } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../../type'

const useStyles = makeStyles()((theme) => ({
    dialogTitle: {
        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
    },
    container: {
        padding: '40px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
    },
    title: {
        fontSize: 24,
        lineHeight: 1.25,
    },
    confirm: {
        marginTop: 24,
    },
    tips: {
        marginTop: 40,
        color: MaskColorVar.redMain,
        fontSize: 18,
        lineHeight: '24px',
        alignSelf: 'flex-start',
    },
    button: {
        height: 48,
        borderRadius: 24,
        fontSize: 18,
        marginTop: 24,
    },
    addressTitle: {
        color: MaskColorVar.normalText,
        fontSize: 14,
        lineHeight: '20px',
    },
    address: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 12,
        fontSize: 14,
        lineHeight: '20px',
    },
    copy: {
        fontSize: 20,
        marginLeft: 12,
        cursor: 'pointer',
        stroke: MaskColorVar.textPrimary,
    },
}))

const SuccessTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h5.fontSize,
    color: theme.palette.success.main,
    fontWeight: theme.typography.fontWeightMedium,
    margin: theme.spacing(2, 0),
}))

export interface VerifyMnemonicDialogProps {
    matched: boolean
    open: boolean
    onClose: () => void
    puzzleWords: string[]
    indexes: number[]
    onUpdateAnswerWords: (word: string, index: number) => void
    onSubmit: () => void
    address?: string
    loading: boolean
}

export const VerifyMnemonicDialog = memo<VerifyMnemonicDialogProps>(
    ({ matched, open, onClose, puzzleWords, indexes, onUpdateAnswerWords, onSubmit, loading, address }) => {
        const navigate = useNavigate()
        const t = useDashboardI18N()
        const [, copyToClipboard] = useCopyToClipboard()

        const copyWalletAddress = useSnackbarCallback({
            executor: async (address: string) => copyToClipboard(address),
            deps: [],
            successText: t.wallets_address_copied(),
        })

        return (
            <VerifyMnemonicDialogUI
                matched={matched}
                open={open}
                onClose={onClose}
                puzzleWords={puzzleWords}
                indexes={indexes}
                onUpdateAnswerWords={onUpdateAnswerWords}
                onSubmit={onSubmit}
                loading={loading}
                address={address}
                onCopy={copyWalletAddress}
                onDoneClick={() => navigate(RoutePaths.Wallets)}
            />
        )
    },
)

export interface VerifyMnemonicDialogUIProps extends VerifyMnemonicDialogProps {
    onCopy: (address: string) => void
    onDoneClick: () => void
}

export const VerifyMnemonicDialogUI = memo<VerifyMnemonicDialogUIProps>(
    ({
        matched,
        open,
        onClose,
        puzzleWords,
        indexes,
        onUpdateAnswerWords,
        onSubmit,
        loading,
        address,
        onCopy,
        onDoneClick,
    }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        const [verified, setVerified] = useState(false)

        return (
            <Dialog open={open} onClose={!address ? onClose : undefined} maxWidth="md">
                <DialogTitle className={classes.dialogTitle}>{t.wallets_create_wallet_verification()}</DialogTitle>
                <DialogContent style={{ padding: 0 }}>
                    <div className={classes.container}>
                        {address ? (
                            <>
                                <SuccessIcon sx={{ fontSize: 54 }} />
                                <SuccessTitle>{t.wallets_create_successfully_title()}</SuccessTitle>
                                <Box style={{ width: '100%' }}>
                                    <Typography className={classes.addressTitle}>
                                        {t.create_wallet_your_wallet_address()}
                                    </Typography>
                                </Box>
                                <Typography className={classes.address}>
                                    {address}
                                    <CopyIcon className={classes.copy} onClick={() => onCopy(address)} />
                                </Typography>
                                <Button fullWidth className={classes.button} onClick={onDoneClick}>
                                    {t.create_wallet_done()}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Typography className={classes.title}>{t.create_wallet_verify_words()}</Typography>
                                <Box className={classes.confirm}>
                                    <DesktopMnemonicConfirm
                                        indexes={indexes}
                                        puzzleWords={puzzleWords}
                                        onChange={onUpdateAnswerWords}
                                    />
                                </Box>

                                {!matched && verified ? (
                                    <Typography className={classes.tips}>
                                        {t.create_wallet_mnemonic_word_not_match()}
                                    </Typography>
                                ) : null}

                                <LoadingButton
                                    loading={loading}
                                    fullWidth
                                    className={classes.button}
                                    onClick={() => {
                                        if (!verified) setVerified(true)
                                        if (matched) onSubmit()
                                    }}>
                                    {t.verify()}
                                </LoadingButton>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        )
    },
)
