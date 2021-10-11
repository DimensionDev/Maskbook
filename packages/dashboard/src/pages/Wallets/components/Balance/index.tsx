import { memo } from 'react'
import { styled, Typography, Box, Button, buttonClasses, Stack } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { MaskWalletIcon, SendIcon, CardIcon, SwapIcon, DownloadIcon } from '@masknet/icons'
import type { NetworkType } from '@masknet/web3-shared'
import { ChainId, getChainIdFromNetworkType } from '@masknet/web3-shared'
import { ChainIcon } from '@masknet/shared'

export interface BalanceCardProps {
    balance: number
    chainName: string
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
}))

const AllNetworkButton = styled(Button)(({ theme }) => ({
    display: 'inline-block',
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
    ({ balance, chainName, onSend, onBuy, onSwap, onReceive, onSelectNetwork, networks, selectedChainId }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()

        return (
            <BalanceContainer>
                <Box display="flex" alignItems="center">
                    <IconContainer sx={{ width: 48, height: 48 }}>
                        <MaskWalletIcon viewBox="0 0 48 48" fontSize="inherit" />
                    </IconContainer>
                    <BalanceDisplayContainer>
                        <BalanceTitle>
                            {t.wallets_balance()} {chainName}
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
                            <AllNetworkButton
                                className={selectedChainId === null ? classes.networkSelected : ''}
                                onClick={() => onSelectNetwork(null)}>
                                ALL
                            </AllNetworkButton>
                            {networks.map((network) => {
                                const chainId = getChainIdFromNetworkType(network)
                                return (
                                    <Box
                                        key={chainId}
                                        position="relative"
                                        ml={1}
                                        height={30}
                                        onClick={() => onSelectNetwork(chainId)}
                                        sx={{ cursor: 'pointer' }}
                                        className={selectedChainId === chainId ? classes.networkSelected : ''}>
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
