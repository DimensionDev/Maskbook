import { memo, useCallback } from 'react'
import { ActionModal, useActionModal, type ActionModalBaseProps } from '../../components/index.js'
import { useWalletGroup } from '../../hooks/useWalletGroup.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { WalletItem } from '../../components/WalletItem/index.js'
import { useChainContext, useNetworks, useWallet, useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { PopupContext } from '../../hooks/usePopupContext.js'
import { ECKeyIdentifier, NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    root: {
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.5),
    },
    title: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 700,
        marginBottom: theme.spacing(1.5),
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: 6,
    },
}))
export const WalletGroupModal = memo<ActionModalBaseProps>(function WalletGroupModal(props) {
    const { classes } = useStyles()
    const walletGroup = useWalletGroup()
    const currentWallet = useWallet()
    const { smartPayChainId } = PopupContext.useContainer()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)

    const { closeModal } = useActionModal()

    const handleSelect = useCallback(
        async (wallet: Wallet) => {
            const address = wallet.address
            await EVMWeb3.connect({
                account: address,
                chainId: wallet.owner && smartPayChainId ? smartPayChainId : chainId,
                providerType: ProviderType.MaskWallet,
                owner: wallet.owner,
                identifier: ECKeyIdentifier.from(wallet.identifier).unwrapOr(undefined),
            })
            closeModal()
            if (wallet.owner && smartPayChainId) {
                const network = networks.find((x) => x.chainId === smartPayChainId)
                if (network) await Network?.switchNetwork(network.ID)
                await EVMWeb3.switchChain?.(smartPayChainId, {
                    providerType: ProviderType.MaskWallet,
                })
            }
        },
        [smartPayChainId, chainId, closeModal, Network, networks],
    )

    if (!walletGroup) return
    return (
        <ActionModal header={<Trans>Wallet Account</Trans>} {...props}>
            <Box className={classes.root}>
                {Object.entries(walletGroup.groups).map(([key, value], index) => {
                    return (
                        <Box key={key}>
                            <Typography className={classes.title}>
                                <Trans>Wallet Group #{String(index + 1)}</Trans>
                            </Typography>
                            <Box className={classes.list}>
                                {value.map((wallet) => {
                                    return (
                                        <WalletItem
                                            hiddenTag
                                            key={wallet.address}
                                            wallet={wallet}
                                            isSelected={isSameAddress(wallet.address, currentWallet?.address)}
                                            onSelect={handleSelect}
                                        />
                                    )
                                })}
                            </Box>
                        </Box>
                    )
                })}
                {walletGroup.imported.length ?
                    <Box>
                        <Typography className={classes.title}>
                            <Trans>Imported Wallets</Trans>
                        </Typography>
                        <Box className={classes.title}>
                            {walletGroup.imported.map((wallet) => (
                                <WalletItem
                                    key={wallet.address}
                                    wallet={wallet}
                                    isSelected={isSameAddress(wallet.address, currentWallet?.address)}
                                    onSelect={handleSelect}
                                />
                            ))}
                        </Box>
                    </Box>
                :   null}
            </Box>
        </ActionModal>
    )
})
