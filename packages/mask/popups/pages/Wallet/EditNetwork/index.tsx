import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useChainContext, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { fetchChains } from '@masknet/web3-providers/helpers'
import { TokenType, type TransferableNetwork } from '@masknet/web3-shared-base'
import { ChainId, NetworkType, ProviderType, SchemaType, ZERO_ADDRESS, getRPCConstant } from '@masknet/web3-shared-evm'
import { Button, Input, Typography, alpha } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { type ZodCustomIssue, type z } from 'zod'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { PageTitleContext, useTitle } from '../../../hooks/index.js'
import { createSchema } from './network-schema.js'
import { useWarnings } from './useWarnings.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
        padding: theme.spacing(0, 2, 2),
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
        boxShadow: theme.palette.maskColor.bottomBg,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
    },
    label: {
        color: theme.palette.maskColor.second,
        marginBottom: theme.spacing(0.5),
        marginTop: theme.spacing(2),
    },
    error: {
        color: theme.palette.maskColor.danger,
        marginTop: theme.spacing(0.5),
    },
    warn: {
        color: theme.palette.maskColor.main,
        marginTop: theme.spacing(0.5),
    },
}))

const QUERY_KEY = ['system', 'wallet', 'networks']
export const Component = memo(function EditNetwork() {
    const { _ } = useLingui()
    const t = useMaskSharedTrans()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const id = useParams<{ id: string }>().id
    const chainId = id?.match(/^\d+$/) ? Number.parseInt(id, 10) : undefined
    const isEditing = !!id && !chainId
    const { chainId: currentChainId, setChainId } = useChainContext()

    // #region Get network
    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const network = useMemo(() => {
        const network = networks.find((x) => x.ID === id)
        if (!network) return null
        return {
            name: network.name,
            chainId: network.chainId,
            rpc: network.isCustomized ? network.rpcUrl : getRPCConstant(network.chainId, 'RPC_URLS')?.[0],
            currencySymbol: network.nativeCurrency.symbol,
            explorer: network.explorerUrl.url,
            isCustomized: network.isCustomized,
        }
    }, [chainId, networks])
    // #endregion

    const { showSnackbar } = usePopupCustomSnackbar()
    useTitle(network ? network.name : _(msg`Add Network`))
    const { setExtension } = useContext(PageTitleContext)

    const queryClient = useQueryClient()
    const isBuiltIn = network ? !network.isCustomized : false
    useEffect(() => {
        if (isBuiltIn || !id || !Network) return
        setExtension(
            <Button
                variant="text"
                className={classes.iconButton}
                onClick={async () => {
                    if (currentChainId === network?.chainId) {
                        await EVMWeb3.switchChain(ChainId.Mainnet, {
                            providerType: ProviderType.MaskWallet,
                        })
                        setChainId(ChainId.Mainnet)
                    }
                    await Network.removeNetwork(id)
                    showSnackbar(<Trans>Network removed.</Trans>)
                    // Trigger UI update.
                    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
                    navigate(-1)
                }}>
                <Icons.Trash size={24} />
            </Button>,
        )
        return () => setExtension(undefined)
    }, [isBuiltIn, id, classes.iconButton, showSnackbar, t, Network, currentChainId, queryClient])

    const schema = useMemo(() => {
        return createSchema(
            _,
            async (name) => {
                return !networks.find((network) => network.name === name && network.ID !== id)
            },
            networks,
            id,
        )
    }, [t, id, networks])

    type FormInputs = z.infer<typeof schema>
    const {
        getValues,
        watch,
        register,
        setError,
        formState: { errors, isValidating, isDirty, isValid: isFormValid },
    } = useForm<FormInputs>({
        mode: 'onChange',
        resolver: zodResolver(schema),
        defaultValues: network || {},
    })
    const checkZodError = useCallback(
        (message: string) => {
            try {
                const issues = JSON.parse(message) as ZodCustomIssue[]
                issues.forEach((issue) => {
                    // We assume there is no multiple paths.
                    setError(issue.path[0] as keyof FormInputs, {
                        // @ts-expect-error i18n-todo: figure out type of issue.message.
                        message: t[issue.message](issue.params),
                    })
                })
            } catch {}
            return false
        },
        [setError, t],
    )

    const formChainId = +watch('chainId')
    const formSymbol = watch('currencySymbol')
    const { chainIdWarning, symbolWarning } = useWarnings(formChainId, formSymbol)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const { isPending: isMutating, mutate } = useMutation<void, unknown, FormInputs>({
        mutationFn: async (data) => {
            if (!Network) return
            setIsSubmitting(true)
            try {
                const parsedData = await schema.parseAsync(data)
                const chainId = parsedData.chainId
                let symbol = parsedData.currencySymbol
                if (!symbol) {
                    const chains = await queryClient.fetchQuery({
                        queryKey: ['chain-list'],
                        queryFn: fetchChains,
                    })
                    symbol = chains.find((x) => x.chainId === chainId)?.nativeCurrency.symbol
                }
                symbol ||= ''
                const network: TransferableNetwork<ChainId, SchemaType, NetworkType> = {
                    isCustomized: true,
                    type: NetworkType.CustomNetwork,
                    chainId,
                    name: parsedData.name,
                    fullName: parsedData.name,
                    network: 'mainnet',
                    rpcUrl: parsedData.rpc,
                    nativeCurrency: {
                        id: ZERO_ADDRESS,
                        chainId,
                        type: TokenType.Fungible,
                        schema: SchemaType.Native,
                        name: symbol,
                        symbol,
                        decimals: 18,
                        address: ZERO_ADDRESS,
                    },
                    explorerUrl: {
                        url: parsedData.explorer,
                    },
                }
                if (isEditing) {
                    await Network.updateNetwork(id, network)
                    showSnackbar(<Trans>Network saved</Trans>)
                } else {
                    await Network.addNetwork(network)
                    showSnackbar(<Trans>Netword added</Trans>)
                }
                navigate(-1)
                queryClient.invalidateQueries({ queryKey: QUERY_KEY })
            } catch (err) {
                checkZodError((err as Error).message)
                showSnackbar(<Trans>Failed to save network</Trans>)
            }
            setIsSubmitting(false)
        },
    })

    const [isChecking, setIsChecking] = useState(false)
    const isNotReady = isValidating || !isFormValid || !isDirty || isChecking
    const disabled = isNotReady || isMutating || isSubmitting

    const handleSubmit = useCallback(async () => {
        if (disabled) return
        setIsChecking(true)
        const data = getValues()
        const result = await schema.parseAsync(data).then(
            () => true,
            (err) => checkZodError((err as Error).message),
        )
        setIsChecking(false)
        if (!result) return
        mutate(data)
    }, [disabled, getValues, isEditing])

    return (
        <main className={classes.main}>
            <form className={classes.form} data-hide-scrollbar>
                <Typography className={classes.label}>
                    <Trans>Network Name</Trans>
                </Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.name}
                    {...register('name')}
                    placeholder="Cel"
                    disabled={isBuiltIn}
                    inputProps={{
                        placeholder: '',
                        maxLength: 24,
                    }}
                />
                {errors.name ?
                    <Typography className={classes.error}>{errors.name.message}</Typography>
                :   null}

                <Typography className={classes.label}>
                    <Trans>RPC URL</Trans>
                </Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.rpc}
                    {...register('rpc')}
                    placeholder="https://"
                    disabled={isBuiltIn}
                />
                {errors.rpc ?
                    <Typography className={classes.error}>{errors.rpc.message}</Typography>
                :   null}

                <Typography className={classes.label}>
                    <Trans>Chain ID</Trans>
                </Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.chainId}
                    {...register('chainId')}
                    placeholder="eg. 2"
                    disabled={isBuiltIn}
                />
                {errors.chainId ?
                    <Typography className={classes.error}>{errors.chainId.message}</Typography>
                : chainIdWarning ?
                    <Typography className={classes.warn}>{chainIdWarning}</Typography>
                :   null}

                <Typography className={classes.label}>
                    <Trans>Currency Symbol (Optional)</Trans>
                </Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.currencySymbol}
                    {...register('currencySymbol', { required: false })}
                    placeholder="eg. ETH"
                    disabled={isBuiltIn || !!errors.chainId}
                />
                {symbolWarning ?
                    <Typography className={classes.warn}>{symbolWarning}</Typography>
                :   null}

                <Typography className={classes.label}>
                    <Trans>Block Explorer URL</Trans>
                </Typography>
                <Input
                    fullWidth
                    disableUnderline
                    {...register('explorer')}
                    placeholder="https://"
                    disabled={isBuiltIn}
                />
                {errors.explorer ?
                    <Typography className={classes.error}>{errors.explorer.message}</Typography>
                :   null}
            </form>
            {!isBuiltIn ?
                <div className={classes.footer}>
                    <ActionButton fullWidth variant="outlined" onClick={() => navigate(-1)}>
                        <Trans>Cancel</Trans>
                    </ActionButton>
                    <ActionButton fullWidth onClick={handleSubmit} disabled={disabled}>
                        <Trans>Confirm</Trans>
                    </ActionButton>
                </div>
            :   null}
        </main>
    )
})
