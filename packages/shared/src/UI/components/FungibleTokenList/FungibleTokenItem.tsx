import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Link, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { formatBalance, FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { TokenIcon } from '../TokenIcon'
import { Icons } from '@masknet/icons'
import { makeStyles, MaskLoadingButton, MaskSearchableListItemProps, LoadingBase } from '@masknet/theme'
import { useSharedI18N } from '../../../locales'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { TokenListMode } from './type'
import { SettingSwitch } from '../SettingSwitch'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    list: {
        maxHeight: '100%',
        height: 'calc(100% - 16px)',
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        borderRadius: theme.spacing(1),
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        '&:hover': {
            background: theme.palette.maskColor.bg,
        },
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    primary: {
        flex: 1,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        paddingRight: theme.spacing(1),
    },
    name: {
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        lineHeight: '20px',
        fontSize: 16,
        // TODO: Should align dashboard and twitter theme in common component, depend twitter theme
        color: theme.palette.mode === 'dark' ? '#6E767D' : '#536471',
    },
    symbol: {
        lineHeight: '20px',
        fontSize: 16,
    },
    import: {
        '&:before': {
            content: '""',
            display: 'inline-block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
        },
    },
    importButton: {
        padding: '3px 0',
        borderRadius: 15,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
    },
    action: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    switch: {
        position: 'relative',
        left: theme.spacing(1),
    },
}))

export const getFungibleTokenItem =
    <T extends NetworkPluginID>(
        getSource: (address: string) => 'personal' | 'official' | 'external',
        getBalance: (address: string) => string,
        isSelected: (address: string) => boolean,
        isLoading: (address: string) => boolean,
        mode: TokenListMode,
        addOrRemoveTokenToLocal: (
            token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
            strategy: 'add' | 'remove',
        ) => Promise<void>,
        trustOrBlockTokenToLocal: (
            token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
            strategy: 'trust' | 'block',
        ) => Promise<void>,
        isBlocked: (address: string) => boolean,
    ) =>
    ({
        data: token,
        onSelect,
    }: MaskSearchableListItemProps<
        FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >) => {
        const t = useSharedI18N()
        const { classes } = useStyles()
        const { Others } = useWeb3State()

        if (!token) return null
        const { chainId, address, name, symbol, decimals, logoURL } = token

        const { source, balance, selected, loading } = useMemo(() => {
            return {
                source: getSource(address),
                balance: getBalance(address),
                selected: isSelected(address),
                loading: isLoading(address),
            }
        }, [address, getSource, getBalance, isSelected, isLoading])

        const onAddOrRemoveTokenToLocal = useCallback(
            async (event: React.MouseEvent<HTMLButtonElement | HTMLElement>, strategy: 'add' | 'remove') => {
                event.stopPropagation()
                if (token) addOrRemoveTokenToLocal(token, strategy)
            },
            [token, addOrRemoveTokenToLocal],
        )

        const onTrustOrBlockTokenToLocal = useCallback(
            async (event: React.ChangeEvent<HTMLInputElement>) => {
                event.stopPropagation()
                if (token) trustOrBlockTokenToLocal(token, event.target.checked ? 'trust' : 'block')
            },
            [token, trustOrBlockTokenToLocal],
        )

        const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            e.preventDefault()
            if (mode === TokenListMode.List) {
                onSelect(token)
            }
        }

        const explorerLink = useMemo(() => {
            return Others?.explorerResolver.fungibleTokenLink(token.chainId, token.address)
        }, [token.address, token.chainId, Others?.explorerResolver.fungibleTokenLink])

        const action = useMemo(() => {
            if (mode === TokenListMode.Manage) {
                if (source === 'personal')
                    return <Icons.TrashLine onClick={(e) => onAddOrRemoveTokenToLocal(e, 'remove')} size={24} />
                return (
                    <SettingSwitch
                        classes={{ root: classes.switch }}
                        onClick={(event) => {
                            event.stopPropagation()
                            event.preventDefault()
                        }}
                        size="small"
                        checked={!isBlocked(address)}
                        onChange={(event) => {
                            event.stopPropagation()
                            event.preventDefault()
                            onTrustOrBlockTokenToLocal(event)
                        }}
                    />
                )
            }
            return source !== 'external' ? (
                <Typography fontSize="16" fontWeight={700} color={(t) => t.palette.maskColor.main}>
                    {loading ? (
                        <LoadingBase size={24} />
                    ) : (
                        Number.parseFloat(new BigNumber(formatBalance(balance ?? 0, decimals, 6)).toFixed(6))
                    )}
                </Typography>
            ) : (
                <MaskLoadingButton
                    variant="contained"
                    color="primary"
                    onClick={(e) => onAddOrRemoveTokenToLocal(e, 'add')}
                    size="small"
                    className={classes.importButton}
                    soloLoading
                    loadingIndicator={<Icons.CircleLoading size={14} />}>
                    {t.import()}
                </MaskLoadingButton>
            )
        }, [balance, decimals, loading])

        return (
            <ListItem
                title={address}
                key={address}
                button
                className={`${classes.list} dashboard token-list`}
                onClick={handleTokenSelect}
                disabled={selected && mode === TokenListMode.List}>
                <ListItemIcon>
                    <TokenIcon
                        classes={{ icon: classes.icon }}
                        chainId={chainId}
                        address={address}
                        name={name}
                        logoURL={logoURL}
                    />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.text }}>
                    <Typography
                        className={classNames(classes.primary, source === 'external' ? classes.import : '')}
                        color="textPrimary"
                        component="span">
                        <span className={classes.symbol}>{symbol}</span>
                        <span className={`${classes.name} dashboard token-list-symbol`}>
                            {name}
                            <Link
                                onClick={(event) => event.stopPropagation()}
                                href={explorerLink}
                                style={{ width: 18, height: 18 }}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.PopupLink size={18} />
                            </Link>
                            {source === 'personal' && <span> &bull; Added By User</span>}
                        </span>
                    </Typography>
                    <Typography className={classes.action} sx={{ fontSize: 16 }} color="textSecondary" component="span">
                        {action}
                    </Typography>
                </ListItemText>
            </ListItem>
        )
    }
