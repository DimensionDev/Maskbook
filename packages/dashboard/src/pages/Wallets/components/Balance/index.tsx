import { memo } from 'react'
import { styled, Typography, Box, Button, buttonClasses, Stack } from '@mui/material'
import { useDashboardI18N } from '../../../../locales'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MaskWalletIcon, SendIcon, CardIcon, SwapIcon, DownloadIcon } from '@masknet/icons'
import type { NetworkType } from '@masknet/web3-shared-evm'
import { ChainId, getChainIdFromNetworkType, getChainName } from '@masknet/web3-shared-evm'
import { ChainIcon } from '@masknet/shared'
import { useMatch } from 'react-router-dom'
import { RoutePaths } from '../../../../type'

export interface BalanceCardProps {
    balance: number
    onSend(): void
    onBuy(): void
    onSwap(): void
    onReceive(): void
    selectedChainId: ChainId | null
    networks: NetworkType[]
    onSelectNetwork(id: ChainId | null): void
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

const useStyles = makeStyles()((theme) => ({
    networkSelected: {
        opacity: 1,
        '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            right: 13,
            display: 'inline-block',
            width: 4,
            height: 4,
            background: MaskColorVar.primary,
            borderRadius: '50%',
        },
    },
    networkDisabled: {
        cursor: 'not-allowed',
        '&:hover': {
            opacity: 0.6,
        },
    },
}))

const AllNetworkButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    marginRight: theme.spacing(1),
    padding: 0,
    lineHeight: '30px',
    width: 30,
    height: 30,
    minWidth: 30,
    borderRadius: '50%',
    fontSize: 12,
    '&:hover': {
        boxShadow: 'none',
    },
    opacity: 0.5,
}))

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
    ({ balance, onSend, onBuy, onSwap, onReceive, onSelectNetwork, networks, selectedChainId }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()

        const isWalletTransferPath = useMatch(RoutePaths.WalletsTransfer)
        const isWalletHistoryPath = useMatch(RoutePaths.WalletsHistory)
        const isDisabledChange = isWalletTransferPath
        const isHiddenAllButton = isWalletHistoryPath || isWalletTransferPath

        return (
            <BalanceContainer>
                <Box display="flex" alignItems="center">
                    <IconContainer sx={{ width: 48, height: 48 }}>
                        <MaskWalletIcon viewBox="0 0 48 48" fontSize="inherit" />
                    </IconContainer>
                    <BalanceDisplayContainer>
                        <BalanceTitle>
                            {t.wallets_balance()}{' '}
                            {selectedChainId ? getChainName(selectedChainId) : t.wallets_balance_all_chain()}
                        </BalanceTitle>
                        <BalanceContent sx={{ py: 0.5 }}>
                            {isNaN(balance)
                                ? '-'
                                : balance.toLocaleString('en', {
                                      style: 'currency',
                                      currency: 'USD',
                                  })}
                        </BalanceContent>
                        <Stack direction="row">
                            {!isHiddenAllButton && (
                                <AllNetworkButton
                                    className={selectedChainId === null ? classes.networkSelected : ''}
                                    onClick={() => onSelectNetwork(null)}>
                                    ALL
                                </AllNetworkButton>
                            )}
                            {networks.map((network) => {
                                const chainId = getChainIdFromNetworkType(network)
                                return (
                                    <Box
                                        key={chainId}
                                        position="relative"
                                        mr={1}
                                        height={30}
                                        onClick={() => !isDisabledChange && onSelectNetwork(chainId)}
                                        sx={{ cursor: 'pointer', opacity: '0.6', ':hover': { opacity: 1 } }}
                                        className={
                                            selectedChainId === chainId
                                                ? classes.networkSelected
                                                : isDisabledChange
                                                ? classes.networkDisabled
                                                : ''
                                        }>
                                        <ChainIcon chainId={chainId} size={30} />
                                    </Box>
                                )
                            })}
                        </Stack>
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
