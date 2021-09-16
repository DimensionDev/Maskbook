import { memo } from 'react'
import { styled, Typography, Box, Button, buttonClasses } from '@material-ui/core'
import { useDashboardI18N } from '../../../../locales'
import { MaskColorVar } from '@masknet/theme'
import { MaskWalletIcon, SendIcon, CardIcon, SwapIcon, DownloadIcon } from '@masknet/icons'

export interface BalanceCardProps {
    balance: number
    chainName: string
    onSend(): void
    onBuy(): void
    onSwap(): void
    onReceive(): void
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
    // TODO: mobile
    font-size: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${MaskColorVar.infoBackground};
    border-radius: 50%;
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

export const Balance = memo<BalanceCardProps>(({ balance, chainName, onSend, onBuy, onSwap, onReceive }) => {
    const t = useDashboardI18N()

    return (
        <BalanceContainer>
            <Box display="flex">
                <IconContainer>
                    <MaskWalletIcon fontSize="inherit" />
                </IconContainer>
                <BalanceDisplayContainer>
                    <BalanceTitle>
                        {t.wallets_balance()} {chainName}
                    </BalanceTitle>
                    <BalanceContent>
                        {isNaN(balance)
                            ? '-'
                            : balance.toLocaleString('en', {
                                  style: 'currency',
                                  currency: 'USD',
                              })}
                    </BalanceContent>
                </BalanceDisplayContainer>
            </Box>
            <ButtonGroup>
                <Button onClick={onSend} endIcon={<SendIcon fontSize="inherit" />}>
                    {t.wallets_balance_Send()}
                </Button>
                <Button onClick={onBuy} endIcon={<CardIcon fill="none" fontSize="inherit" />}>
                    {t.wallets_balance_Buy()}
                </Button>
                <Button onClick={onSwap} endIcon={<SwapIcon fontSize="inherit" />}>
                    {t.wallets_balance_Swap()}
                </Button>
                <Button
                    color="secondary"
                    onClick={onReceive}
                    endIcon={<DownloadIcon fontSize="inherit" style={{ stroke: MaskColorVar.textLink }} />}>
                    {t.wallets_balance_Receive()}
                </Button>
            </ButtonGroup>
        </BalanceContainer>
    )
})
