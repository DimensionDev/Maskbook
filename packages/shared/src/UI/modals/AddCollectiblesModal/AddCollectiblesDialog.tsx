import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { MaskColorVar, MaskTextField, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useWeb3Connection, useWeb3Hub, useWeb3Others } from '@masknet/web3-hooks-base'
import { Web3 } from '@masknet/web3-providers'
import { isSameAddress, type NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { AddressType, type ChainId } from '@masknet/web3-shared-evm'
import { Button, DialogContent, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useQueries, useQuery } from '@tanstack/react-query'
import { compact, isNaN, uniq } from 'lodash-es'
import { memo, useCallback, useMemo, useState, type FormEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CollectibleItem, CollectibleItemSkeleton } from '../../components/AssetsManagement/CollectibleItem.js'
import { useSharedI18N } from '../../../locales/index.js'
import { InjectedDialog } from '../../contexts/components/index.js'
import { EmptyStatus, LoadingStatus, ReloadStatus } from '../../components/index.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: 0,
    },
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(20%, 1fr))',
        gridGap: theme.spacing(2),
        padding: theme.spacing(2, 0),
        paddingRight: theme.spacing(1),
        boxSizing: 'border-box',
        marginBottom: 'auto',
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

function isValidTokenIds(rawIds: string) {
    const containsInvalidId = rawIds.split(',').some((v) => {
        const trimmed = v.trim()
        if (!trimmed) return false
        const id = Number.parseInt(trimmed, 10)
        return isNaN(id) || id <= 0
    })
    return !containsInvalidId
}

async function isContract(address: string, chainId: ChainId) {
    const addressType = await Web3.getAddressType(address, { chainId })
    return addressType === AddressType.Contract
}

export interface AddCollectiblesDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
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
}

export const AddCollectiblesDialog = memo(function AddCollectiblesDialog({
    open,
    pluginID,
    chainId,
    account: defaultAccount,
    onClose,
}: AddCollectiblesDialogProps) {
    const t = useSharedI18N()
    const walletAccount = useAccount()
    const account = defaultAccount || walletAccount
    const { classes } = useStyles()
    const Others = useWeb3Others(pluginID)
    const schema = useMemo(() => {
        return z.object({
            address: z
                .string()
                .min(1, t.collectible_contract_require())
                .refine(Others.isValidAddress, t.collectible_contract_invalid())
                .refine((addr) => isContract(addr, chainId as ChainId), t.collectible_contract_invalid()),
            tokenIds: z
                .string()
                .min(1, t.collectible_token_id_require())
                .refine(isValidTokenIds, t.collectible_token_id_invalid()),
        })
    }, [t, Others.isValidAddress, chainId])
    type FormInputs = z.infer<typeof schema>

    const {
        control,
        watch,
        handleSubmit,
        resetField,
        formState: { errors, isValid, isValidating },
    } = useForm<FormInputs>({
        mode: 'onBlur',
        resolver: zodResolver(schema),
        defaultValues: { address: '', tokenIds: '' },
    })
    const watchedTokenIds = watch('tokenIds')
    const tokenIds = useMemo(() => uniq(compact(watchedTokenIds.split(',').map((id) => id.trim()))), [watchedTokenIds])
    const address = watch('address')
    const hub = useWeb3Hub(pluginID)
    const connection = useWeb3Connection(pluginID)

    const {
        data: contract,
        isLoading: isLoadingContract,
        isError,
        refetch,
    } = useQuery({
        queryKey: ['nft-contract', pluginID, chainId, address],
        queryFn: () => connection.getNonFungibleTokenContract(address, undefined, { chainId }),
    })
    const assetsQueries = useQueries({
        queries: tokenIds.map((tokenId) => ({
            enabled: isValid,
            queryKey: ['nft-asset', pluginID, chainId, address, tokenId, isValid],
            queryFn: () => hub.getNonFungibleAsset(address, tokenId, { chainId }),
        })),
    })
    const noResults = assetsQueries.every((x) => !x.isLoading && !x.data)
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
                    [address]: newIds,
                }
            })
        },
        [address],
    )

    const handleAdd = useCallback(() => {
        if (!contract) return
        onClose([contract, selectedTokenIds])
    }, [contract, selectedTokenIds, onClose])

    const disabled = !selectedTokenIds.length || isLoadingContract || isValidating

    return (
        <InjectedDialog titleBarIconStyle={'back'} open={open} onClose={() => onClose()} title={t.add_collectibles()}>
            <DialogContent classes={{ root: classes.content }}>
                <form className={classes.form} onSubmit={handleFormSubmit}>
                    <Controller
                        control={control}
                        name="address"
                        render={({ field }) => (
                            <>
                                <MaskTextField
                                    {...field}
                                    placeholder={t.add_collectibles_address_placeholder()}
                                    error={!!errors.address}
                                    InputProps={{
                                        endAdornment: field.value ? (
                                            <Icons.Close size={18} onClick={() => resetField('address')} />
                                        ) : null,
                                    }}
                                />
                                {errors.address ? (
                                    <Typography className={classes.error} mt={0.5}>
                                        {errors.address?.message}
                                    </Typography>
                                ) : null}
                            </>
                        )}
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
                        {isLoadingContract ? (
                            <LoadingStatus flexGrow={1} />
                        ) : isError ? (
                            <ReloadStatus flexGrow={1} onRetry={refetch} />
                        ) : noResults || !isValid ? (
                            <EmptyStatus height="100%">{t.no_results()}</EmptyStatus>
                        ) : (
                            <Box className={classes.grid}>
                                {assetsQueries.map(({ data: asset, isLoading }, i) => {
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
                        <Button
                            fullWidth
                            startIcon={<Icons.ConnectWallet size={18} />}
                            disabled={disabled}
                            onClick={handleAdd}>
                            {t.add_collectibles()}
                        </Button>
                    </Stack>
                </form>
            </DialogContent>
        </InjectedDialog>
    )
})
