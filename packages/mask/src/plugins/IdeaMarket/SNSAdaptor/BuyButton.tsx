import { Button } from '@mui/material'
import { useERC20TokenDetailed } from '@masknet/web3-shared-evm'
import { useControlledDialog } from '../../../utils'
import { BuyDialog } from './BuyDialog'
import type { GridRenderCellParams } from '@mui/x-data-grid'

interface BuyButtonProps {
    params: GridRenderCellParams
}

export function BuyButton(props: BuyButtonProps) {
    const { params } = props
    const { value: token } = useERC20TokenDetailed(params.row.id)
    const { open: openBuyDialog, onClose: onCloseBuyDialog, onOpen: onOpenBuyDialog } = useControlledDialog()

    return (
        <>
            <Button color="primary" size="small" variant="contained" onClick={onOpenBuyDialog}>
                Buy
            </Button>
            {token ? <BuyDialog open={openBuyDialog} onClose={onCloseBuyDialog} ideaToken={token} /> : ''}
        </>
    )
}
