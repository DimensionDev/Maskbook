import { Icons } from '@masknet/icons'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, MaskTextField, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useAccount,
    useAddressType,
    useChainContext,
    useWeb3Connection,
    useWeb3Hub,
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { isSameAddress, type NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { AddressType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Stack, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import { useQueries, useQuery } from '@tanstack/react-query'
import { compact, uniq } from 'lodash-es'
import { memo, useCallback, useMemo, useState, type FormEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CollectibleItem, CollectibleItemSkeleton } from '../AssetsManagement/CollectibleItem.js'
import { EmptyStatus } from '../EmptyStatus/index.js'
import { LoadingStatus } from '../LoadingStatus/index.js'
import { ReloadStatus } from '../ReloadStatus/index.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        scrollbarWidth: 'none',
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
        color: theme.palette.maskColor.danger,
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
    input: {
        fontSize: 12,
    },
}))

type AddingNFTs<T extends NetworkPluginID = NetworkPluginID> = [
    contract: NonFungibleTokenContract<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
    tokenIds: string[],
]

export interface AddCollectiblesProps<T extends NetworkPluginID = NetworkPluginID>
    extends withClasses<'grid' | 'form' | 'main'> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    /**
     * Specified account.
     * For example, in PFP, we can add collectibles from verified wallets if no wallet connected.
     */
    account?: string

    onAdd(result?: AddingNFTs<T>): void

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
    const { _ } = useLingui()
    const { pluginID, chainId: defaultChainId, account: defaultAccount, onAdd } = props
    const { chainId } = useChainContext({ chainId: defaultChainId })
    const theme = useTheme()
    const walletAccount = useAccount()
    const account = defaultAccount || walletAccount
    const { classes } = useStyles(undefined, { props })
    const Utils = useWeb3Utils(pluginID)

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
        Utils.isValidAddress(address) ? address : '',
        {
            chainId,
        },
    )

    const validationMsgForAddress = useMemo(() => {
        if (!address) return ''
        if (!Utils.isValidAddress?.(address ?? '') || (addressType !== AddressType.Contract && !loadingAddressType))
            return <Trans>Incorrect contract address.</Trans>
        return ''
    }, [address, addressType, loadingAddressType])

    const {
        data: contract,
        isPending: isLoadingContract,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['nft-contract', pluginID, chainId, address],
        queryFn: () => connection.getNonFungibleTokenContract(address, undefined, { chainId }),
    })

    const isValid = useMemo(() => {
        return Boolean(isValidTokenIds(watchedTokenIds) && !validationMsgForAddress && address && tokenIds.length > 0)
    }, [watchedTokenIds, validationMsgForAddress])

    const Web3 = useWeb3Connection(pluginID, {
        chainId,
    })
    const assetsQueries = useQueries({
        queries: tokenIds.map((tokenId) => ({
            enabled: isValid,
            queryKey: ['nft-asset', account, pluginID, chainId, address, tokenId],
            queryFn: async () => {
                try {
                    return await hub.getNonFungibleAsset(address, tokenId, { chainId, account })
                } catch (err) {
                    const token = await Web3.getNonFungibleToken(address, tokenId)
                    return { ...token, owner: { address: token.ownerId } }
                }
            },
        })),
    })
    const loadingAssets = assetsQueries.every((x) => x.isPending)
    const allFailed = assetsQueries.every((x) => x.failureReason)
    const noResults = assetsQueries.every((x) => !x.isPending && !x.data) || !isValid || allFailed
    const someNotMine = assetsQueries.some((x) => (x.data ? !isSameAddress(x.data.owner?.address, account) : false))

    const handleFormSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            handleSubmit(() => {})(event)
        },
        [handleSubmit],
    )
    const [selectedTokenIdsMap, setSelectedTokenIdsMap] = useState<Record<string, string[]>>({})
    const selectedTokenIds = selectedTokenIdsMap[formatEthereumAddress(address)] || EMPTY_LIST

    const toggleSelect = useCallback(
        (asset: Web3Helper.NonFungibleAssetAll) => {
            setSelectedTokenIdsMap((idsMap) => {
                const ids = idsMap[formatEthereumAddress(address)] ?? []
                const newIds =
                    ids.includes(asset.tokenId) ? ids.filter((x) => x !== asset.tokenId) : [...ids, asset.tokenId]
                return {
                    ...idsMap,
                    [formatEthereumAddress(address)]: newIds,
                }
            })
        },
        [address],
    )

    const handleAdd = useCallback(() => {
        if (!contract) return
        onAdd([contract, selectedTokenIds])
    }, [contract, selectedTokenIds, onAdd])

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
                                autoFocus
                                placeholder={_(msg`Input contract address`)}
                                error={!!(errors.address || validationMsgForAddress)}
                                InputProps={{
                                    spellCheck: false,
                                    endAdornment:
                                        field.value ?
                                            <Icons.Close
                                                size={18}
                                                onClick={() => resetField('address')}
                                                color={
                                                    validationMsgForAddress ? theme.palette.maskColor.danger : undefined
                                                }
                                            />
                                        :   null,
                                    classes: { input: classes.input },
                                }}
                            />
                            {validationMsgForAddress ?
                                <Typography className={classes.error} mt={0.5}>
                                    {validationMsgForAddress}
                                </Typography>
                            :   null}
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
                                placeholder={_(msg`Token ID should be separated by comma, e.g. 1223,1224,`)}
                                error={!!errors.tokenIds}
                                InputProps={{
                                    spellCheck: false,
                                    endAdornment:
                                        field.value ?
                                            <Icons.Close
                                                size={18}
                                                onClick={() => resetField('tokenIds')}
                                                color={errors.tokenIds ? theme.palette.maskColor.danger : undefined}
                                            />
                                        :   null,
                                    classes: { input: classes.input },
                                }}
                            />

                            {errors.tokenIds ?
                                <Typography className={classes.error} mt={0.5}>
                                    {errors.tokenIds.message}
                                </Typography>
                            :   null}
                        </>
                    )}
                />
            </Box>
            {someNotMine ?
                <Typography className={classes.error} mt={1}>
                    <Trans>The contract address is incorrect or the collection does not belong to you.</Trans>
                </Typography>
            :   null}
            <div className={classes.main}>
                {!address || tokenIds.length === 0 ?
                    null
                : (isLoadingContract || loadingAssets) && isValid && !allFailed ?
                    <LoadingStatus flexGrow={1} />
                : isError ?
                    <ReloadStatus flexGrow={1} onRetry={refetch} />
                : noResults ?
                    <EmptyStatus height="100%">
                        <Trans>No results</Trans>
                    </EmptyStatus>
                :   <Box className={classes.grid}>
                        {assetsQueries
                            .filter((x) => x.data)
                            .map(({ data: asset, isPending }, i) => {
                                if (isPending) return <CollectibleItemSkeleton key={i} />
                                if (!asset) return null
                                const isMine = isSameAddress(account, asset.owner?.address)
                                return (
                                    <CollectibleItem
                                        key={`${asset.chainId}.${asset.address}.${asset.tokenId}`}
                                        className={isMine ? undefined : classes.notMine}
                                        asset={asset}
                                        pluginID={pluginID}
                                        disableName
                                        actionLabel={<Trans>Send</Trans>}
                                        disableAction
                                        onItemClick={isMine ? toggleSelect : undefined}
                                        isSelected={selectedTokenIds.includes(asset.tokenId)}
                                        showUnCheckedIndicator
                                    />
                                )
                            })}
                    </Box>
                }
            </div>
            <Stack className={classes.toolbar} direction="row" justifyContent="center">
                <ActionButton fullWidth startIcon={<Icons.Avatar size={18} />} disabled={disabled} onClick={handleAdd}>
                    <Trans>Add NFTs</Trans>
                </ActionButton>
            </Stack>
        </form>
    )
})
