import { MaskTextField } from '@masknet/theme'
import { Box, Button, IconButton, Stack, Typography } from '@material-ui/core'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
    ERC721ContractDetailed,
    EthereumTokenType,
    formatWeiToEther,
    FungibleTokenDetailed,
    GasOption,
    TransactionStateType,
    useAccount,
    useERC721TokenDetailedOwnerList,
    useGasLimit,
    useGasPrice,
    useNativeTokenDetailed,
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
import TuneIcon from '@mui/icons-material/Tune'
import BigNumber from 'bignumber.js'
import { useNativeTokenPrice } from './useNativeTokenPrice'

interface TransferERC721Props {
    token: FungibleTokenDetailed
}

type FormInputs = {
    recipient: string
    contract: string
    tokenId: string
    memo: string
}

export const TransferERC721 = memo<TransferERC721Props>(({ token }) => {
    const t = useDashboardI18N()
    const [contract, setContract] = useState<ERC721ContractDetailed>()
    const [gasOption, setGasOption] = useState<GasOption>(GasOption.Medium)
    const [gasLimit, setGasLimit] = useState<string | number>(0)
    const [offset, setOffset] = useState(0)
    const [id] = useState(uuid())

    const account = useAccount()
    const nativeToken = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice()
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        contract?.address ?? '',
    )

    // gas price
    const { value: defaultGasPrice = '0' } = useGasPrice()
    const [customGasPrice, setCustomGasPrice] = useState<BigNumber.Value>(0)
    const gasPrice = customGasPrice || defaultGasPrice
    const gasFee = useMemo(() => new BigNumber(gasLimit).multipliedBy(gasPrice), [gasLimit, gasPrice])

    // dialog
    const { setDialog: setGasSettingDialog } = useRemoteControlledDialog(WalletMessages.events.gasSettingDialogUpdated)
    const { setDialog: setSelectContractDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (ev.open || !ev.contract || ev.uuid !== id) return
            setValue('contract', ev.contract.name, { shouldValidate: true })
            setContract(ev.contract)
        },
    )
    const openGasSettingDialog = useCallback(() => {
        setGasSettingDialog({ open: true, gasLimit, gasOption })
    }, [gasLimit, gasOption])

    const {
        asyncRetry: { value = { tokenDetailedOwnerList: [], loadMore: true }, loading: loadingOwnerList },
        clearTokenDetailedOwnerList,
    } = useERC721TokenDetailedOwnerList(contract, account, offset)
    const { tokenDetailedOwnerList, loadMore } = value

    useEffect(() => {
        return WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
            if (evt.gasPrice) setCustomGasPrice(evt.gasPrice)
            if (evt.gasOption) setGasOption(evt.gasOption)
            if (evt.gasLimit) setGasLimit(evt.gasLimit)
        })
    }, [])

    // form
    const schema = z.object({
        recipient: z.string().refine((address) => !EthereumAddress.isValid(address), t.wallets_incorrect_address()),
        contract: z.string().min(1),
        tokenId: z.string().min(1),
        memo: z.string(),
    })

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: { recipient: '', contract: '', tokenId: '' },
    })

    const allFormFields = watch()

    const erc721GasLimit = useGasLimit(
        EthereumTokenType.ERC721,
        contract?.address,
        undefined,
        allFormFields.recipient,
        allFormFields.tokenId,
    )

    useEffect(() => {
        setGasLimit(erc721GasLimit.value?.toFixed() ?? 0)
    }, [erc721GasLimit.value])

    const onTransfer = useCallback(
        async (data) => {
            await transferCallback(data.tokenId, data.recipient)
        },
        [transferCallback],
    )

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
                                    onChange={(e) => setValue('recipient', e.currentTarget.value)}
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
                    <Box
                        width="100%"
                        display="flex"
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt="16px">
                        <Typography fontSize="12px" fontWeight="bold">
                            {t.gas_fee()}
                        </Typography>
                        <Box display="flex" flexDirection="row" alignItems="center">
                            <Typography fontSize="14px">
                                {t.transfer_cost({
                                    gasFee: formatWeiToEther(gasFee).toFixed(6),
                                    symbol: nativeToken.value?.symbol ?? '',
                                    usd: formatWeiToEther(gasFee).multipliedBy(nativeTokenPrice).toFixed(2),
                                })}
                            </Typography>
                            <IconButton size="small" onClick={openGasSettingDialog}>
                                <TuneIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box mt={2} width="100%">
                        <Controller
                            control={control}
                            render={(field) => (
                                <MaskTextField
                                    {...field}
                                    placeholder={t.wallets_transfer_memo_placeholder()}
                                    label={t.wallets_transfer_memo()}
                                    onChange={(e) => setValue('memo', e.currentTarget.value)}
                                />
                            )}
                            name="memo"
                        />
                    </Box>
                    <Box mt={4}>
                        <Button
                            sx={{ width: 240 }}
                            type="submit"
                            disabled={isSubmitting || transferState.type === TransactionStateType.WAIT_FOR_CONFIRMING}>
                            {t.wallets_transfer_send()}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Stack>
    )
})
