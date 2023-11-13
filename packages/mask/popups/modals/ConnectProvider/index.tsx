import { memo, useCallback, useMemo } from 'react'
import { useAsyncFn, useMount } from 'react-use'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { delay, timeout } from '@masknet/kit'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useNetworkContext, useProviderDescriptor, useWeb3State } from '@masknet/web3-hooks-base'
import { PopupModalRoutes, type NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { ActionModal, type ActionModalBaseProps, useModalNavigate } from '../../components/index.js'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'

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
        ...(loading ?
            {
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
        :   {}),

        ...(timeout ?
            {
                border: `2px solid ${theme.palette.maskColor.danger}`,
                borderRadius: '50%',
                padding: 10,
            }
        :   {}),
    },
}))

export const ConnectProviderModal = memo<ActionModalBaseProps>(function ConnectProviderModal(props) {
    const t = useMaskSharedTrans()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const location = useLocation()
    const { pluginID } = useNetworkContext<NetworkPluginID.PLUGIN_EVM>()

    const { showSnackbar } = usePopupCustomSnackbar()

    const { Provider } = useWeb3State<void, NetworkPluginID.PLUGIN_EVM>(pluginID)

    const [params] = useSearchParams()
    const { providerType } = useMemo(() => {
        const providerType = params.get('providerType') as ProviderType | undefined

        return {
            providerType,
        }
    }, [params])

    const provider = useProviderDescriptor<void, NetworkPluginID.PLUGIN_EVM>(pluginID, providerType)

    const providerExist = useMemo(() => {
        if (!provider?.type) return false
        return Provider?.isReady(provider.type)
    }, [provider?.type, Provider])

    const handleClose = useCallback(() => {
        navigate(PopupRoutes.Personas, { replace: true })
    }, [])

    const [{ loading, error }, handleConnect] = useAsyncFn(async () => {
        const params = new URLSearchParams(location.search)

        const providerType = params.get('providerType') as ProviderType | undefined
        if (!providerType) return

        try {
            const connect = async () => {
                // wait for web3 state init
                await delay(1500)
                const chainId =
                    providerType === ProviderType.Fortmatic ?
                        ChainId.Mainnet
                    :   await EVMWeb3.getChainId({ providerType })
                return EVMWeb3.connect({
                    chainId,
                    providerType: providerType as ProviderType,
                })
            }

            // Fortmatic takes extra time because it requires the user to enter an account and password, a verification code
            const result = await timeout(connect(), providerType === ProviderType.Fortmatic ? 5 * 60 * 1000 : 30 * 1000)
            if (!result) return
            navigate(PopupRoutes.ConnectWallet, {
                replace: true,
            })
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'timeout') throw error
                if (error.message.includes('reject') || error.message.includes('cancel')) {
                    showSnackbar(t.popups_cancel_connect_provider(), {
                        variant: 'warning',
                    })
                    handleClose()
                }
            }
        }
    }, [])

    const isTimeout = error?.message === 'timeout'

    const { classes } = useStyles({ loading, timeout: isTimeout })

    const handleChooseAnotherWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.SelectProvider, { replace: true })
    }, [modalNavigate])

    useMount(() => handleConnect())

    return (
        <ActionModal
            header={
                providerExist ?
                    t.popups_wait_for_provider_connect_title({ providerType: String(providerType) })
                :   t.popups_not_connected_third_party_wallet_title()
            }
            keepMounted
            {...props}
            onClose={handleClose}>
            <Typography className={classes.tips}>
                {isTimeout ?
                    t.popups_wait_for_provider_connect_timeout()
                : providerExist ?
                    t.popups_wait_for_provider_connect_tips({ providerType: String(providerType) })
                :   t.popups_not_connected_third_party_wallet_tips({ providerType: String(providerType) })}
            </Typography>
            <Box mt={4} p={1.5} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                {provider?.icon ?
                    <Box className={classes.icon}>
                        <img src={provider.icon} style={{ width: 32, height: 32 }} />
                    </Box>
                :   null}
                {isTimeout ?
                    <Button variant="roundedContained" size="small" sx={{ width: 84, mt: 1.5 }} onClick={handleConnect}>
                        {t.retry()}
                    </Button>
                :   null}
                {!providerExist ?
                    <>
                        <Typography fontSize={14} lineHeight="18px" my={1.25}>
                            {t.popups_not_connected_third_party_wallet_description()}
                        </Typography>
                        <Button variant="roundedContained" size="small" onClick={handleChooseAnotherWallet}>
                            {t.popups_choose_another_wallet()}
                        </Button>
                    </>
                :   null}
            </Box>
        </ActionModal>
    )
})
