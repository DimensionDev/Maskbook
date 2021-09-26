import { MaskTextField } from '@masknet/theme'
import { Box, Button, IconButton, Stack, Typography } from '@material-ui/core'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
    ERC721ContractDetailed,
    EthereumTokenType,
    formatWeiToEther,
    GasOption,
    isEIP1559Supported,
    TransactionStateType,
    useAccount,
    useChainId,
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
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { toHex, toWei } from 'web3-utils'
import { useGasOptions } from '../../../../hooks/useGasOptions'

type FormInputs = {
    recipient: string
    contract: string
    tokenId: string
}

function gweiToWei(gwei: number | string) {
    // gwei might have more than 9 decimal places
    return toWei(new BigNumber(gwei).toFixed(9), 'gwei')
}

export const TransferERC721 = memo(() => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const chainId = useChainId()
    const [contract, setContract] = useState<ERC721ContractDetailed>()
    const [gasOption, setGasOption] = useState<GasOption>(GasOption.Medium)
    const [gasLimit, setGasLimit] = useState<string>('0')
    const [maxFee, setMaxFee] = useState<string | null>(null)
    const [priorityFee, setPriorityFee] = useState<string | null>(null)
    const [offset, setOffset] = useState(0)
    const [id] = useState(uuid())
    const { gasNow } = useGasOptions()

    const account = useAccount()
    const nativeToken = useNativeTokenDetailed()
    const nativeTokenPrice = useNativeTokenPrice()
    const is1559Supported = useMemo(() => isEIP1559Supported(chainId), [chainId])
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        contract?.address ?? '',
    )

    useEffect(() => {
        if (!gasNow) return

        // aka is1559Supported
        if (typeof gasNow.medium !== 'number') {
            const gasLevel = gasNow.medium as Exclude<typeof gasNow.medium, number>
            setMaxFee((oldVal) => {
                return !oldVal ? gweiToWei(gasLevel.suggestedMaxFeePerGas) : oldVal
            })
            setPriorityFee((oldVal) => {
                return !oldVal ? gweiToWei(gasLevel.suggestedMaxPriorityFeePerGas) : oldVal
            })
        } else {
            setCustomGasPrice((oldVal) => (!oldVal ? (gasNow.medium as number) : oldVal))
        }
    }, [is1559Supported, gasNow])

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

    const addOffset = useCallback(() => (loadMore ? setOffset(offset + 8) : void 0), [offset, loadMore])

    useEffect(() => {
        return WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
            if (evt.open) return
            if (evt.gasPrice) setCustomGasPrice(evt.gasPrice)
            if (evt.gasOption) setGasOption(evt.gasOption)
            if (evt.gasLimit) setGasLimit(evt.gasLimit)
            if (evt.maxFee) setMaxFee(evt.maxFee)
        })
    }, [])

    // form
    const schema = z.object({
        recipient: z.string().refine((address) => EthereumAddress.isValid(address), t.wallets_incorrect_address()),
        contract: z.string().min(1, t.wallets_collectible_contract_is_empty()),
        tokenId: z.string().min(1, t.wallets_collectible_token_id_is_empty()),
    })

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
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
        setGasLimit(erc721GasLimit.value?.toFixed() ?? '0')
    }, [erc721GasLimit.value])

    useEffect(() => {
        if (transferState.type === TransactionStateType.FAILED || transferState.type === TransactionStateType.HASH) {
            reset({ recipient: '', tokenId: '', contract: '' })
            clearTokenDetailedOwnerList()
            setOffset(0)
            setContract(undefined)
            resetTransferCallback()
        }
        if (transferState.type === TransactionStateType.HASH) {
            navigate(RoutePaths.WalletsHistory)
        }
    }, [transferState])

    const gasConfig = useMemo(() => {
        return is1559Supported
            ? {
                  gas: Number.parseInt(gasLimit, 10),
                  maxFeePerGas: toHex(maxFee ?? '0'),
                  maxPriorityFeePerGas: toHex(priorityFee ?? '0'),
              }
            : { gas: Number.parseInt(gasLimit, 10), gasPrice: new BigNumber(gasPrice).toNumber() }
    }, [is1559Supported, gasLimit, maxFee, priorityFee, gasPrice])

    const onTransfer = useCallback(
        async (data) => {
            await transferCallback(data.tokenId, data.recipient, gasConfig)
        },
        [transferCallback, contract?.address, gasConfig],
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
        <Stack direction="row" justifyContent="center" mt={4} maxHeight="100%">
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
                                    value={field.field.value}
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
                    {loadingOwnerList && tokenDetailedOwnerList.length === 0 && (
                        <Box pt={4}>
                            <LoadingPlaceholder />
                        </Box>
                    )}
                    <Box width="100%" mt={2}>
                        {tokenDetailedOwnerList.length > 0 && (
                            <Controller
                                control={control}
                                render={(field) => (
                                    <SelectNFTList
                                        onScroll={addOffset}
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
