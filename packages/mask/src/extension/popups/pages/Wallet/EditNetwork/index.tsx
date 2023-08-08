import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { ChainResolver, ExplorerResolver } from '@masknet/web3-providers'
import { TokenType, type TransferableNetwork } from '@masknet/web3-shared-base'
import { NetworkType, SchemaType, ZERO_ADDRESS, type ChainId } from '@masknet/web3-shared-evm'
import { Button, Input, Typography, alpha } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { omit } from 'lodash-es'
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z, type ZodCustomIssue } from 'zod'
import { createSchema, useI18N, type AvailableLocaleKeys } from '../../../../../utils/index.js'
import { PageTitleContext } from '../../../context.js'
import { useTitle } from '../../../hook/index.js'

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
export const EditNetwork = memo(function EditNetwork() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const id = useParams<{ id: string }>().id
    const chainId = id?.match(/^\d+$/) ? Number.parseInt(id, 10) : undefined
    const isEditing = !!id && !chainId

    // #region Get network
    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const network = useMemo(() => {
        const network = networks.find((x) => x.ID === id)
        if (!network) return null
        return {
            name: network.name,
            chainId: network.chainId,
            rpc: network.rpcUrl,
            currencySymbol: ChainResolver.nativeCurrency(network.chainId)?.symbol,
            explorer: ExplorerResolver.explorerUrl(network.chainId).url,
            isCustomized: network.isCustomized,
        }
    }, [chainId, networks])
    // #endregion

    const { showSnackbar } = usePopupCustomSnackbar()
    useTitle(network ? network.name : t('network_management_add_network'))
    const { setExtension } = useContext(PageTitleContext)

    const isBuiltIn = network ? !network.isCustomized : false
    useEffect(() => {
        if (isBuiltIn || !id || !Network) return
        setExtension(
            <Button
                variant="text"
                className={classes.iconButton}
                onClick={async () => {
                    await Network?.removeNetwork(id)
                    showSnackbar(t('deleted_network_successfully'))
                    // Trigger UI update.
                    queryClient.invalidateQueries(QUERY_KEY)
                    navigate(-1)
                }}>
                <Icons.Trash size={24} />
            </Button>,
        )
        return () => setExtension(undefined)
    }, [isBuiltIn, id, classes.iconButton, showSnackbar, t, Network])

    const schema = useMemo(() => {
        return createSchema(t, async (name) => {
            return !networks.find((network) => network.name === name && network.ID !== id)
        }).superRefine((schema, context) => {
            const network = networks.find((network) => network.rpcUrl === schema.rpc && network.ID !== id)
            if (network) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['rpc'],
                    message: t('rpc_url_is_used_by', { name: network.name }),
                })
                return false
            }
            return true
        })
    }, [t, id, networks])

    type FormInputs = z.infer<typeof schema>
    const {
        getValues,
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
                const isInvalid = issues.some((issue) => issue.path[0] !== 'currencySymbol')
                if (!isInvalid) return true
                issues.forEach((issue) => {
                    // We assume there is no multiple paths.
                    setError(issue.path[0] as keyof FormInputs, {
                        message: t(issue.message as AvailableLocaleKeys, issue.params),
                    })
                })
            } catch {}
            return false
        },
        [setError, t],
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { isLoading: isMutating, mutate } = useMutation<void, unknown, FormInputs>({
        mutationFn: async (data) => {
            if (!Network) return
            setIsSubmitting(true)
            const parsedData = await schema.parseAsync(data)
            const chainId = parsedData.chainId
            try {
                const network: TransferableNetwork<ChainId, SchemaType, NetworkType> = {
                    isCustomized: true,
                    type: NetworkType.CustomNetwork,
                    chainId,
                    coinMarketCapChainId: '',
                    coinGeckoChainId: '',
                    name: parsedData.name,
                    fullName: parsedData.name,
                    network: 'mainnet',
                    rpcUrl: parsedData.rpc,
                    nativeCurrency: {
                        id: ZERO_ADDRESS,
                        chainId,
                        type: TokenType.Fungible,
                        schema: SchemaType.Native,
                        name: parsedData.currencySymbol || '',
                        symbol: parsedData.currencySymbol || '',
                        decimals: 18,
                        address: ZERO_ADDRESS,
                    },
                    explorerUrl: {
                        url: '',
                    },
                }
                if (isEditing) {
                    await Network.updateNetwork(id, network)
                    showSnackbar(t('saved_network_successfully'))
                } else {
                    await Network.addNetwork(network)
                    showSnackbar(t('adding_network_successfully'))
                }
                navigate(-1)
                queryClient.invalidateQueries(QUERY_KEY)
            } catch (err) {
                checkZodError((err as Error).message)
                showSnackbar(t('failed_to_save_network'))
            }
            setIsSubmitting(false)
        },
    })

    const [isChecking, setIsChecking] = useState(false)
    // Discard currencySymbol warning
    const isValid = isFormValid || (!!errors.currencySymbol && Object.keys(omit(errors, 'currencySymbol')).length === 0)
    const isNotReady = isValidating || (!isValidating && !isValid) || !isDirty || isChecking
    const disabled = isNotReady || isMutating || isSubmitting

    // currency symbol error is tolerable,
    // but react-hook-form's handleSubmit can't tolerate it
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
            <form className={classes.form}>
                <Typography className={classes.label}>{t('network_name')}</Typography>
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
                {errors.name ? <Typography className={classes.error}>{errors.name.message}</Typography> : null}

                <Typography className={classes.label}>{t('rpc_url')}</Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.rpc}
                    {...register('rpc')}
                    placeholder="https://"
                    disabled={isBuiltIn}
                />
                {errors.rpc ? <Typography className={classes.error}>{errors.rpc.message}</Typography> : null}

                <Typography className={classes.label}>{t('chain_id')}</Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.chainId}
                    {...register('chainId')}
                    placeholder="eg. 2"
                    disabled={isBuiltIn}
                />
                {errors.chainId ? <Typography className={classes.error}>{errors.chainId.message}</Typography> : null}

                <Typography className={classes.label}>{t('optional_currency_symbol')}</Typography>
                <Input
                    fullWidth
                    disableUnderline
                    error={!!errors.currencySymbol}
                    {...register('currencySymbol', { required: false })}
                    placeholder="eg. ETH"
                    disabled={isBuiltIn || !!errors.chainId}
                />
                {errors.currencySymbol ? (
                    <Typography className={classes.warn}>{errors.currencySymbol.message}</Typography>
                ) : null}

                <Typography className={classes.label}>{t('optional_block_explorer_url')}</Typography>
                <Input
                    fullWidth
                    disableUnderline
                    {...register('explorer')}
                    placeholder="https://"
                    disabled={isBuiltIn}
                />
                {errors.explorer ? <Typography className={classes.error}>{errors.explorer.message}</Typography> : null}
            </form>
            {!isBuiltIn ? (
                <div className={classes.footer}>
                    <ActionButton fullWidth variant="outlined" onClick={() => navigate(-1)}>
                        {t('cancel')}
                    </ActionButton>
                    <ActionButton fullWidth onClick={handleSubmit} disabled={disabled}>
                        {t('confirm')}
                    </ActionButton>
                </div>
            ) : null}
        </main>
    )
})
