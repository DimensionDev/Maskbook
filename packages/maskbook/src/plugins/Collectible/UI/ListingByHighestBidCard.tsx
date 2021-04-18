import { useState, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { createStyles, makeStyles, Card, CardContent, CardActions } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/UI/SelectTokenAmountPanel'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useTokenWatched } from '../../../web3/hooks/useTokenWatched'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import { DateTimePanel } from '../../../web3/UI/DateTimePanel'

const useStyles = makeStyles((theme) => {
    return createStyles({
        content: {},
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },
        panel: {
            marginTop: theme.spacing(2),
            '&:first-child': {
                marginTop: 0,
            },
        },
        label: {},
        button: {
            marginTop: theme.spacing(1.5),
        },
    })
})

export interface ListingByHighestBidCardProps {
    onChange: () => void
}

export function ListingByHighestBidCard(props: ListingByHighestBidCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const [expirationDateTime, setExpirationDateTime] = useState(new Date())
    const { amount, token, balance, setAmount, setToken } = useTokenWatched()

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount || '0').isZero()) return 'Enter a price'
        return ''
    }, [amount])

    return (
        <Card elevation={0}>
            <CardContent>
                <SelectTokenAmountPanel
                    amount={amount}
                    balance={balance.value ?? '0'}
                    onAmountChange={setAmount}
                    token={token as EtherTokenDetailed | ERC20TokenDetailed}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        classes: {
                            root: classes.panel,
                        },
                        label: 'Minimum Bid',
                        TextFieldProps: {
                            helperText: 'Set your starting bid price.',
                        },
                    }}
                />
                <SelectTokenAmountPanel
                    amount={amount}
                    balance={balance.value ?? '0'}
                    onAmountChange={setAmount}
                    token={token as EtherTokenDetailed | ERC20TokenDetailed}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        classes: {
                            root: classes.panel,
                        },
                        disableToken: true,
                        disableBalance: true,
                        label: 'Reserve Price',
                        TextFieldProps: {
                            helperText: 'Create a hidden limit by setting a reserve price.',
                        },
                    }}
                />
                <DateTimePanel
                    label="Expiration Date"
                    date={expirationDateTime}
                    onChange={setExpirationDateTime}
                    TextFieldProps={{
                        className: classes.panel,
                        helperText:
                            'Your auction will automatically end at this time and the highest bidder will win. No need to cancel it!',
                    }}
                />
            </CardContent>
            <CardActions className={classes.footer}>
                <EthereumWalletConnectedBoundary>
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        disabled={!!validationMessage}
                        fullWidth
                        size="large"
                        init={validationMessage || t('plugin_collectible_post_listing')}
                        waiting={t('plugin_collectible_post_listing')}
                        complete={t('plugin_collectible_done')}
                        failed={t('plugin_collectible_retry')}
                        executor={async () => {}}
                        completeOnClick={() => setAmount('')}
                        failedOnClick="use executor"
                    />
                </EthereumWalletConnectedBoundary>
            </CardActions>
        </Card>
    )
}
