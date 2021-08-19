import { memo, useCallback } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext'
import { FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { getTokenUSDValue } from '../../../../../plugins/Wallet/helpers'
import { ArrowDownCircle, ArrowUpCircle } from 'react-feather'
import { InteractionCircleIcon } from '@masknet/icons'
import { useI18N } from '../../../../../utils'
import { useHistory } from 'react-router'
import { PopupRoutes } from '../../../index'

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
    const history = useHistory()
    const { currentToken } = useContainer(WalletContext)

    const openLabPage = useCallback(() => {
        browser.windows.create({
            url: browser.runtime.getURL('/next.html#/labs'),
        })
    }, [])

    if (!currentToken) return null

    return (
        <>
            <div className={classes.content}>
                <TokenIcon
                    classes={{ icon: classes.tokenIcon }}
                    address={currentToken.token.address}
                    name={currentToken.token.name}
                    chainId={currentToken.token.chainId}
                    logoURI={currentToken.token.logoURI}
                    AvatarProps={{ sx: { width: 24, height: 24 } }}
                />
                <Typography className={classes.balance}>
                    <FormattedBalance
                        value={currentToken.balance}
                        decimals={currentToken.token.decimals}
                        symbol={currentToken.token.symbol}
                    />
                </Typography>
                <Typography className={classes.text}>
                    <FormattedCurrency value={getTokenUSDValue(currentToken).toFixed(2)} sign="$" />
                </Typography>
                <div className={classes.controller}>
                    <div onClick={openLabPage}>
                        <ArrowDownCircle className={classes.icon} />
                        <Typography className={classes.text}>{t('popups_wallet_token_buy')}</Typography>
                    </div>
                    <div onClick={() => history.push(PopupRoutes.Transfer)}>
                        <ArrowUpCircle className={classes.icon} />
                        <Typography className={classes.text}>{t('popups_wallet_token_send')}</Typography>
                    </div>
                    <div onClick={openLabPage}>
                        <InteractionCircleIcon className={classes.icon} />
                        <Typography className={classes.text}>{t('popups_wallet_token_swap')}</Typography>
                    </div>
                </div>
            </div>
        </>
    )
})

export default TokenDetail
