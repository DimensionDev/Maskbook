import { memo, useCallback, useMemo, useState } from 'react'
import { useAsync } from 'react-use'
import { first } from 'lodash-es'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ECKeyIdentifier, EMPTY_LIST, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { useChainContext, useChainIdValid, useNetworks, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, Typography } from '@mui/material'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { Web3 } from '@masknet/web3-providers'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { useTitle, PopupContext, useVerifiedWallets } from '../../../hooks/index.js'
import { WalletItem } from '../../../components/WalletItem/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import Services from '#services'
import { ProfilePhotoType } from '../type.js'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    item: {
        color: theme.palette.maskColor.main,
    },
    disabled: {
        opacity: '0.5',
        cursor: 'default',
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}))

const SelectWallet = memo(function SelectWallet() {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const external_request_id = params.get('external_request')
    const source = params.get('source')
    const { value: external_request } = useAsync(async () => {
        if (!external_request_id) return null
        return Services.Wallet.getEIP2255PermissionDetail(external_request_id)
    }, [external_request_id])
    const chainIdSearched = params.get('chainId')
    const isVerifyWalletFlow = params.get('verifyWallet')
    const isSettingNFTAvatarFlow = params.get('setNFTAvatar')

    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { proofs } = PersonaContext.useContainer()

    const bindingWallets = useVerifiedWallets(proofs)

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: chainIdSearched ? (Number.parseInt(chainIdSearched, 10) as ChainId) : undefined,
    })

    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)
    const { smartPayChainId } = PopupContext.useContainer()

    const { value: localWallets = EMPTY_LIST } = useAsync(async () => Services.Wallet.getWallets(), [])

    const allWallets = useWallets()

    const wallets = useMemo(() => {
        if (!allWallets.length && localWallets.length) return localWallets
        return allWallets
    }, [localWallets, allWallets])
    const defaultWallet = params.get('address') || account || (first(wallets)?.address ?? '')
    const [selected = defaultWallet, setSelected] = useState<string>()

    const handleCancel = useCallback(async () => {
        if (isVerifyWalletFlow) {
            navigate(-1)
        } else {
            // TODO Open the popup via a RPC request, and reject the request
            const rejected = await Promise.allSettled([
                Promise.reject({
                    message: 'User rejected the request.',
                }),
            ])
            await Services.Wallet.resolveMaskAccount(rejected[0])
            await Services.Helper.removePopupWindow()
        }
    }, [isVerifyWalletFlow])

    const handleConfirm = useCallback(async () => {
        if (external_request_id && external_request) {
            await Services.Wallet.grantEIP2255Permission(external_request_id, [selected])
            return Services.Helper.removePopupWindow()
        }
        if (isVerifyWalletFlow || isSettingNFTAvatarFlow) {
            await Web3.connect({
                account: selected,
                chainId,
                providerType: ProviderType.MaskWallet,
            })

            navigate(
                isSettingNFTAvatarFlow
                    ? urlcat(PopupRoutes.PersonaAvatarSetting, { tab: ProfilePhotoType.NFT })
                    : PopupRoutes.ConnectWallet,
                { replace: true },
            )
            return
        }

        const wallet = wallets.find((x) => isSameAddress(x.address, selected))

        if (wallet && source && !external_request_id)
            await Services.Wallet.connectWalletFromOrigin(wallet?.address, source)
        await Services.Wallet.resolveMaskAccount([
            wallet?.owner
                ? {
                      address: selected,
                      owner: wallet.owner,
                      identifier: ECKeyIdentifier.from(wallet.identifier).unwrapOr(undefined),
                  }
                : {
                      address: selected,
                  },
        ])

        if (smartPayChainId && wallet?.owner && chainId !== smartPayChainId) {
            await Web3.switchChain?.(smartPayChainId, {
                providerType: ProviderType.MaskWallet,
            })

            const network = networks.find((x) => x.chainId === smartPayChainId)
            if (network) await Network?.switchNetwork(network.ID)
        }
        return Services.Helper.removePopupWindow()
    }, [
        source,
        external_request,
        external_request_id,
        isVerifyWalletFlow,
        selected,
        chainId,
        wallets,
        smartPayChainId,
        isSettingNFTAvatarFlow,
        networks,
        Network,
    ])

    useTitle(external_request ? 'Connecting External Site' : t('popups_select_wallet'))

    if (!chainIdValid)
        return (
            <Box className={classes.placeholder}>
                <Typography>{t('popups_wallet_unsupported_network')}</Typography>
            </Box>
        )

    return (
        <Box overflow="auto" data-hide-scrollbar>
            {external_request ? (
                <Box textAlign="center" paddingX={2}>
                    Connecting: <i>{external_request.origin}</i>
                    <br />
                    Be aware of fraud!
                </Box>
            ) : null}
            <Box pt={1} pb={9} px={2} display="flex" flexDirection="column" rowGap="6px">
                {wallets
                    .filter((x) => {
                        if (x.owner && chainId !== ChainId.Matic) return false
                        if (!isVerifyWalletFlow && !isSettingNFTAvatarFlow) return true
                        return !x.owner
                    })
                    .map((item) => {
                        const disabled =
                            isVerifyWalletFlow && bindingWallets?.some((x) => isSameAddress(x.identity, item.address))

                        return (
                            <WalletItem
                                className={cx(classes.item, disabled ? classes.disabled : undefined)}
                                wallet={item}
                                key={item.address}
                                isSelected={isSameAddress(item.address, selected)}
                                onSelect={() => {
                                    if (!disabled) setSelected(item.address)
                                }}
                            />
                        )
                    })}
            </Box>
            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleCancel}>
                    {t('cancel')}
                </Button>
                <ActionButton
                    fullWidth
                    onClick={handleConfirm}
                    disabled={
                        isVerifyWalletFlow
                            ? !!wallets?.some((x) => isSameAddress(x.address, selected) && !!x.owner)
                            : false
                    }>
                    {t('confirm')}
                </ActionButton>
            </BottomController>
        </Box>
    )
})

export default SelectWallet
