import { makeStyles, MaskColorVar, MaskTextField } from '@masknet/theme'
import { Box, Button, IconButton, Link, Popover, Stack, Typography } from '@mui/material'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { v4 as uuid } from 'uuid'
import {
    isSameAddress,
    NonFungibleToken,
    NonFungibleTokenContract,
    multipliedBy,
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import {
    SchemaType,
    formatWeiToEther,
    NetworkType,
    ChainId,
    explorerResolver,
    isValidAddress,
} from '@masknet/web3-shared-evm'
// import { useERC721TokenDetailedOwnerList } from '@masknet/web3-providers'
import { FormattedAddress } from '@masknet/shared'
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
import { useNavigate, useLocation } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useGasConfig } from '../../hooks'
import { unionBy } from 'lodash-unified'
import { TransferTab } from './types'
import {
    useAccount,
    useChainId,
    useGasPrice,
    useLookupAddress,
    useNetworkDescriptor,
    useWeb3State,
    useNativeToken,
    useNativeTokenPrice,
    useWeb3Connection,
} from '@masknet/plugin-infra/web3'
import { RightIcon } from '@masknet/icons'
import { useGasLimit, useNonFungibleOwnerTokens, useTokenTransferCallback } from '@masknet/plugin-infra/web3-evm'

const useStyles = makeStyles()((theme) => ({
    disabled: {
        opacity: 1,
    },
}))

type FormInputs = {
    recipient: string
    contract: string
    tokenId: string
}

const GAS_LIMIT = 30000

