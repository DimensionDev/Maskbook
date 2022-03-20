import { Button } from '@mui/material'
import { useERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginTraderMessages } from '../../Trader/messages'
import { formatSymbol } from '../utils'
import type { Coin } from '../../Trader/types'

interface SellButtonProps {
    tokenContractAddress: string
}

export function SellButton(props: SellButtonProps) {
    const { tokenContractAddress } = props
    const { value: token } = useERC20TokenDetailed(tokenContractAddress)
    const { setDialog: setSellDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const formattedSymbol = !token?.symbol || !token?.name ? '' : formatSymbol(`${token?.symbol} (${token?.name})`)

    return (
        <>
            <Button
                color="primary"
                size="small"
                variant="contained"
                onClick={() =>
                    setSellDialog({
                        open: true,
                        traderProps: {
                            defaultInputCoin: {
                                id: token?.address,
                                name: token?.name ?? '',
                                symbol: formattedSymbol,
                                contract_address: token?.address,
                                decimals: token?.decimals,
                                image_url: '../icons/ideamarket-logo.png',
                            } as Coin,
                        },
                    })
                }>
                Sell
            </Button>
        </>
    )
}
