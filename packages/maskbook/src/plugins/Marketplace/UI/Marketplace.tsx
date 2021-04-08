import { useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import type { MarketplaceJSONPayloadInMask } from '../types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { MARKETPLACE_CONSTANTS } from '../constants'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { MarketplaceSellerState } from '../hooks/useMarketplaceState'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC721TokenApprovedBoundary } from '../../../web3/UI/EthereumERC721TokenApprovedBoundary'
import type { ERC721TokenDetailed } from '../../../web3/types'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useBuyCallback } from '../hooks/useBuyCallback'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { EthereumMessages } from '../../Ethereum/messages'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useMemo } from 'react'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            userSelect: 'none',
        },
    }),
)

export interface MarketplacePacketProps {
    payload: MarketplaceJSONPayloadInMask
}

export function MarketplacePacket(props: MarketplacePacketProps) {
    const { payload } = props

    const { t } = useI18N()
    const classes = useStyles()

    const [selectedToken, setSelectedToken] = useState<ERC721TokenDetailed | null>(null)
    const [buyState, buyCallback, resetBuyCallback] = useBuyCallback()

    //#region buy
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (buyState.type !== TransactionStateType.CONFIRMED) return
            resetBuyCallback()
        },
    )
    //#endregion

    //#region validate message
    const validationMessage = useMemo(() => {
        if (!selectedToken) return 'Please select a token to buy.'
        return ''
    }, [selectedToken])
    //#endregion

    return (
        <div className={classes.root}>
            <EthereumWalletConnectedBoundary>
                <ActionButton disabled={!!validationMessage} onClick={buyCallback}>
                    Buy Token
                </ActionButton>
            </EthereumWalletConnectedBoundary>
        </div>
    )
}
