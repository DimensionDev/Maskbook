import { memo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { ArrowDownCircle, ArrowUpCircle } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext'
import { FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { getTokenUSDValue } from '../../../../../plugins/Wallet/helpers'
import { InteractionCircleIcon } from '@masknet/icons'
import { useI18N } from '../../../../../utils'
import { PluginTransakMessages } from '../../../../../plugins/Transak/messages'
import Services from '../../../../service'
import { compact, intersectionWith } from 'lodash-unified'
import urlcat from 'urlcat'
import { ActivityList } from '../components/ActivityList'
import { openWindow } from '@masknet/shared-base-ui'
import { useTitle } from '../../../hook/useTitle'
import { formatBalance, formatCurrency, isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { useNativeToken, useWallet } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()({
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 18,
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
    },
    balance: {
        fontSize: 14,
        lineHeight: '20px',
        color: '#1C68F3',
        fontWeight: 600,
    },
    text: {
        fontSize: 12,
        lineHeight: 1,
        color: '#7B8192',
    },
    controller: {
        display: 'grid',
        justifyContent: 'center',
        gap: 20,
        gridTemplateColumns: 'repeat(3,1fr)',
        marginTop: 20,
        '& > *': {
            textAlign: 'center',
            cursor: 'pointer',
        },
    },
    icon: {
        stroke: '#1C68F3',
        fill: 'none',
    },
})

const TokenDetail = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const navigate = useNavigate()
    const { currentToken } = useContainer(WalletContext)
    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)

    const { value: isActiveSocialNetwork } = useAsync(async () => {
        const urls = compact((await browser.tabs.query({ active: true })).map((tab) => tab.url))
        const definedSocialNetworkUrls = (await Services.SocialNetwork.getSupportedSites()).map(
            ({ networkIdentifier }) => networkIdentifier,
        )

        return !!intersectionWith(urls, definedSocialNetworkUrls, (a, b) => a.includes(b)).length
    }, [])

    const openBuyDialog = useCallback(async () => {
        if (isActiveSocialNetwork) {
            PluginTransakMessages.buyTokenDialogUpdated.sendToVisiblePages({
                open: true,
                address: wallet?.address ?? '',
                code: currentToken?.symbol ?? currentToken?.name,
            })
        } else {
            const url = urlcat('dashboard.html#', 'labs', {
                open: 'Transak',
                code: currentToken?.symbol ?? currentToken?.name,
            })
            openWindow(browser.runtime.getURL(url), 'BUY_DIALOG')
        }
    }, [wallet?.address, isActiveSocialNetwork, currentToken])

    const openSwapDialog = useCallback(async () => {
        const url = urlcat(
            'popups.html#/',
            PopupRoutes.Swap,
            !isSameAddress(nativeToken?.address, currentToken?.address)
                ? {
                      id: currentToken?.address,
                      name: currentToken?.name,
                      symbol: currentToken?.symbol,
                      contract_address: currentToken?.address,
                      decimals: currentToken?.decimals,
                  }
                : {},
        )
        openWindow(browser.runtime.getURL(url), 'SWAP_DIALOG')
    }, [currentToken, nativeToken])

    useTitle(t('popups_assets'))

    if (!currentToken) return null

    return (
        <>
            <div className={classes.content}>
                <TokenIcon
                    classes={{ icon: classes.tokenIcon }}
                    address={currentToken.address}
                    name={currentToken.name}
                    chainId={currentToken.chainId}
                    logoURL={currentToken.logoURL}
                    AvatarProps={{ sx: { width: 24, height: 24 } }}
                />
                <Typography className={classes.balance}>
                    <FormattedBalance
                        value={currentToken.balance}
                        decimals={currentToken.decimals}
                        symbol={currentToken.symbol}
                        significant={4}
                        formatter={formatBalance}
                    />
                </Typography>
                <Typography className={classes.text}>
                    <FormattedCurrency value={getTokenUSDValue(currentToken)} sign="$" formatter={formatCurrency} />
                </Typography>
                <div className={classes.controller}>
                    <div onClick={openBuyDialog}>
                        <ArrowDownCircle className={classes.icon} />
                        <Typography className={classes.text}>{t('popups_wallet_token_buy')}</Typography>
                    </div>
                    <div onClick={() => navigate(PopupRoutes.Transfer)}>
                        <ArrowUpCircle className={classes.icon} />
                        <Typography className={classes.text}>{t('popups_wallet_token_send')}</Typography>
                    </div>
                    <div onClick={openSwapDialog}>
                        <InteractionCircleIcon className={classes.icon} />
                        <Typography className={classes.text}>{t('popups_wallet_token_swap')}</Typography>
                    </div>
                </div>
            </div>
            <ActivityList tokenAddress={currentToken.address} />
        </>
    )
})

export default TokenDetail
