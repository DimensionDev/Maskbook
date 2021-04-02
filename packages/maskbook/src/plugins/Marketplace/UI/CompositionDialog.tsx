import { useMemo, useCallback, useState } from 'react'
import { Box, createStyles, DialogContent, DialogProps, FormControl, makeStyles, TextField } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import type { MarketplaceJSONPayloadInMask } from '../types'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useChainId } from '../../../web3/hooks/useChainState'
import { EtherTokenDetailed, ERC20TokenDetailed, EthereumTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useConstant } from '../../../web3/hooks/useConstant'
import { MarketplaceMetaKey, MARKETPLACE_CONSTANTS } from '../constants'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { useI18N } from '../../../utils/i18n-next-ui'
import { globalTypedMessageMetadata } from '../../../protocols/typed-message/global-state'
import { useTokenBalance } from '../../../web3/hooks/useTokenBalance'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            padding: theme.spacing(4, 4, 2),
        },
        control: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
    }),
)

export interface CompositionDialogProps {
    open: boolean
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainId = useChainId()

    // fetch the NTF token
    const TOKEN_ADDRESS = useConstant(MARKETPLACE_CONSTANTS, 'TOKEN_ADDRESS')
    const { value: nftToken } = useERC721TokenDetailed(TOKEN_ADDRESS)

    // balance
    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const [token = etherTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()
    const { value: tokenBalance = '0', retry: retryTokenBalance } = useTokenBalance(
        token?.type ?? EthereumTokenType.Ether,
        token?.address ?? '',
    )

    // payload settings
    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')
    const [price, setPrice] = useState('')
    const [name, setName] = useState('')

    const onConfirm = useCallback(() => {
        if (!nftToken) return

        // compose payload
        const payload: MarketplaceJSONPayloadInMask = {
            contract_address: 1,
            creation_time: new Date().getTime(),
            chain_id: chainId,
            seller: {
                name: '',
                address: '',
            },
            buyers: [],
            start_time: Math.floor(Date.now() / 1000),
            end_time: Math.floor(Date.now() / 1000),
            token: nftToken,
            tokenIds: [],
            exchange_tokens: [],
        }

        // update the composition dialog
        const ref = globalTypedMessageMetadata
        const next = new Map(ref.value.entries())
        payload ? next.set(MarketplaceMetaKey, payload) : next.delete(MarketplaceMetaKey)
        ref.value = next

        // close the dialog
        props.onClose()
    }, [account, chainId, name, nftToken, props.onClose])

    const validationMessage = useMemo(() => {
        return ''
    }, [])

    return (
        <InjectedDialog open={props.open} title="Composition Dialog" onClose={props.onClose}>
            <DialogContent className={classes.content}>
                <FormControl className={classes.control}>
                    <TextField
                        label="Title"
                        value={title}
                        required
                        variant="outlined"
                        onChange={(e) => setTitle(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </FormControl>
                <FormControl className={classes.control}>
                    <TextField
                        label="Contract Address"
                        value={address}
                        required
                        variant="outlined"
                        onChange={(e) => setAddress(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </FormControl>
                <FormControl className={classes.control}>
                    <TokenAmountPanel
                        amount={price}
                        token={token}
                        balance={tokenBalance}
                        label="Price"
                        onAmountChange={setPrice}
                        SelectTokenChip={{
                            readonly: true,
                        }}
                    />
                </FormControl>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                    <EthereumWalletConnectedBoundary>
                        <ActionButton
                            className={classes.button}
                            fullWidth
                            size="large"
                            disabled={!nftToken}
                            variant="contained"
                            onClick={onConfirm}>
                            {t('confirm')}
                        </ActionButton>
                    </EthereumWalletConnectedBoundary>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
