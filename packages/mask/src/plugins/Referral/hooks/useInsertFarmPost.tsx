import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { useCustomSnackbar } from '@masknet/theme'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'

import { useI18N } from '../locales'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { META_KEY } from '../constants'

export function useInsertFarmPost(token: FungibleTokenDetailed | undefined, chainId: ChainId, onClose?: () => void) {
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )
    const currentIdentity = useCurrentIdentity()
    const { value: linkedPersona } = useCurrentLinkedPersona()
    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()

    if (!token?.address) {
        showSnackbar(t.error_token_not_select(), { variant: 'error' })
        return
    }

    const { address, name = '', symbol = '', logoURI = [''] } = token
    const selectedReferralData = {
        referral_token: address,
        referral_token_name: name,
        referral_token_symbol: symbol,
        referral_token_icon: logoURI,
        referral_token_chain_id: chainId,
        sender: senderName ?? '',
    }

    if (selectedReferralData) {
        attachMetadata(META_KEY, JSON.parse(JSON.stringify(selectedReferralData)))
    } else {
        dropMetadata(META_KEY)
    }

    closeApplicationBoardDialog()
    onClose?.()
}
