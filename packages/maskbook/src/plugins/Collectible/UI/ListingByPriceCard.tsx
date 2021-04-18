import { ChangeEvent, useState, useMemo } from 'react'
import {
    createStyles,
    makeStyles,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    TextField,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/UI/SelectTokenAmountPanel'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useTokenWatched } from '../../../web3/hooks/useTokenWatched'
import BigNumber from 'bignumber.js'
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
        label: {
            marginTop: theme.spacing(1.5),
        },
        caption: {
            fontSize: 11,
        },
        button: {
            marginTop: theme.spacing(1.5),
        },
    })
})

export interface ListingByPriceCardProps {
    onChange: () => void
}

export function ListingByPriceCard(props: ListingByPriceCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const [scheduleDateTime, setScheduleDateTime] = useState(new Date())
    const { amount, token, balance, setAmount, setToken } = useTokenWatched()

    const [endingPriceChecked, setEndingPriceChecked] = useState(false)
    const [futureTimeChecked, setFutureTimeChecked] = useState(false)
    const [privacyChecked, setPrivacyChecked] = useState(false)

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
                    token={token.value as EtherTokenDetailed | ERC20TokenDetailed}
                    onTokenChange={setToken}
                    TokenAmountPanelProps={{
                        label: endingPriceChecked ? 'Starting Price' : 'Price',
                        TextFieldProps: {
                            classes: {
                                root: classes.panel,
                            },
                            helperText: endingPriceChecked
                                ? 'Set an initial price.'
                                : 'Will be on sale until you transfer this item or cancel it.',
                        },
                    }}
                />
                {endingPriceChecked ? (
                    <SelectTokenAmountPanel
                        amount={amount}
                        balance={balance.value ?? '0'}
                        onAmountChange={setAmount}
                        token={token.value as EtherTokenDetailed | ERC20TokenDetailed}
                        onTokenChange={setToken}
                        TokenAmountPanelProps={{
                            label: 'Ending Price',
                            disableToken: true,
                            disableBalance: true,
                            TextFieldProps: {
                                classes: {
                                    root: classes.panel,
                                },
                                helperText:
                                    'Must be less than or equal to the starting price. The price will progress linearly to this amount until the expiration date.',
                            },
                        }}
                    />
                ) : null}
                {futureTimeChecked ? (
                    <DateTimePanel
                        label="Schedule Date"
                        date={scheduleDateTime}
                        onChange={setScheduleDateTime}
                        TextFieldProps={{
                            className: classes.panel,
                            helperText: 'Schedule a future date.',
                        }}
                    />
                ) : null}
                {privacyChecked ? (
                    <TextField
                        className={classes.panel}
                        fullWidth
                        variant="outlined"
                        label="Buyer Address"
                        placeholder="Enter the buyer's address."
                        helperText="Only the buyer is allowed to buy it."
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                ) : null}
                <Box sx={{ padding: 2, paddingBottom: 0 }}>
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={endingPriceChecked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                    setEndingPriceChecked(ev.target.checked)
                                }
                            />
                        }
                        label={
                            <>
                                <Typography>Include ending price</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    Adding an ending price will allow this listing to expire, or for the price to be
                                    reduced until a buyer is found.
                                </Typography>
                            </>
                        }
                    />
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={futureTimeChecked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                    setFutureTimeChecked(ev.target.checked)
                                }
                            />
                        }
                        label={
                            <>
                                <Typography>Schedule for a future time</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    You can schedule this listing to only be buyable at a future data.
                                </Typography>
                            </>
                        }
                    />
                    <FormControlLabel
                        className={classes.label}
                        control={
                            <Checkbox
                                color="primary"
                                checked={privacyChecked}
                                onChange={(ev: ChangeEvent<HTMLInputElement>) => setPrivacyChecked(ev.target.checked)}
                            />
                        }
                        label={
                            <>
                                <Typography>Privacy</Typography>
                                <Typography className={classes.caption} color="textSecondary" variant="body2">
                                    You can keep your listing public, or you can specify one address that's allowed to
                                    buy it.
                                </Typography>
                            </>
                        }
                    />
                </Box>
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
