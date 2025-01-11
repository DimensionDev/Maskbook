import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useWallet } from '@masknet/web3-hooks-base'
import { Box, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo } from 'react'

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
        background: theme.palette.maskColor.bg,
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
    buttons: {
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: theme.spacing(2),
        marginBottom: theme.spacing(3),
        width: '100%',
    },
    button: {
        borderRadius: '99px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
        height: theme.spacing(5),
        border: 'none',
        fontWeight: 700,
        flexGrow: 1,
    },
    confirmButton: {
        background: theme.palette.maskColor.warn,
        color: theme.palette.maskColor.white,
    },
    cancelButton: {
        background: theme.palette.maskColor.thirdMain,
        color: theme.palette.maskColor.main,
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
    onClose: () => void
}

const DisconnectModal = memo(function DisconnectModal({ origin, onClose }: DisconnectModalProps) {
    const queryClient = useQueryClient()
    const { classes, cx } = useStyles()
    const { showSnackbar } = usePopupCustomSnackbar()
    const address = useWallet()?.address
    const { mutate: onDisconnect } = useMutation({
        mutationFn: async (): Promise<void> => {
            if (!address) return
            await Services.Wallet.disconnectWalletFromOrigin(address, origin, 'any')
        },
        onMutate: async () => {
            await queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', address] })
            showSnackbar(
                <Box display="flex" alignItems="center">
                    <Icons.FillSuccess style={{ marginRight: 6 }} />
                    <Trans>Disconnected successfully.</Trans>
                </Box>,
                { variant: 'success' },
            )
            onClose()
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', address] })
        },
    })
    const { mutate: onDisconnectAll } = useMutation({
        mutationFn: async () => {
            if (!address) return
            await Services.Wallet.disconnectAllOriginsConnectedFromWallet(address!, 'any')
        },
        onMutate: async () => {
            await queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', address!] })
            showSnackbar(
                <Box display="flex" alignItems="center">
                    <Icons.FillSuccess style={{ marginRight: 6 }} />
                    <Trans>Disconnected successfully.</Trans>
                </Box>,
                { variant: 'success' },
            )
            onClose()
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-granted-origins', address] })
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
                <Box className={classes.buttons}>
                    <button
                        type="button"
                        className={cx(classes.button, classes.confirmButton)}
                        disabled={!address}
                        onClick={() => onDisconnect()}>
                        <Trans>Confirm</Trans>
                    </button>
                    <button type="button" className={cx(classes.button, classes.cancelButton)} onClick={onClose}>
                        <Trans>Cancel</Trans>
                    </button>
                </Box>
                <button
                    type="button"
                    className={classes.disconnectAll}
                    disabled={!address}
                    onClick={() => onDisconnectAll()}>
                    <Trans>Disconnect all accounts</Trans>
                </button>
            </Box>
        </Box>
    )
})

export default DisconnectModal
