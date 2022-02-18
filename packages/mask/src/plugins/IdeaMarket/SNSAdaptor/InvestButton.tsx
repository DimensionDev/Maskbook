import { Button, Link } from '@mui/material'
import { useERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginTraderMessages } from '../../Trader/messages'
import { formatSymbol } from '../utils'

interface InvestButtonProps {
    params: any
}

export function InvestButton(props: InvestButtonProps) {
    const { params } = props
    const { value: token } = useERC20TokenDetailed(params.row.id)
    const { setDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const formattedSymbol = !token?.symbol || !token?.name ? '' : formatSymbol(`${token?.symbol} (${token?.name})`)

    return (
        <>
            <Link href="https://ideamarket.io" target="_blank">
                View details
            </Link>
            <Button
                variant="contained"
                onClick={() =>
                    setDialog({
                        open: true,
                        traderProps: {
                            coin: {
                                id: params.row.id,
                                name: token?.name ?? '',
                                symbol: formattedSymbol,
                                contract_address: params.row.id,
                                decimals: token?.decimals,
                            },
                        },
                    })
                }>
                Buy
            </Button>
        </>
    )
}

export function renderInvestButton(params: any) {
    return <InvestButton params={params} />
}
