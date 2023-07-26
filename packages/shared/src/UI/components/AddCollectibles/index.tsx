import { Icons } from '@masknet/icons'
import { ActionButton, MaskColorVar, MaskTextField, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useAccount,
    useChainContext,
    useWeb3Connection,
    useWeb3Hub,
    useWeb3Others,
    useAddressType,
} from '@masknet/web3-hooks-base'
import { isSameAddress, type NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useQueries, useQuery } from '@tanstack/react-query'
import { compact, uniq } from 'lodash-es'
import { memo, useCallback, useMemo, useState, type FormEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CollectibleItem, CollectibleItemSkeleton } from '../../components/AssetsManagement/CollectibleItem.js'
import { useSharedI18N } from '../../../locales/index.js'
import { EmptyStatus, LoadingStatus, ReloadStatus } from '../../components/index.js'
import { AddressType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { type NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    form: {
        height: 564,
        boxSizing: 'border-box',
        display: 'flex',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.maskColor.bottom,
        flexDirection: 'column',
        overflow: 'auto',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    main: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // Space for toolbar
        paddingBottom: theme.spacing(9),
        boxSizing: 'border-box',
    },
    grid: {
        width: '100%',
        display: 'grid',
        overflow: 'auto',
        gridGap: theme.spacing(2),
        padding: theme.spacing(2, 0),
        paddingRight: theme.spacing(1),
        boxSizing: 'border-box',
        marginBottom: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    notMine: {
        opacity: 0.5,
        cursor: 'not-allowed',
        '*': {
            cursor: 'not-allowed',
        },
    },
    error: {
        backgroundColor: theme.palette.maskColor.bottom,
        fontSize: 14,
        color: MaskColorVar.redMain,
    },
    toolbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: theme.spacing(9),
        padding: theme.spacing(0, 2),
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        borderRadius: theme.spacing(0, 0, 1.5, 1.5),
    },
}))

export interface AddCollectiblesProps<T extends NetworkPluginID = NetworkPluginID>
    extends withClasses<'grid' | 'form' | 'main'> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    /**
     * Specified account.
     * For example, in PFP, we can add collectibles from verified wallets if no wallet connected.
     */
    account?: string
    onClose(
        result?: [
            contract: NonFungibleTokenContract<
                Web3Helper.Definition[T]['ChainId'],
                Web3Helper.Definition[T]['SchemaType']
            >,
            tokenIds: string[],
        ],
    ): void
    disabled?: boolean
}

function isValidTokenIds(rawIds: string) {
    const containsInvalidId = rawIds.split(',').some((v) => {
        const trimmed = v.trim()
        if (!trimmed) return false
        const id = Number.parseInt(trimmed, 10)
        return Number.isNaN(id) || id <= 0
    })
    return !containsInvalidId
}

