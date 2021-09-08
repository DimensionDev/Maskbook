import { TextField, CircularProgress } from '@material-ui/core'
import { useMemo, useState, useEffect } from 'react'
import { Octagon as OctagonIcon } from 'react-feather'
import { EthereumAddress } from 'wallet.ts'
import { useI18N } from '../../../../utils'
import {
    useERC721TokenDetailedCallback,
    useERC721ContractDetailed,
    useAccount,
    isSameAddress,
} from '@masknet/web3-shared'
import { WalletRPC } from '../../../../plugins/Wallet/messages'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'
import type { WalletProps } from './types'

export function DashboardWalletAddERC721TokenDialog(props: WrappedDialogProps<WalletProps>) {
    const { t } = useI18N()
    const [address, setAddress] = useState('')
    const account = useAccount()

    const { value: contractDetailed, loading } = useERC721ContractDetailed(address)
    const [loadingToken, setLoadingToken] = useState(false)
    const [loadingTokenFailMessage, setLoadingTokenFailMessage] = useState('')
    const [tokenId, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contractDetailed)

    useEffect(() => {
        setLoadingTokenFailMessage('')
    }, [tokenId, address])

    const onSubmit = useSnackbarCallback(
        async () => {
            setLoadingToken(true)
            const _tokenDetailed = await erc721TokenDetailedCallback()
            setLoadingToken(false)
            if ((_tokenDetailed && !isSameAddress(_tokenDetailed.info.owner, account)) || !_tokenDetailed) {
                setLoadingTokenFailMessage(t('wallet_add_nft_invalid_owner'))
                throw new Error(t('wallet_add_nft_invalid_owner'))
            } else {
                await WalletRPC.addERC721Token(_tokenDetailed)
                props.onClose()
            }
        },
        [setLoadingToken, props.onClose],
        () => void 0,
    )

    const validationMessage = useMemo(() => {
        if (!EthereumAddress.isValid(address)) return t('wallet_add_nft_invalid_address')
        return ''
    }, [address])

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
                            !!loadingTokenFailMessage ||
                            !address ||
                            !tokenId ||
                            !contractDetailed ||
                            loading
                        }
                        variant="contained"
                        onClick={onSubmit}>
                        {loadingToken ? <CircularProgress size={16} /> : null}
                        {validationMessage || loadingTokenFailMessage || t('add_asset')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
