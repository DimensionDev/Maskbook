import { Button } from '@mui/material'
import { useERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { PluginTraderMessages } from '../../Trader/messages'
import { formatSymbol } from '../utils'
import { useControlledDialog } from '../../../utils'
import { BuyDialog } from './BuyDialog'

interface BuyButtonProps {
    params: any
}

export function BuyButton(props: BuyButtonProps) {
    const { params } = props
    const { value: token } = useERC20TokenDetailed(params.row.id)
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)
    const { open: openBuyDialog, onClose: onCloseBuyDialog, onOpen: onOpenBuyDialog } = useControlledDialog()

    const formattedSymbol = !token?.symbol || !token?.name ? '' : formatSymbol(`${token?.symbol} (${token?.name})`)
    // console.log(composeIdeaURL(params.row.market, params.row.name))

    return (
        <>
            <Button color="primary" size="small" variant="contained" onClick={onOpenBuyDialog}>
                Buy
            </Button>
            <BuyDialog open={openBuyDialog} onClose={onCloseBuyDialog} />
        </>
    )
}
