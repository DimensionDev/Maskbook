import { TextField } from '@material-ui/core'
import { useMemo, useState } from 'react'
import { Octagon as OctagonIcon } from 'react-feather'
import { EthereumAddress } from 'wallet.ts'
import { useI18N } from '../../../../utils'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { useERC721TokenDetailed, useERC721ContractDetailed, isSameAddress, useAccount } from '@masknet/web3-shared'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'

export function DashboardWalletAddERC721TokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const [tokenId, setTokenId] = useState('')
    const [address, setAddress] = useState('')
    const account = useAccount()

    const { value: contractDetailed, loading: loadingContract } = useERC721ContractDetailed(address)
    const { value: tokenDetailed, loading: loadingToken } = useERC721TokenDetailed(contractDetailed, tokenId)

    const loading = loadingContract || loadingToken

    const onSubmit = useSnackbarCallback(
        async () => {
            if (!tokenDetailed) return
            await WalletRPC.addERC721Token(tokenDetailed)
        },
        [tokenDetailed],
        props.onClose,
    )

    const validationMessage = useMemo(() => {
        if (!EthereumAddress.isValid(address)) return t('wallet_add_nft_invalid_address')
        if ((tokenDetailed && !isSameAddress(tokenDetailed.info.owner, account)) || !tokenDetailed)
            return t('wallet_add_nft_invalid_owner')
        return ''
    }, [address, tokenDetailed])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<OctagonIcon />}
                iconColor="#699CF7"
                primary={t('add_asset')}
                content={
                    <div>
                        <TextField
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            autoFocus
                            label={t('wallet_add_nft_address')}
                            placeholder={t('wallet_add_nft_address_placeholder')}
                        />
                        <TextField
                            onChange={(e) => setTokenId(e.target.value)}
                            required
                            label={t('wallet_add_nft_id')}
                            placeholder={t('wallet_add_nft_id_placeholder')}
                        />
                    </div>
                }
                footer={
                    <DebounceButton
                        disabled={
                            !!validationMessage ||
                            !address ||
                            !tokenId ||
                            !contractDetailed ||
                            !tokenDetailed ||
                            loading
                        }
                        variant="contained"
                        onClick={onSubmit}>
                        {validationMessage || t('add_asset')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
