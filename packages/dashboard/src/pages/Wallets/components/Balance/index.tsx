import { memo } from 'react'
import { useMatch } from 'react-router-dom'
import { Box, Button, buttonClasses, styled, Typography } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { CardIcon, DownloadIcon, MaskWalletIcon, SendIcon, SwapIcon } from '@masknet/icons'
import { MiniNetworkSelector } from '@masknet/shared'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { RoutePaths } from '../../../../type'

export interface BalanceCardProps {
    balance: number
    onSend(): void
    onBuy(): void
    onSwap(): void
    onReceive(): void
    networks: Web3Plugin.NetworkDescriptor[]
    selectedNetwork: Web3Plugin.NetworkDescriptor | null
    onSelectNetwork(network: Web3Plugin.NetworkDescriptor | null): void
}

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
    font-size: ${theme.typography.h6.fontSize};
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
        & .${buttonClasses.endIcon} > *:nth-of-type(1) {
            font-size: 16px;
            fill: none;
        }
    }
`

export const Balance = memo<BalanceCardProps>(
    ({ balance, onSend, onBuy, onSwap, onReceive, onSelectNetwork, networks, selectedNetwork }) => {
        const t = useDashboardI18N()

        const isWalletTransferPath = useMatch(RoutePaths.WalletsTransfer)
        const isWalletHistoryPath = useMatch(RoutePaths.WalletsHistory)

        const isDisabledNonCurrentChainSelect = !!isWalletTransferPath
        const isHiddenAllButton = !!isWalletHistoryPath || !!isWalletTransferPath

        return (
            <BalanceContainer>
                <Box display="flex" alignItems="center">
                    <IconContainer sx={{ width: 48, height: 48 }}>
                        <MaskWalletIcon viewBox="0 0 48 48" fontSize="inherit" />
                    </IconContainer>
                    <BalanceDisplayContainer>
                        <BalanceTitle>
                            {t.wallets_balance()} {selectedNetwork?.name ?? t.wallets_balance_all_chain()}
                        </BalanceTitle>
                        <BalanceContent sx={{ py: 0.5 }}>
                            {isNaN(balance)
                                ? '-'
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
                            onSelect={onSelectNetwork}
                        />
                    </BalanceDisplayContainer>
                </Box>
                <ButtonGroup>
                    <Button size="small" onClick={onSend} endIcon={<SendIcon fontSize="inherit" />}>
                        {t.wallets_balance_Send()}
                    </Button>
                    <Button size="small" onClick={onBuy} endIcon={<CardIcon fill="none" fontSize="inherit" />}>
                        {t.wallets_balance_Buy()}
                    </Button>
                    <Button size="small" onClick={onSwap} endIcon={<SwapIcon fontSize="inherit" />}>
                        {t.wallets_balance_Swap()}
                    </Button>
                    <Button
                        size="small"
                        color="secondary"
                        onClick={onReceive}
                        endIcon={<DownloadIcon fontSize="inherit" style={{ stroke: MaskColorVar.textLink }} />}>
                        {t.wallets_balance_Receive()}
                    </Button>
                </ButtonGroup>
            </BalanceContainer>
        )
    },
)
