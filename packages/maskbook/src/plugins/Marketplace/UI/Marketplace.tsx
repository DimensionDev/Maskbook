import { createStyles, Link, makeStyles, Typography } from '@material-ui/core'
import type { MarketplaceJSONPayloadInMask } from '../types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { MARKETPLACE_CONSTANTS } from '../constants'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'

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

    // fetch the NTF token
    const TOKEN_ADDRESS = useConstant(MARKETPLACE_CONSTANTS, 'TOKEN_ADDRESS')
    const { value: electionToken } = useERC721TokenDetailed(TOKEN_ADDRESS)

    // context
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()

    return null
}
