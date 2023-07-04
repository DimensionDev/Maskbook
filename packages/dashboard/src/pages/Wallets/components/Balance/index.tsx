import { memo, useMemo } from 'react'
import { noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { useContainer } from 'unstated-next'
import { Icons } from '@masknet/icons'
import { FormattedCurrency, MiniNetworkSelector } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskColorVar } from '@masknet/theme'
import { formatCurrency, getTokenUSDValue } from '@masknet/web3-shared-base'
import { Box, Button, buttonClasses, styled, Typography } from '@mui/material'
import { useDashboardI18N } from '../../../../locales/index.js'
import { useIsMatched } from '../../hooks/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Context } from '../../hooks/useContext.js'

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
            font-size: 0;
        }
    }
`

export interface BalanceCardProps {
    onSend(): void
    onBuy(): void
    onSwap(): void
    onReceive(): void
    networks: Web3Helper.NetworkDescriptorAll[]
    selectedNetwork: Web3Helper.NetworkDescriptorAll | null
    showOperations: boolean
    onSelectNetwork(network: Web3Helper.NetworkDescriptorAll | null): void
}

export const Balance = memo<BalanceCardProps>(
    ({ onSend, onBuy, onSwap, onReceive, onSelectNetwork, networks, selectedNetwork, showOperations }) => {
        const t = useDashboardI18N()

        const isWalletTransferPath = useIsMatched(DashboardRoutes.WalletsTransfer)
        const isWalletHistoryPath = useIsMatched(DashboardRoutes.WalletsHistory)

        const { fungibleAssets } = useContainer(Context)

        const balance = useMemo(() => {
            if (!fungibleAssets.data?.length) return 0

            const values = fungibleAssets.data
                .filter((x) => (selectedNetwork ? x.chainId === selectedNetwork.chainId : true))
                .map((y) => getTokenUSDValue(y.value))
            return BigNumber.sum(...values).toNumber()
        }, [selectedNetwork, fungibleAssets.data])

        const isHiddenAllButton = isWalletHistoryPath || isWalletTransferPath || networks.length <= 1

        return (
            <BalanceContainer>
                <Box display="flex" alignItems="center">
                    <IconContainer>
                        <Icons.MaskWallet size={48} />
                    </IconContainer>
                    <BalanceDisplayContainer>
                        <BalanceTitle>
                            {t.wallets_balance()} {selectedNetwork?.name ?? t.wallets_balance_all_chain()}
                        </BalanceTitle>
                        <BalanceContent sx={{ py: 1.5 }}>
                            <FormattedCurrency value={balance} formatter={formatCurrency} />
                        </BalanceContent>
                        <MiniNetworkSelector
                            hideAllNetworkButton={isHiddenAllButton}
                            selectedNetwork={selectedNetwork}
                            networks={networks}
                            onSelect={(network: Web3Helper.NetworkDescriptorAll | null) =>
                                networks.length <= 1 ? noop : onSelectNetwork(network)
                            }
                        />
                    </BalanceDisplayContainer>
                </Box>
                {showOperations ? (
                    <ButtonGroup>
                        <Button size="small" onClick={onSend} endIcon={<Icons.Send size={12} />}>
                            {t.wallets_balance_Send()}
                        </Button>
                        <Button size="small" onClick={onBuy} endIcon={<Icons.Card size={12} />}>
                            {t.wallets_balance_Buy()}
                        </Button>
                        <Button size="small" onClick={onSwap} endIcon={<Icons.Swap size={12} />}>
                            {t.wallets_balance_Swap()}
                        </Button>
                        <Button
                            size="small"
                            color="secondary"
                            onClick={onReceive}
                            endIcon={<Icons.TxIn size={12} color={MaskColorVar.textLink} />}>
                            {t.wallets_balance_Receive()}
                        </Button>
                    </ButtonGroup>
                ) : null}
            </BalanceContainer>
        )
    },
)
