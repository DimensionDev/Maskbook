import Services from '#services'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { Box, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 100%), rgba(28, 104, 243, 0.20)',
        backdropFilter: 'blur(5px)',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: theme.palette.maskColor.white,
        borderRadius: '14px',
        width: '320px',
        alignItems: 'center',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    },
    title: {
        color: theme.palette.maskColor.main,
        fontSize: '16px',
        fontWeight: 700,
        lineHeight: '20px',
        marginBottom: '24px',
    },
    desc: {
        color: theme.palette.maskColor.second,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        marginBottom: '36px',
        textAlign: 'center',
    },
    confirmButton: {
        background: theme.palette.maskColor.warn,
        borderRadius: '99px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.white,
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        width: '100%',
        outline: 'none',
        border: 'none',
        padding: '11px',
        marginBottom: '16px',
        cursor: 'pointer',
    },
    cancelButton: {
        background: theme.palette.maskColor.thirdMain,
        borderRadius: '99px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.maskColor.main,
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '18px',
        width: '100%',
        outline: 'none',
        border: 'none',
        padding: '11px',
        marginBottom: '24px',
        cursor: 'pointer',
    },
    disconnectAll: {
        color: theme.palette.maskColor.highlight,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '18px',
        outline: 'none',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
}))

interface DisconnectModalProps {
    origin: string
    setOpen: (open: boolean) => void
}

const DisconnectModal = memo(function DisconnectModal({ origin, setOpen }: DisconnectModalProps) {
    const queryClient = useQueryClient()
    const { classes } = useStyles()
    const { showSnackbar } = usePopupCustomSnackbar()
    const wallet = useWallet()
    const { mutate: onDisconnect } = useMutation({
        mutationFn: useCallback(async (): Promise<void> => {
            if (!wallet) return
            await Services.Wallet.disconnectWalletFromOrigin(wallet.address, origin, 'any')
        }, []),
        onMutate: async () => {
            await queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', wallet?.address] })
            showSnackbar(<Trans>Disconnected.</Trans>, { variant: 'success' })
            setOpen(false)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', wallet?.address] })
        },
    })
    const { mutate: onDisconnectAll } = useMutation({
        mutationFn: useCallback(async (): Promise<void> => {
            if (!wallet) return
            await Services.Wallet.disconnectAllOriginsConnectedFromWallet(wallet!.address, 'any')
        }, [wallet?.address]),
        onMutate: async () => {
            await queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', wallet?.address] })
            showSnackbar(<Trans>Disconnected.</Trans>, { variant: 'success' })
            setOpen(false)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', wallet?.address] })
        },
    })
    return (
        <Box className={classes.container}>
            <Box className={classes.card}>
                <Typography className={classes.title}>
                    <Trans>Disconnect</Trans>
                </Typography>
                <Typography className={classes.desc}>
                    <Trans>
                        Are your sure you want to disconnect? You may lose part of functionalities of this website.
                    </Trans>
                </Typography>
                <button
                    type="button"
                    className={classes.confirmButton}
                    disabled={!wallet}
                    onClick={() => onDisconnect()}>
                    <Trans>Confirm</Trans>
                </button>
                <button type="button" className={classes.cancelButton} onClick={() => setOpen(false)}>
                    <Trans>Cancel</Trans>
                </button>
                <button
                    type="button"
                    className={classes.disconnectAll}
                    disabled={!wallet}
                    onClick={() => onDisconnectAll()}>
                    <Trans>Disconnect all accounts</Trans>
                </button>
            </Box>
        </Box>
    )
})

export default DisconnectModal
