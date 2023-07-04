import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import { type ChainId, isNativeTokenAddress, type SchemaType } from '@masknet/web3-shared-evm'
import { PopupRoutes } from '@masknet/shared-base'
import { List, ListItem, ListItemText, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { TokenIcon, FormattedBalance } from '@masknet/shared'
import { WalletContext } from '../../hooks/useWalletContext.js'
import { isNaN } from 'lodash-es'
import { formatBalance, type FungibleAsset, isGreaterThanOrEqualTo, isLessThan } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
    },
    item: {
        padding: 14,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    tokenIcon: {
        width: 20,
        height: 20,
    },
    text: {
        margin: '0 0 0 15px',
    },
    symbol: {
        color: '#1C68F3',
        fontSize: 14,
    },
    balance: {
        fontSize: 14,
    },
    more: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gas: 6,
        textAlign: 'center',
        padding: 12,
        cursor: 'pointer',
        backgroundColor: theme.palette.maskColor.white,
    },
}))

type Asset = FungibleAsset<ChainId, SchemaType>

export const AssetsList = memo(function AssetsList() {
    const navigate = useNavigate()
    const { assets, setCurrentToken } = useContainer(WalletContext)
    const [isExpand, setIsExpand] = useState(false)
    const onItemClick = useCallback((asset: Asset) => {
        setCurrentToken(asset)
        navigate(PopupRoutes.TokenDetail)
    }, [])
    const onSwitch = useCallback(() => setIsExpand((x) => !x), [])
    return (
        <>
            <AssetsListUI isExpand={isExpand} dataSource={assets} onItemClick={onItemClick} />
            <MoreBarUI isExpand={isExpand} dataSource={assets} onClick={onSwitch} />
        </>
    )
})

export interface MoreBarUIProps {
    isExpand: boolean
    dataSource: Asset[]
    onClick: () => void
}

export const MoreBarUI = memo<MoreBarUIProps>(({ isExpand, dataSource, onClick }) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const hasLowValueToken = !!dataSource.find(
        (x) => !isNativeTokenAddress(x.address) && isLessThan(x.value?.usd ?? 0, 1),
    )
    if (!hasLowValueToken) return null
    if (isExpand)
        return (
            <Typography className={classes.more} onClick={onClick}>
                <span>{t('popups_wallet_more_collapse')}</span>
                <Icons.ArrowDrop style={{ transform: 'rotate(180deg)' }} />
            </Typography>
        )
    return (
        <Typography className={classes.more} onClick={onClick}>
            <span>{t('popups_wallet_more_expand')}</span>
            <Icons.ArrowDrop />
        </Typography>
    )
})

export interface AssetsListUIProps {
    isExpand: boolean
    dataSource: Asset[]
    onItemClick: (token: Asset) => void
}

export const AssetsListUI = memo<AssetsListUIProps>(function AssetsListUI({ isExpand, dataSource, onItemClick }) {
    const { classes } = useStyles()
    const list = dataSource.filter(
        (asset) => isExpand || isNativeTokenAddress(asset.address) || isGreaterThanOrEqualTo(asset.value?.usd ?? 0, 1),
    )
    return (
        <List dense className={classes.list}>
            {list.map((asset, index) => {
                return (
                    <ListItem key={index} className={classes.item} onClick={() => onItemClick(asset)}>
                        <TokenIcon
                            className={classes.tokenIcon}
                            address={asset.address}
                            name={asset.name}
                            chainId={asset.chainId}
                            logoURL={asset.logoURL}
                            AvatarProps={{ sx: { width: 20, height: 20 } }}
                        />
                        <ListItemText className={classes.text}>
                            <FormattedBalance
                                classes={{ symbol: classes.symbol, balance: classes.balance }}
                                value={isNaN(asset.balance) ? 0 : asset.balance}
                                decimals={isNaN(asset.decimals) ? 0 : asset.decimals}
                                symbol={asset.symbol}
                                significant={6}
                                formatter={formatBalance}
                            />
                        </ListItemText>
                        <Icons.ArrowRight size={20} color="#15181B" />
                    </ListItem>
                )
            })}
        </List>
    )
})