export const TransferERC721 = memo(() => {
    const t = useDashboardI18N()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const anchorEl = useRef<HTMLDivElement | null>(null)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    const { state } = useLocation() as {
        state: { nonFungibleToken?: NonFungibleToken<ChainId, SchemaType>; type?: TransferTab } | null
    }

    const { classes } = useStyles()
    const [defaultToken, setDefaultToken] = useState<NonFungibleToken<ChainId, SchemaType> | null>(null)
    const navigate = useNavigate()
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [recipientError, setRecipientError] = useState<{
        type: 'account' | 'contractAddress'
        message: string
    } | null>(null)
    const [minPopoverWidth, setMinPopoverWidth] = useState(0)
    const [contract, setContract] = useState<NonFungibleTokenContract<ChainId, SchemaType>>()
    const [id] = useState(uuid)
    const [gasLimit_, setGasLimit_] = useState(0)
    const network = useNetworkDescriptor()
    const { Others } = useWeb3State()

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const nativeToken = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const nativeTokenPrice = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)
    // form
    const schema = z.object({
        recipient: z
            .string()
            .refine(
                (address) => EthereumAddress.isValid(address) || Others?.isValidDomain?.(address),
                t.wallets_incorrect_address(),
            ),
        contract: z.string().min(1, t.wallets_collectible_contract_is_empty()),
        tokenId: z.string().min(1, t.wallets_collectible_token_id_is_empty()),
    })

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: { recipient: '', contract: '', tokenId: '' },
    })

    useEffect(() => {
        if (!state) return
        if (!state.nonFungibleToken || state.type !== TransferTab.Collectibles) return
        if (state.nonFungibleToken.chainId !== chainId) return

        setContract(state.nonFungibleToken.contract)
        setValue('contract', state.nonFungibleToken.contract?.name ?? '')
        setValue('tokenId', state.nonFungibleToken.tokenId)
        setDefaultToken(state.nonFungibleToken)
    }, [state])

    const allFormFields = watch()

    // #region resolve ENS domain
    const {
        value: registeredAddress = '',
        error: resolveDomainError,
        loading: resolveDomainLoading,
    } = useLookupAddress(NetworkPluginID.PLUGIN_EVM, allFormFields.recipient)
    // #endregion

    // #region check contract address and account address
    useAsync(async () => {
        const recipient = allFormFields.recipient
        setRecipientError(null)
        if (!recipient && !registeredAddress) return
        if (!isValidAddress(recipient) && !isValidAddress(registeredAddress)) return
        clearErrors()
        if (isSameAddress(recipient, account) || isSameAddress(registeredAddress, account)) {
            setRecipientError({
                type: 'account',
                message: t.wallets_transfer_error_same_address_with_current_account(),
            })
        }
        if (!connection) return
        const result = await connection?.getCode(recipient)
        if (result !== '0x') {
            setRecipientError({
                type: 'contractAddress',
                message: t.wallets_transfer_error_is_contract_address(),
            })
        }
    }, [allFormFields.recipient, clearErrors, registeredAddress, connection])
    // #endregion

    const erc721GasLimit = useGasLimit(
        SchemaType.ERC721,
        contract?.address,
        undefined,
        EthereumAddress.isValid(allFormFields.recipient) ? allFormFields.recipient : registeredAddress,
        allFormFields.tokenId,
    )

    useEffect(() => {
        setGasLimit_(erc721GasLimit.value ? erc721GasLimit.value : GAS_LIMIT)
    }, [erc721GasLimit.value])
    const { gasConfig, onCustomGasSetting, gasLimit } = useGasConfig(gasLimit_, GAS_LIMIT)

    const [{ loading: isTransferring }, transferCallback] = useTokenTransferCallback(
        SchemaType.ERC721,
        contract?.address ?? '',
    )

    // gas price
    const { value: defaultGasPrice = '0' } = useGasPrice()
    const gasPrice = gasConfig.gasPrice || defaultGasPrice
    const gasFee = useMemo(() => multipliedBy(gasLimit, gasPrice), [gasLimit, gasPrice])
    const gasFeeInUsd = formatWeiToEther(gasFee).multipliedBy(nativeTokenPrice.value ?? 0)

    // dialog
    const { setDialog: setSelectContractDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectNftContractDialogUpdated,
        (ev) => {
            if (ev.open || !ev.contract || ev.uuid !== id) return
            if (!contract || (contract && !isSameAddress(contract.address, ev.contract.address))) {
                if (contract && defaultToken && !isSameAddress(contract.address, defaultToken.address)) {
                    setDefaultToken(null)
                }
                setValue('contract', ev.contract.name || ev.contract.address, { shouldValidate: true })
                setContract(ev.contract)
                setValue('tokenId', '')
            }
        },
    )

    const {
        asyncRetry: { loading: loadingOwnerList },
        tokenDetailedOwnerList = [],
        clearTokenDetailedOwnerList,
    } = useNonFungibleOwnerTokens(contract?.address ?? '', account, chainId)

    const onTransfer = useCallback(
        async (data: FormInputs) => {
            let hash: string | undefined
            if (EthereumAddress.isValid(data.recipient)) {
                hash = await transferCallback(data.tokenId, data.recipient, gasConfig)
            } else if (Others?.isValidDomain?.(data.recipient) && EthereumAddress.isValid(registeredAddress)) {
                hash = await transferCallback(data.tokenId, registeredAddress, gasConfig)
            }
            if (typeof hash === 'string') {
                navigate(DashboardRoutes.WalletsHistory)
            }
        },
        [transferCallback, contract?.address, gasConfig, registeredAddress, Others?.isValidDomain],
    )

    const ensContent = useMemo(() => {
        if (resolveDomainLoading) return
        if (registeredAddress) {
            return (
                <Box style={{ padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                        href={explorerResolver.domainLink(chainId, allFormFields.recipient)}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none">
                        <Typography
                            fontSize={16}
                            lineHeight="22px"
                            fontWeight={500}
                            style={{ color: MaskColorVar.textPrimary }}>
                            {allFormFields.recipient}
                        </Typography>
                        <Typography fontSize={14} lineHeight="20px" style={{ color: MaskColorVar.textSecondary }}>
                            <FormattedAddress address={registeredAddress} size={4} formatter={Others?.formatAddress} />
                        </Typography>
                    </Link>
                    <RightIcon />
                </Box>
            )
        }

        if (allFormFields.recipient.includes('.eth')) {
            if (network?.type !== NetworkType.Ethereum) {
                return (
                    <Box style={{ padding: '25px 10px' }}>
                        <Typography color="#FF5F5F" fontSize={16} fontWeight={500} lineHeight="22px">
                            {t.wallet_transfer_error_no_ens_support()}
                        </Typography>
                    </Box>
                )
            }
            if (Others?.isValidDomain?.(allFormFields.recipient) && resolveDomainError) {
                return (
                    <Box style={{ padding: '25px 10px' }}>
                        <Typography color="#FF5F5F" fontSize={16} fontWeight={500} lineHeight="22px">
                            {t.wallet_transfer_error_no_address_has_been_set_name()}
                        </Typography>
                    </Box>
                )
            }
        }
        return
    }, [
        allFormFields.recipient,
        resolveDomainError,
        Others?.isValidDomain,
        resolveDomainLoading,
        network,
        registeredAddress,
    ])

    useUpdateEffect(() => {
        setPopoverOpen(!!ensContent && !!anchorEl.current)
    }, [ensContent])

    const contractIcon = useMemo(() => {
        if (!contract?.logoURL) return null
        return (
            <Box width={20} height={20} mr={1}>
                <img style={{ borderRadius: 10 }} width="20px" height="20px" src={contract.logoURL} alt="" />
            </Box>
        )
    }, [contract])

    return (
        <Stack direction="row" justifyContent="center" mt={4} maxHeight="100%">
            <form onSubmit={handleSubmit(onTransfer)} noValidate>
                <Stack width={640} minWidth={500} alignItems="center">
                    <Box width="100%">
                        <Controller
                            control={control}
                            render={(field) => (
                                <MaskTextField
                                    {...field}
                                    required
                                    onChange={(e) => setValue('recipient', e.currentTarget.value)}
                                    helperText={errors.recipient?.message || recipientError?.message}
                                    error={
                                        !!errors.recipient ||
                                        (!!recipientError && recipientError.type === 'contractAddress')
                                    }
                                    value={field.field.value}
                                    InputProps={{
                                        onClick: (event) => {
                                            if (!anchorEl.current) anchorEl.current = event.currentTarget
                                            if (ensContent) setPopoverOpen(true)
                                            setMinPopoverWidth(event.currentTarget.clientWidth)
                                        },
                                        spellCheck: false,
                                    }}
                                    label={t.wallets_transfer_to_address()}
                                />
                            )}
                            name="recipient"
                        />
                        <Popover
                            anchorEl={anchorEl.current}
                            onClose={() => setPopoverOpen(false)}
                            PaperProps={{
                                style: { minWidth: `${minPopoverWidth}px`, borderRadius: 4 },
                            }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            open={popoverOpen}>
                            {ensContent}
                        </Popover>
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
                                            classes: {
                                                disabled: classes.disabled,
                                            },
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
                        {tokenDetailedOwnerList.length > 0 && !loadingOwnerList && (
                            <Controller
                                control={control}
                                render={(field) => (
                                    <SelectNFTList
                                        error={!!errors.tokenId}
                                        onSelect={(value) => setValue('tokenId', value)}
                                        list={
                                            defaultToken
                                                ? unionBy([defaultToken, ...tokenDetailedOwnerList], 'tokenId')
                                                : tokenDetailedOwnerList
                                        }
                                        selectedTokenId={field.field.value}
                                        loading={loadingOwnerList}
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
                                    usd: gasFeeInUsd.toFixed(2),
                                })}
                            </Typography>
                            <IconButton size="small" onClick={onCustomGasSetting}>
                                <TuneIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box mt={4}>
                        <Button sx={{ width: 240 }} type="submit" disabled={isSubmitting || isTransferring}>
                            {t.wallets_transfer_send()}
                        </Button>
                    </Box>
                </Stack>
            </form>
        </Stack>
    )
})
