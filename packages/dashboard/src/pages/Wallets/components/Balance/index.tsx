import { memo } from 'react'
import { noop } from 'lodash-unified'
import {
    Card as CardIcon,
    Download as DownloadIcon,
    MaskWallet as MaskWalletIcon,
    Send as SendIcon,
    Swap as SwapIcon,
} from '@masknet/icons'
import { MiniNetworkSelector } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskColorVar } from '@masknet/theme'
import type { NetworkDescriptor, NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, Button, buttonClasses, styled, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../../locales'
import { useIsMatched } from '../../hooks'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

const BalanceContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    justify-content: space-between;
    border-radius: 16px;
    align-items: center;
    padding: ${theme.spacing(2.5)};
    background: ${MaskColorVar.primaryBackground};
`,
)

const IconContainer = styled('div')`
    width: 48px;
    height: 48px;
    font-size: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${MaskColorVar.infoBackground};
    border-radius: 24px;
`

const BalanceDisplayContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: ${theme.spacing(1)};
`,
)

const BalanceTitle = styled(Typography)(
    ({ theme }) => `
  font-size: ${theme.typography.subtitle2.fontSize};
  color: ${MaskColorVar.iconLight};
`,
)

const BalanceContent = styled(Typography)(
    ({ theme }) => `
    font-size: ${theme.typography.h5.fontSize};
    color: ${MaskColorVar.textPrimary};
    line-height: ${theme.typography.h2.lineHeight};
`,
)

const ButtonGroup = styled('div')`
    display: inline-grid;
    gap: 10px;
    grid-template-columns: repeat(4, 1fr);
    & > * {
        font-size: 12px;
        white-space: nowrap;
        & .${buttonClasses.endIcon} > *:nth-of-type(1) {
            font-size: 16px;
            fill: none;
        }
    }
`

export interface BalanceCardProps {
    balance: number
    onSend(): void
    onBuy(): void
    onSwap(): void
    onReceive(): void
    networks: Array<
        NetworkDescriptor<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['NetworkType']
        >
    >
    selectedNetwork: NetworkDescriptor<
        Web3Helper.Definition[NetworkPluginID]['ChainId'],
        Web3Helper.Definition[NetworkPluginID]['NetworkType']
    > | null
    showOperations: boolean
    onSelectNetwork(
        network: NetworkDescriptor<
            Web3Helper.Definition[NetworkPluginID]['ChainId'],
            Web3Helper.Definition[NetworkPluginID]['NetworkType']
        > | null,
    ): void
}

export const Balance = memo<BalanceCardProps>(
    ({ balance, onSend, onBuy, onSwap, onReceive, onSelectNetwork, networks, selectedNetwork, showOperations }) => {
        const t = useDashboardI18N()

        const isWalletTransferPath = useIsMatched(DashboardRoutes.WalletsTransfer)
        const isWalletHistoryPath = useIsMatched(DashboardRoutes.WalletsHistory)

        const isDisabledNonCurrentChainSelect = !!isWalletTransferPath
        const isHiddenAllButton = isWalletHistoryPath || isWalletTransferPath || networks.length <= 1

        return (
            <BalanceContainer>
                <Box display="flex" alignItems="center">
                    <IconContainer sx={{ width: 48, height: 48 }}>
                        <MaskWalletIcon size={48} sx={{ fontSize: 'inherit' }} />
                    </IconContainer>
                    <BalanceDisplayContainer>
                        <BalanceTitle>
                            {t.wallets_balance()} {selectedNetwork?.name ?? t.wallets_balance_all_chain()}
                        </BalanceTitle>
                        <BalanceContent sx={{ py: 1.5 }}>
                            {Number.isNaN(balance)
                                ? '$0'
                                : balance.toLocaleString('en', {
                                      style: 'currency',
                                      currency: 'USD',
                                  })}
                        </BalanceContent>
                        <MiniNetworkSelector
                            hideAllNetworkButton={isHiddenAllButton}
                            disabledNonCurrentNetwork={isDisabledNonCurrentChainSelect}
                            selectedNetwork={selectedNetwork}
                            networks={networks}
                            onSelect={(
                                network: NetworkDescriptor<
                                    Web3Helper.Definition[NetworkPluginID]['ChainId'],
                                    Web3Helper.Definition[NetworkPluginID]['NetworkType']
                                > | null,
                            ) => (networks.length <= 1 ? noop : onSelectNetwork(network))}
                        />
                    </BalanceDisplayContainer>
                </Box>
                {showOperations && (
                    <ButtonGroup>
                        <Button
                            size="small"
                            onClick={onSend}
                            endIcon={<SendIcon color="#fff" sx={{ fontSize: 'inherit' }} />}>
                            {t.wallets_balance_Send()}
                        </Button>
                        <Button size="small" onClick={onBuy} endIcon={<CardIcon sx={{ fontSize: 'inherit' }} />}>
                            {t.wallets_balance_Buy()}
                        </Button>
                        <Button size="small" onClick={onSwap} endIcon={<SwapIcon sx={{ fontSize: 'inherit' }} />}>
                            {t.wallets_balance_Swap()}
                        </Button>
                        <Button
                            size="small"
                            color="secondary"
                            onClick={onReceive}
                            endIcon={<DownloadIcon sx={{ fontSize: 'inherit' }} color={MaskColorVar.textLink} />}>
                            {t.wallets_balance_Receive()}
                        </Button>
                    </ButtonGroup>
                )}
            </BalanceContainer>
        )
    },
)
