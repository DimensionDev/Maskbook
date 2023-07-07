import { memo, useCallback, useMemo } from 'react'
import { ActionModal, useActionModal, type ActionModalBaseProps, useModalNavigate } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useNetworkContext, useProviderDescriptor, useWeb3State } from '@masknet/web3-hooks-base'
import { useAsyncRetry } from 'react-use'
import { PopupModalRoutes, type NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { timeout } from '@masknet/kit'
import urlcat from 'urlcat'

interface StyleProps {
    loading: boolean
    timeout: boolean
}

const useStyles = makeStyles<StyleProps>()((theme, { loading, timeout }) => ({
    tips: {
        fontSize: 14,
        color: theme.palette.maskColor.third,
        fontWeight: 700,
        lineHeight: '18px',
        textAlign: 'center',
    },
    icon: {
        '@keyframes spinner': {
            to: {
                transform: 'rotate(360deg)',
            },
        },
        position: 'relative',
        width: 48,
        height: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...(loading
            ? {
                  '&:before': {
                      content: "''",
                      boxSizing: 'border-box',
                      position: 'absolute',
                      top: -5,
                      left: -5,
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      border: `2px solid ${theme.palette.maskColor.main}`,
                      borderTopColor: theme.palette.maskColor.second,
                      animation: 'spinner 2s linear infinite',
                  },
              }
            : {}),

        ...(timeout
            ? {
                  border: `2px solid ${theme.palette.maskColor.danger}`,
                  borderRadius: '50%',
                  padding: 10,
              }
            : {}),
    },
}))

export const ConnectProviderModal = memo<ActionModalBaseProps>(function ConnectProviderModal({ ...rest }) {
    const { t } = useI18N()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const { closeModal } = useActionModal()
    const location = useLocation()
    const { pluginID } = useNetworkContext<NetworkPluginID.PLUGIN_EVM>()

    const { showSnackbar } = usePopupCustomSnackbar()

    const { Provider } = useWeb3State<void, NetworkPluginID.PLUGIN_EVM>(pluginID)
    const { providerType } = useMemo(() => {
        const params = new URLSearchParams(location.search)
        const providerType = params.get('providerType')

        return {
            providerType: providerType ? providerType : undefined,
        }
    }, [])

    const provider = useProviderDescriptor<void, NetworkPluginID.PLUGIN_EVM>(pluginID, providerType)

    const providerExist = useMemo(() => {
        return Provider?.isReady(provider.type)
    }, [providerType, Provider])

    const handleClose = useCallback(() => {
        navigate(urlcat(PopupRoutes.Personas, { disableNewWindow: true }), { replace: true })
    }, [])

    const { loading, error, retry } = useAsyncRetry(async () => {
        if (!Provider?.isReady(provider.type)) return
        try {
            const connect = async () => {
                const chainId = await Web3.getChainId({ providerType: provider.type })
                return Web3.connect({
                    chainId,
                    providerType: provider.type,
                })
            }

            const result = await timeout(connect(), 30 * 1000)
            if (!result) return
            navigate(PopupRoutes.ConnectWallet, {
                replace: true,
            })
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'timeout') throw error
                if (error.message.includes('reject') || error.message.includes('cancel')) {
                    showSnackbar(t('popups_cancel_connect_provider'), {
                        variant: 'warning',
                    })
                    handleClose()
                }
            }
        }
    }, [providerType, Provider, handleClose])

    const isTimeout = error?.message === 'timeout'

    const { classes } = useStyles({ loading, timeout: isTimeout })

    const handleChooseAnotherWallet = useCallback(() => {
        modalNavigate(
            PopupModalRoutes.SelectProvider,
            {
                disableNewWindow: true,
            },
            { replace: true },
        )
    }, [])

    return (
        <ActionModal
            header={
                providerExist
                    ? t('popups_wait_for_provider_connect_title', { providerType })
                    : t('popups_not_connected_third_party_wallet_title')
            }
            keepMounted
            {...rest}
            onClose={handleClose}>
            <Typography className={classes.tips}>
                {isTimeout
                    ? t('popups_wait_for_provider_connect_timeout')
                    : t(
                          providerExist
                              ? 'popups_wait_for_provider_connect_tips'
                              : 'popups_not_connected_third_party_wallet_tips',
                          { providerType },
                      )}
            </Typography>
            <Box mt={4} p={1.5} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                <Box className={classes.icon}>
                    <img src={provider.icon.toString()} style={{ width: 32, height: 32 }} />
                </Box>
                {isTimeout ? (
                    <Button variant="roundedContained" size="small" sx={{ width: 84, mt: 1.5 }} onClick={retry}>
                        {t('retry')}
                    </Button>
                ) : null}
                {!providerExist ? (
                    <>
                        <Typography fontSize={14} lineHeight="18px" my={1.25}>
                            {t('popups_not_connected_third_party_wallet_description')}
                        </Typography>
                        <Button variant="roundedContained" size="small" onClick={handleChooseAnotherWallet}>
                            {t('popups_choose_another_wallet')}
                        </Button>
                    </>
                ) : null}
            </Box>
        </ActionModal>
    )
})
