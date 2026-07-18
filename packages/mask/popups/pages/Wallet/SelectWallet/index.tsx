import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'

import { EMPTY_LIST, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useChainIdValid, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ProviderType, type ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, Typography, type BoxProps } from '@mui/material'
import { first } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAsync } from 'react-use'
import { WalletItem } from '../../../components/WalletItem/index.js'
import { useTitle } from '../../../hooks/index.js'

const useStyles = makeStyles()((theme) => ({
    item: {
        color: theme.palette.maskColor.main,
    },
    placeholder: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actions: {
        background: theme.palette.maskColor.secondaryBottom,
        padding: theme.spacing(2),
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        columnGap: theme.spacing(2),
    },
}))

interface SelectWalletProps extends BoxProps {
    embed?: boolean
}
export const Component = memo(function SelectWallet({ embed, ...props }: SelectWalletProps) {
    const { t } = useLingui()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const source = params.get('source')
    const chainIdSearched = params.get('chainId')
    const isVerifyWalletFlow = params.has('verifyWallet')

    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: chainIdSearched ? (Number.parseInt(chainIdSearched, 10) as ChainId) : undefined,
    })

    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)

    const { value: localWallets = EMPTY_LIST } = useAsync(async () => Services.Wallet.getWallets(), [])

    const allWallets = useWallets()

    const wallets = useMemo(() => {
        if (!allWallets.length && localWallets.length) return localWallets
        return allWallets
    }, [localWallets, allWallets])
    const defaultWallet = params.get('address') || account || first(wallets)?.address
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
        if (isVerifyWalletFlow || embed) {
            await EVMWeb3.connect({
                account: selected,
                chainId,
                providerType: ProviderType.MaskWallet,
            })

            if (embed) return

            navigate(PopupRoutes.ConnectWallet, { replace: true })
            return
        }

        const wallet = wallets.find((x) => isSameAddress(x.address, selected))

        if (wallet && source) await Services.Wallet.internalWalletConnect(wallet.address, source)

        if (selected) {
            await Services.Wallet.resolveMaskAccount([
                {
                    address: selected,
                },
            ])
        }

        return Services.Helper.removePopupWindow()
    }, [source, isVerifyWalletFlow, selected, chainId, wallets, Network, embed])

    useTitle(t`Select Wallet`)

    if (!chainIdValid)
        return (
            <Box
                {...props}
                className={props.className ? `${classes.placeholder} ${props.className}` : classes.placeholder}>
                <Typography>
                    <Trans>Unsupported network type</Trans>
                </Typography>
            </Box>
        )

    return (
        <Box
            data-hide-scrollbar
            {...props}
            sx={[
                { overflow: 'auto', display: 'flex', flexGrow: 1, flexDirection: 'column' },
                ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
            ]}>
            <Box
                sx={{
                    pt: 1,
                    pb: 9,
                    px: 2,
                    display: 'flex',
                    flexGrow: 1,
                    minHeight: 0,
                    flexDirection: 'column',
                    rowGap: '6px',
                }}>
                {wallets.map((item) => {
                    return (
                        <WalletItem
                            className={classes.item}
                            wallet={item}
                            key={item.address}
                            isSelected={isSameAddress(item.address, selected)}
                            onSelect={() => setSelected(item.address)}
                        />
                    )
                })}
            </Box>
            <div className={classes.actions}>
                <Button variant="outlined" fullWidth onClick={handleCancel}>
                    <Trans>Cancel</Trans>
                </Button>
                <ActionButton fullWidth onClick={handleConfirm}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            </div>
        </Box>
    )
})
