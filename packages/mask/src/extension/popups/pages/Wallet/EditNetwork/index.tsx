import { zodResolver } from '@hookform/resolvers/zod'
import { PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Button, Typography, alpha } from '@mui/material'
import { memo, useContext, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { getEvmNetworks, useI18N } from '../../../../../utils/index.js'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { useTitle } from '../../../hook/index.js'
import { PageTitleContext } from '../../../context.js'
import { Icons } from '@masknet/icons'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { chainResolver, explorerResolver, getRPCConstant } from '@masknet/web3-shared-evm'
import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@masknet/shared-base-ui'
import { delay } from '@masknet/kit'

const useStyles = makeStyles()((theme) => ({
    main: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    form: {
        overflow: 'auto',
        flexGrow: 1,
        padding: theme.spacing(2),
    },
    iconButton: {
        padding: 0,
        minWidth: 'auto',
        width: 'auto',
    },
    footer: {
        padding: theme.spacing(2),
        borderRadius: 12,
        background: alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    label: {
        color: theme.palette.maskColor.second,
        marginBottom: theme.spacing(0.5),
    },
    error: {
        color: theme.palette.maskColor.danger,
        marginTop: theme.spacing(0.5),
    },
}))

const QUERY_KEY = ['system', 'wallet', 'networks']

/**
 * Check if network exists by chain id.
 * Including both builtin networks and additional networks
 */
async function checkChainId(chainId: number) {
    const builtInNetworks = getEvmNetworks(true)
    if (builtInNetworks.find((x) => x.chainId === chainId)) return false
    const storedNetworks = await queryClient.fetchQuery(QUERY_KEY, () => WalletRPC.getNetworks())
    return !storedNetworks.find((x) => x.chainId === chainId)
}

const createSchema = function createSchema(t: ReturnType<typeof useI18N>['t'], isEditing: boolean) {
    const schema = z.object({
        name: z.string().nonempty(),
        rpc: z.string().trim().url(t('incorrect_rpc_url')),
        chainId: z
            .union([
                z
                    .string()
                    .trim()
                    .regex(/^\d+$/, t('incorrect_chain_id'))
                    .transform((v) => Number.parseInt(v, 10)),
                z.number(),
            ])
            .refine(async (v) => {
                if (isEditing) return true
                return checkChainId(v)
            }, t('adding_network_exists')),
        currencySymbol: z.string().optional(),
        explorer: z.string().url(t('incorrect_explorer_url')).optional(),
    })
    return schema
}

export const EditNetwork = memo(function EditNetwork() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const paramChainId = useParams<{ chainId: string }>().chainId
    const chainId = paramChainId ? Number.parseInt(paramChainId, 10) : undefined
    const isEditing = !!chainId

    // #region Get network
    const networks = useMemo(() => getEvmNetworks(true), [])
    const builtInNetwork = useMemo(() => {
        if (!paramChainId) return null
        const network = networks.find((x) => x.chainId === chainId)
        if (network) {
            const chainId = network.chainId
            return {
                name: network.name,
                chainId,
                rpc: getRPCConstant(chainId, 'RPC_URLS')?.[0],
                currencySymbol: chainResolver.nativeCurrency(chainId)?.symbol,
                explorer: explorerResolver.explorerURL(chainId).url,
            }
        }
        return null
    }, [chainId, networks])
    const { data: storedNetworks = [] } = useQuery({
        enabled: !builtInNetwork && !!chainId,
        queryKey: ['system', 'wallet', 'networks'],
        queryFn: () => WalletRPC.getNetworks(),
    })
    const storedNetwork = storedNetworks.find((x) => x.chainId === chainId)

    const network = builtInNetwork || storedNetwork
    // #endregion

    useTitle(network ? network.name : t('network_management_add_network'))
    const { setExtension } = useContext(PageTitleContext)

    const isBuiltIn = !!builtInNetwork
    useEffect(() => {
        if (!chainId || isBuiltIn) return
        setExtension(
            <Button
                variant="text"
                className={classes.iconButton}
                onClick={async () => {
                    await WalletRPC.deleteNetwork(chainId)
                    queryClient.invalidateQueries(QUERY_KEY)
                    navigate(-1)
                }}>
                <Icons.Trash size={24} />
            </Button>,
        )
        return () => setExtension(undefined)
    }, [isBuiltIn, chainId, classes.iconButton])

    const schema = useMemo(() => createSchema(t, isEditing), [t, isEditing])

    type FormInputs = z.infer<typeof schema>
    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isValidating, isSubmitting },
    } = useForm<FormInputs>({
        mode: 'all',
        resolver: zodResolver(schema),
        defaultValues: {
            ...network,
            chainId: network?.chainId,
        },
    })
    const { isLoading: isMutating, mutate } = useMutation<void, unknown, FormInputs>({
        mutationFn: async (data) => {
            if (isEditing) {
                if (data.chainId !== chainId) {
                    await WalletRPC.deleteNetwork(chainId)
                    await delay(100)
                    await WalletRPC.addNetwork(data)
                } else {
                    await WalletRPC.updateNetwork(chainId, data)
                }
            } else {
                await WalletRPC.addNetwork(data)
            }
            navigate(-1)
            queryClient.invalidateQueries(QUERY_KEY)
        },
    })

    const isNotReady = isValidating || (!isValidating && !isValid)
    const disabled = Object.keys(errors).length > 0 || isSubmitting || isNotReady || isMutating

    return (
        <main className={classes.main}>
            <form className={classes.form}>
                <Typography className={classes.label}>{t('network_name')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => <StyledInput {...field} placeholder="Cel" disabled={isBuiltIn} />}
                    name="name"
                />

                <Typography className={classes.label}>{t('new_rpc_url')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => <StyledInput {...field} placeholder="https://" disabled={isBuiltIn} />}
                    name="rpc"
                />
                {errors.rpc ? <Typography className={classes.error}>{errors.rpc.message}</Typography> : null}

                <Typography className={classes.label}>{t('chain_id')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => <StyledInput {...field} placeholder="eg. 2" disabled={isBuiltIn} />}
                    name="chainId"
                />
                {errors.chainId ? <Typography className={classes.error}>{errors.chainId.message}</Typography> : null}

                <Typography className={classes.label}>{t('optional_currency_symbol')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => <StyledInput {...field} placeholder="eg. ETH" disabled={isBuiltIn} />}
                    name="currencySymbol"
                />

                <Typography className={classes.label}>{t('optional_block_explorer_url')}</Typography>
                <Controller
                    control={control}
                    render={({ field }) => <StyledInput {...field} placeholder="https://" disabled={isBuiltIn} />}
                    name="explorer"
                />
                {errors.explorer ? <Typography className={classes.error}>{errors.explorer.message}</Typography> : null}
            </form>
            {!isBuiltIn ? (
                <div className={classes.footer}>
                    <ActionButton fullWidth variant="outlined" onClick={() => navigate(PopupRoutes.EditNetwork)}>
                        {t('cancel')}
                    </ActionButton>
                    <ActionButton
                        fullWidth
                        onClick={handleSubmit((data: FormInputs) => mutate(data))}
                        disabled={disabled}>
                        {t('confirm')}
                    </ActionButton>
                </div>
            ) : null}
        </main>
    )
})
