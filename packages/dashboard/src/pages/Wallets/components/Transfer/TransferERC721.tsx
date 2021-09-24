import { MaskTextField } from '@masknet/theme'
import { Box, Button, Stack } from '@material-ui/core'
import { memo, useCallback, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
    ERC721ContractDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    useAccount,
    useERC721TokenDetailedOwnerList,
    useGasPrice,
    useTokenTransferCallback,
} from '@masknet/web3-shared'
import { useRemoteControlledDialog } from '@masknet/shared'
import { useDashboardI18N } from '../../../../locales'
import { WalletMessages } from '@masknet/plugin-wallet'
import { SelectNFTList } from './SelectNFTList'
import { LoadingPlaceholder } from '../../../../components/LoadingPlaceholder'
import { z } from 'zod'
import { EthereumAddress } from 'wallet.ts'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

interface TransferERC721Props {
    token: FungibleTokenDetailed
}

type FormInputs = {
    recipient: string
    contract: string
    tokenId: string
}

export const TransferERC721 = memo<TransferERC721Props>(({ token }) => {
    const t = useDashboardI18N()
    const [id] = useState(uuid())
    const account = useAccount()
    const [contract, setContract] = useState<ERC721ContractDetailed>()
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        contract?.address ?? '',
    )
    const [offset, setOffset] = useState(0)

    // gas price
    const { value: gasPrice = '0' } = useGasPrice()

    const { setDialog: setSelectContractDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (ev.open || !ev.contract || ev.uuid !== id) return
            setValue('contract', ev.contract.name, { shouldValidate: true })
            setContract(ev.contract)
        },
    )
    const {
        asyncRetry: { value = { tokenDetailedOwnerList: [], loadMore: true }, loading: loadingOwnerList },
        clearTokenDetailedOwnerList,
    } = useERC721TokenDetailedOwnerList(contract, account, offset)

    const { tokenDetailedOwnerList, loadMore } = value

    const onTransfer = useCallback(
        async (data) => {
            await transferCallback(data.tokenId, data.recipient)
        },
        [transferCallback],
    )

    const schema = z.object({
        recipient: z.string().refine((address) => !EthereumAddress.isValid(address), t.wallets_incorrect_address()),
        contract: z.string().min(1),
        tokenId: z.string().min(1),
    })

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting, isValid },
    } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: { recipient: '', contract: '', tokenId: '' },
    })

    const contractIcon = useMemo(() => {
        if (!contract?.iconURL) return null
        return (
            <Box width={20} height={20} mr={1}>
                <img style={{ borderRadius: 10 }} width="20px" height="20px" src={contract.iconURL} alt="" />
            </Box>
        )
    }, [contract])

    return (
        <Stack direction="row" justifyContent="center" mt={4}>
            <form onSubmit={handleSubmit(onTransfer)}>
                <Stack maxWidth={640} minWidth={500} alignItems="center">
                    <Box width="100%">
                        <Controller
                            control={control}
                            render={(field) => (
                                <MaskTextField
                                    {...field}
                                    helperText={errors.recipient?.message}
                                    error={!!errors.recipient}
                                    label={t.wallets_transfer_to_address()}
                                />
                            )}
                            name="recipient"
                        />
                    </Box>
                    <Box width="100%" mt={2}>
                        <Controller
                            control={control}
                            render={(field) => (
                                <Box onClick={() => setSelectContractDialog({ open: true, uuid: id })}>
                                    <MaskTextField
                                        {...field}
                                        error={!!errors.contract || !!errors.tokenId}
                                        helperText={errors.contract?.message || errors.tokenId?.message}
                                        placeholder={t.wallets_transfer_contract_placeholder()}
                                        disabled
                                        InputProps={{
                                            startAdornment: contractIcon,
                                            endAdornment: <KeyboardArrowDownIcon />,
                                        }}
                                        inputProps={{
                                            sx: { cursor: 'pointer' },
                                        }}
                                        label={t.wallets_transfer_contract()}
                                        value={field.field.value}
                                    />
                                </Box>
                            )}
                            name="contract"
                        />
                    </Box>
                    {loadingOwnerList && (
                        <Box pt={4}>
                            <LoadingPlaceholder />
                        </Box>
                    )}
                    <Box width="100%" mt={2}>
                        {!loadingOwnerList && tokenDetailedOwnerList.length > 0 && (
                            <Controller
                                control={control}
                                render={(field) => (
                                    <SelectNFTList
                                        onSelect={(value) => setValue('tokenId', value)}
                                        list={tokenDetailedOwnerList}
                                        selected={field.field.value}
                                    />
                                )}
                                name="tokenId"
                            />
                        )}
                    </Box>
                    <Box mt={4}>
                        <Button sx={{ width: 240 }} type="submit" disabled={isSubmitting}>
                            {t.wallets_transfer_send()}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Stack>
    )
})
