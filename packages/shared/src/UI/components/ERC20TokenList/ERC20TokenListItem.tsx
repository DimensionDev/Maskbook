import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import classNames from 'classnames'
import {
    Asset,
    ERC20TokenDetailed,
    formatBalance,
    FungibleTokenDetailed,
    isSameAddress,
    useAddERC20TokenCallback,
} from '@masknet/web3-shared-evm'
import { TokenIcon } from '../TokenIcon'
import type { MaskSearchableListItemProps } from '@masknet/theme'
import { makeStyles, MaskLoadingButton } from '@masknet/theme'
import { some } from 'lodash-unified'
import { useCallback, useMemo } from 'react'
import { LoadingIcon } from '@masknet/icons'
import { useSharedI18N } from '../../../locales'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    list: {
        maxHeight: '100%',
        paddingLeft: theme.spacing(1),
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
        fontSize: 12,
    },
    secondary: {
        fontSize: 14,
        textAlign: 'right',
    },
    symbol: {
        lineHeight: '20px',
        fontSize: 14,
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
            background: 'rgba(250, 250, 250, 0.3)',
        },
    },
}))

export const getERC20TokenListItem =
    (
        addedTokens: FungibleTokenDetailed[],
        externalTokens: FungibleTokenDetailed[],
        info: {
            from: 'search' | 'defaultList'
            inList: boolean
        },
        account?: string,
    ) =>
    ({ data, onSelect }: MaskSearchableListItemProps<Asset>) => {
        const t = useSharedI18N()
        const { classes } = useStyles()
        const [, addERC20Token] = useAddERC20TokenCallback()
        const token = data.token

        if (!token) return null
        const { address, name, symbol, logoURI } = token
        const isNotAdded = some(externalTokens, (t: any) => isSameAddress(address, t.address))
        const isAdded = some(addedTokens, (t: any) => isSameAddress(address, t.address))

        const onImport = useCallback(
            async (event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                if (!token || !account) return
                await addERC20Token(token as ERC20TokenDetailed)
            },
            [token, account],
        )

        const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            onSelect(data)
        }

        const action = useMemo(() => {
            return !isNotAdded || isAdded || (info.inList && info.from === 'search') ? (
                <span>{data.balance ? formatBalance(data.balance, token.decimals, 6) : ''}</span>
            ) : (
                <MaskLoadingButton
                    variant="rounded"
                    color="primary"
                    onClick={onImport}
                    size="small"
                    soloLoading
                    loadingIndicator={<LoadingIcon sx={{ fontSize: 16 }} />}>
                    {t.import()}
                </MaskLoadingButton>
            )
        }, [info, isNotAdded, isAdded])

        return (
            <ListItem button className={classes.list} onClick={handleTokenSelect}>
                <ListItemIcon>
                    <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURI={logoURI} />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.text }}>
                    <Typography
                        className={classNames(classes.primary, isNotAdded ? classes.import : '')}
                        color="textPrimary"
                        component="span">
                        <span className={classes.symbol}>{symbol}</span>
                        <span className={classes.name}>
                            {name}
                            {isAdded && <span> • Added By User</span>}
                        </span>
                    </Typography>
                    <Typography sx={{ fontSize: 14 }} color="textSecondary" component="span">
                        {action}
                    </Typography>
                </ListItemText>
            </ListItem>
        )
    }
