import { memo } from 'react'
import { Box, Typography, experimentalStyled as styled, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { LoadingButton } from '@material-ui/lab'
import { MaskColorVar, MaskDialog } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { SuccessIcon, CopyIcon } from '@masknet/icons'
import { DesktopMnemonicConfirm } from '../../../../components/Mnemonic'
import { useDashboardI18N } from '../../../../locales'
import { useCopyToClipboard } from 'react-use'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'

const useStyles = makeStyles()({
    container: {
        padding: '40px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: 1.25,
    },
    confirm: {
        marginTop: 24,
    },
    button: {
        height: 48,
        borderRadius: 24,
        fontSize: 18,
        marginTop: 50,
    },
    addressTitle: {
        color: MaskColorVar.normalText,
        fontSize: 14,
        lineHeight: '20px',
    },
    address: {
        display: 'flex',
        alignItems: 'center',
        color: '#111432',
        marginTop: 12,
        fontSize: 14,
        lineHeight: '20px',
    },
    copy: {
        fontSize: 20,
        marginLeft: 12,
        cursor: 'pointer',
        stroke: '#111432',
    },
})

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
        return (
            <MaskDialog title="Verification" open={open} onClose={!address ? onClose : undefined} maxWidth="md">
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
                            <Box className={classes.address}>
                                {address}
                                <CopyIcon className={classes.copy} onClick={() => onCopy(address)} />
                            </Box>
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
                            <LoadingButton
                                loading={loading}
                                fullWidth
                                className={classes.button}
                                disabled={!matched}
                                onClick={onSubmit}>
                                {t.verify()}
                            </LoadingButton>
                        </>
                    )}
                </div>
            </MaskDialog>
        )
    },
)
