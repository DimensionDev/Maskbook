import { ChangeEvent, useState, useCallback, useMemo } from 'react'
import {
    createStyles,
    makeStyles,
    DialogContent,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    Link,
} from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { UnreviewedWarning } from './UnreviewedWarning'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ActionButtonPromise } from '../../../extension/options-page/DashboardComponents/ActionButton'
import { SelectTokenAmountPanel } from '../../ITO/UI/SelectTokenAmountPanel'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { ChainState } from '../../../web3/state/useChainState'
import { useTokenWatched } from '../../../web3/hooks/useTokenWatched'
import { useRemoteControlledDialogEvent } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginCollectibleMessage } from '../messages'
import BigNumber from 'bignumber.js'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'

const useStyles = makeStyles((theme) => {
    return createStyles({
        content: {},
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },

        label: {},
        button: {
            marginTop: theme.spacing(1.5),
        },
    })
})

export interface MakeAnOfferTabProps {}

export function MakeAnOfferTab(props: MakeAnOfferTabProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const { chainId } = ChainState.useContainer()

    const { open, onClose } = useRemoteControlledDialogEvent(PluginCollectibleMessage.events.makeOfferDialogEvent)

    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)

    const { amount, token, balance, setAmount, setToken } = useTokenWatched()

    const onMakeAnOffer = useCallback(async () => {}, [])

    const validationMessage = useMemo(() => {
        if (new BigNumber(amount || '0').isZero()) return 'Enter a price'
        return ''
    }, [amount])

    return (
        <InjectedDialog title="Make an Offer" open={open} onClose={onClose} DialogProps={{ maxWidth: 'md' }}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <Box sx={{ marginBottom: 2 }}>
                            <UnreviewedWarning />
                        </Box>
                        <SelectTokenAmountPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            onAmountChange={setAmount}
                            token={token as EtherTokenDetailed | ERC20TokenDetailed}
                            onTokenChange={setToken}
                            TokenAmountPanelProps={{
                                label: 'Price',
                            }}
                        />
                        <Box sx={{ padding: 2, paddingBottom: 0 }}>
                            <FormControlLabel
                                className={classes.label}
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={unreviewedChecked}
                                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                            setUnreviewedChecked(ev.target.checked)
                                        }
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        By checking this box, I acknowledge that this item has not been reviewd or
                                        approved by OpenSea.
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                className={classes.label}
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={ToS_Checked}
                                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                            setToS_Checked(ev.target.checked)
                                        }
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        By checking this box, I agree to OpenSea's{' '}
                                        <Link color="primary" target="_blank" rel="noopener noreferrer">
                                            Terms of Service
                                        </Link>
                                        .
                                    </Typography>
                                }
                            />
                        </Box>
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <EthereumWalletConnectedBoundary>
                            <ActionButtonPromise
                                className={classes.button}
                                variant="contained"
                                disabled={!!validationMessage || !unreviewedChecked || !ToS_Checked}
                                fullWidth
                                size="large"
                                init={validationMessage || t('plugin_collectible_make_offer')}
                                waiting={t('plugin_collectible_make_offer')}
                                complete={t('plugin_collectible_done')}
                                failed={t('plugin_collectible_retry')}
                                executor={onMakeAnOffer}
                                completeOnClick={() => setAmount('')}
                                failedOnClick="use executor"
                            />
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