export const AddCollectibles = memo(function AddCollectibles(props: AddCollectiblesProps) {
    const { pluginID, chainId: chainId_, account: defaultAccount, onClose } = props
    const { chainId } = useChainContext({ chainId: chainId_ })
    const t = useSharedI18N()
    const walletAccount = useAccount()
    const account = defaultAccount || walletAccount
    const { classes } = useStyles(undefined, { props })
    const Others = useWeb3Others(pluginID)

    const {
        control,
        watch,
        handleSubmit,
        resetField,
        formState: { errors, isValidating },
    } = useForm({
        mode: 'all',
        defaultValues: { address: '', tokenIds: '' },
    })
    const watchedTokenIds = watch('tokenIds')
    const tokenIds = useMemo(() => uniq(compact(watchedTokenIds.split(',').map((id) => id.trim()))), [watchedTokenIds])
    const address = watch('address')
    const hub = useWeb3Hub(pluginID, { chainId })
    const connection = useWeb3Connection(pluginID, { chainId })

    const { value: addressType, loading: loadingAddressType } = useAddressType(
        pluginID,
        !Others.isValidAddress?.(address ?? '') ? '' : address,
        {
            chainId,
        },
    )

    const validationMsgForAddress = useMemo(() => {
        if (!address) return ''
        if (!Others.isValidAddress?.(address ?? '') || (addressType !== AddressType.Contract && !loadingAddressType))
            return t.collectible_contract_invalid()
        return ''
    }, [address, addressType, loadingAddressType])

    const {
        data: contract,
        isLoading: isLoadingContract,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['nft-contract', pluginID, chainId, address],
        queryFn: () => connection.getNonFungibleTokenContract(address, undefined, { chainId }),
    })

    const isValid = useMemo(() => {
        return Boolean(isValidTokenIds(watchedTokenIds) && !validationMsgForAddress && address && tokenIds.length > 0)
    }, [watchedTokenIds, validationMsgForAddress])

    const assetsQueries = useQueries({
        queries: tokenIds.map((tokenId) => ({
            enabled: isValid,
            queryKey: ['nft-asset', pluginID, chainId, address, tokenId],
            queryFn: () => hub.getNonFungibleAsset(address, tokenId, { chainId }),
        })),
    })
    const loadingAssets = assetsQueries.every((x) => x.isLoading)
    const allFailed = assetsQueries.every((x) => x.failureReason)
    const noResults = assetsQueries.every((x) => !x.isLoading && !x.data) || !isValid || allFailed
    const someNotMine = assetsQueries.some((x) => (x.data ? !isSameAddress(x.data.owner?.address, account) : false))

    const handleFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            handleSubmit(() => {})(event)
        },
        [handleSubmit],
    )
    const [selectedTokenIdsMap, setSelectedTokenIdsMap] = useState<Record<string, string[]>>({})
    const selectedTokenIds = selectedTokenIdsMap[address] || EMPTY_LIST

    const toggleSelect = useCallback(
        (asset: Web3Helper.NonFungibleAssetAll) => {
            setSelectedTokenIdsMap((idsMap) => {
                const ids = idsMap[address] ?? []
                const newIds = ids.includes(asset.tokenId)
                    ? ids.filter((x) => x !== asset.tokenId)
                    : [...ids, asset.tokenId]
                return {
                    ...idsMap,
                    [formatEthereumAddress(address)]: newIds,
                }
            })
        },
        [address],
    )

    const handleClose = useCallback(() => {
        if (!contract) return
        onClose([contract, selectedTokenIds])
    }, [contract, selectedTokenIds, onClose])

    const disabled = !selectedTokenIds.length || isLoadingContract || isValidating || props.disabled

    return (
        <form className={classes.form} onSubmit={handleFormSubmit}>
            <Controller
                control={control}
                name="address"
                render={({ field }) => {
                    return (
                        <>
                            <MaskTextField
                                {...field}
                                placeholder={t.add_collectibles_address_placeholder()}
                                error={!!errors.address}
                                InputProps={{
                                    spellCheck: false,
                                    endAdornment: field.value ? (
                                        <Icons.Close size={18} onClick={() => resetField('address')} />
                                    ) : null,
                                }}
                            />
                            {validationMsgForAddress ? (
                                <Typography className={classes.error} mt={0.5}>
                                    {validationMsgForAddress}
                                </Typography>
                            ) : null}
                        </>
                    )
                }}
            />
            <Box mt={2}>
                <Controller
                    control={control}
                    name="tokenIds"
                    render={({ field }) => (
                        <>
                            <MaskTextField
                                {...field}
                                placeholder={t.add_collectibles_token_id_placeholder()}
                                error={!!errors.tokenIds}
                                InputProps={{
                                    spellCheck: false,
                                    endAdornment: field.value ? (
                                        <Icons.Close size={18} onClick={() => resetField('tokenIds')} />
                                    ) : null,
                                }}
                            />

                            {errors.tokenIds ? (
                                <Typography className={classes.error} mt={0.5}>
                                    {errors.tokenIds?.message}
                                </Typography>
                            ) : null}
                        </>
                    )}
                />
            </Box>
            {someNotMine ? (
                <Typography className={classes.error} mt={1}>
                    {t.collection_not_belong_to_you()}
                </Typography>
            ) : null}
            <div className={classes.main}>
                {(isLoadingContract || loadingAssets) && isValid && !allFailed ? (
                    <LoadingStatus flexGrow={1} />
                ) : isError ? (
                    <ReloadStatus flexGrow={1} onRetry={refetch} />
                ) : noResults ? (
                    <EmptyStatus height="100%">{t.no_results()}</EmptyStatus>
                ) : (
                    <Box className={classes.grid}>
                        {assetsQueries
                            .filter((x) => x.data)
                            .map(({ data: asset, isLoading }, i) => {
                                if (isLoading) return <CollectibleItemSkeleton key={i} />
                                if (!asset) return null
                                const isMine = isSameAddress(account, asset.owner?.address)
                                return (
                                    <CollectibleItem
                                        key={`${asset.chainId}.${asset.address}.${asset.tokenId}`}
                                        className={isMine ? undefined : classes.notMine}
                                        asset={asset}
                                        pluginID={pluginID}
                                        disableName
                                        actionLabel={t.send()}
                                        disableAction
                                        onItemClick={isMine ? toggleSelect : undefined}
                                        indicatorIcon={Icons.Checkbox}
                                        isSelected={selectedTokenIds.includes(asset.tokenId)}
                                    />
                                )
                            })}
                    </Box>
                )}
            </div>
            <Stack className={classes.toolbar} direction="row" justifyContent="center">
                <ActionButton
                    fullWidth
                    startIcon={<Icons.Wallet size={18} />}
                    disabled={disabled}
                    onClick={handleClose}>
                    {t.add_collectibles()}
                </ActionButton>
            </Stack>
        </form>
    )
})
