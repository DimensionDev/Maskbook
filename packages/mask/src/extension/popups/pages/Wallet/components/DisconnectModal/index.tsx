import { memo, useCallback } from 'react'
import { useI18N } from '../../../../../../utils/i18n-next-ui.js'
import { Box, Typography } from '@mui/material'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import Services from '#services'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { useWallet } from '@masknet/web3-hooks-base'
import { queryClient } from '@masknet/shared-base-ui'
import { useMutation } from '@tanstack/react-query'
import { getEnumAsArray } from '@masknet/kit'
import { isEqual } from 'lodash-es'

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
    site: string
    setOpen: (open: boolean) => void
}

const DisconnectModal = memo(function DisconnectModal({ site, setOpen }: DisconnectModalProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = usePopupCustomSnackbar()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const handleDisconnect = useCallback(async () => {
        if (!site) return
        if (!getEnumAsArray(EnhanceableSite).some((x) => isEqual(x.value, site))) return
        await Services.Wallet.recordConnectedSites(site as EnhanceableSite, false)
    }, [site, wallet])
    const { mutate: onDisconnect } = useMutation({
        mutationFn: handleDisconnect,
        onMutate: async () => {
            await queryClient.cancelQueries(['connectedSites', wallet?.address])
            queryClient.setQueryData(['connectedSites', wallet?.address], (oldData: string[] | undefined) => {
                if (!oldData) return undefined
                return oldData.filter((x) => x !== site)
            })
            showSnackbar(t('popups_wallet_disconnect_site_success'), { variant: 'success' })
            setOpen(false)
        },
        onSettled: () => {
            queryClient.invalidateQueries(['connectedSites', wallet?.address])
        },
    })
    const handleDisconnectAll = useCallback(async () => {
        await Services.Wallet.disconnectAll()
    }, [])
    const { mutate: onDisconnectAll } = useMutation({
        mutationFn: handleDisconnectAll,
        onMutate: async () => {
            await queryClient.cancelQueries(['connectedSites', wallet?.address])
            queryClient.setQueryData(['connectedSites', wallet?.address], (oldData) => {
                if (!oldData) return undefined
                return []
            })
            showSnackbar(t('popups_wallet_disconnect_site_success'), { variant: 'success' })
            setOpen(false)
        },
        onSettled: () => {
            queryClient.invalidateQueries(['connectedSites', wallet?.address])
        },
    })
    return (
        <Box className={classes.container}>
            <Box className={classes.card}>
                <Typography className={classes.title}>{t('plugin_wallet_disconnect')}</Typography>
                <Typography className={classes.desc}>{t('popups_wallet_disconnect_confirm')}</Typography>
                <button
                    type="button"
                    className={classes.confirmButton}
                    onClick={() => {
                        onDisconnect()
                    }}>
                    {t('confirm')}
                </button>
                <button
                    type="button"
                    className={classes.cancelButton}
                    onClick={() => {
                        setOpen(false)
                    }}>
                    {t('cancel')}
                </button>
                <button
                    type="button"
                    className={classes.disconnectAll}
                    onClick={() => {
                        onDisconnectAll()
                    }}>
                    {t('popups_wallet_disconnect_all')}
                </button>
            </Box>
        </Box>
    )
})

export default DisconnectModal
