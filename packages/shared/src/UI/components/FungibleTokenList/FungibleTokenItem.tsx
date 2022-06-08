import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { formatBalance, FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { TokenIcon } from '../TokenIcon'
import { LoadingIcon } from '@masknet/icons'
import type { MaskSearchableListItemProps } from '@masknet/theme'
import { makeStyles, MaskLoadingButton } from '@masknet/theme'
import { useSharedI18N } from '../../../locales'
import { LoadingAnimation } from '../LoadingAnimation'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    list: {
        maxHeight: '100%',
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1),
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
        display: 'block',
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
}))

export const getFungibleTokenItem =
    <T extends NetworkPluginID>(
        account: string,
        getSource: (address: string) => 'personal' | 'official' | 'external',
        getBalance: (address: string) => string,
        isSelected: (address: string) => boolean,
        isLoading: (address: string) => boolean,
        importToken: (
            token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        ) => Promise<void>,
    ) =>
    ({
        data: token,
        onSelect,
    }: MaskSearchableListItemProps<
        FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >) => {
        const t = useSharedI18N()
        const { classes } = useStyles()

        if (!token) return null
        const { address, name, symbol, decimals, logoURL } = token

        const { source, balance, selected, loading } = useMemo(() => {
            return {
                source: getSource(address),
                balance: getBalance(address),
                selected: isSelected(address),
                loading: isLoading(address),
            }
        }, [address, getSource, getBalance, isSelected, isLoading])

        const onImport = useCallback(
            async (event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                if (token) importToken(token)
            },
            [token, importToken],
        )

        const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            onSelect(token)
        }

        const action = useMemo(() => {
            return source !== 'external' ? (
                <span>
                    {loading ? (
                        <LoadingAnimation />
                    ) : (
                        Number.parseFloat(new BigNumber(formatBalance(balance ?? 0, decimals, 6)).toFixed(6))
                    )}
                </span>
            ) : (
                <MaskLoadingButton
                    variant="contained"
                    color="primary"
                    onClick={onImport}
                    size="small"
                    className={classes.importButton}
                    soloLoading
                    loadingIndicator={<LoadingIcon sx={{ fontSize: 14 }} />}>
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
                disabled={selected}>
                <ListItemIcon>
                    <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURI={logoURL} />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.text }}>
                    <Typography
                        className={classNames(classes.primary, source === 'external' ? classes.import : '')}
                        color="textPrimary"
                        component="span">
                        <span className={classes.symbol}>{symbol}</span>
                        <span className={`${classes.name} dashboard token-list-symbol`}>
                            {name}
                            {source === 'personal' && <span> &bull; Added By User</span>}
                        </span>
                    </Typography>
                    <Typography sx={{ fontSize: 16 }} color="textSecondary" component="span">
                        {action}
                    </Typography>
                </ListItemText>
            </ListItem>
        )
    }
