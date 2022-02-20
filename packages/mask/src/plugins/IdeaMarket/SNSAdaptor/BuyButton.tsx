import { Button, Link } from '@mui/material'
import { useERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginTraderMessages } from '../../Trader/messages'
import { composeIdeaURL, formatSymbol } from '../utils'
import type { Coin } from '../../Trader/types'

interface BuyButtonProps {
    params: any
}

export function BuyButton(props: BuyButtonProps) {
    const { params } = props
    const { value: token } = useERC20TokenDetailed(params.row.id)
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)

    const formattedSymbol = !token?.symbol || !token?.name ? '' : formatSymbol(`${token?.symbol} (${token?.name})`)
    // console.log(composeIdeaURL(params.row.market, params.row.name))

    return (
        <>
            <Link href={composeIdeaURL(params.row.market, params.row.name)} target="_blank">
                View
            </Link>
            <Button
                style={{ marginLeft: 16 }}
                color="primary"
                size="small"
                variant="contained"
                onClick={() =>
                    setBuyDialog({
                        open: true,
                        traderProps: {
                            coin: {
                                id: params.row.id,
                                name: token?.name ?? '',
                                symbol: formattedSymbol,
                                contract_address: params.row.id,
                                decimals: token?.decimals,
                                image_url: '../icons/ideamarket-logo.png',
                            } as Coin,
                        },
                    })
                }>
                Buy
            </Button>
        </>
    )
}
