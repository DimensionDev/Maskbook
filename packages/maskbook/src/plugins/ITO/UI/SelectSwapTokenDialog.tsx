import { makeStyles, createStyles, ListItem, List } from '@material-ui/core'
import { DialogContent, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { getSupportTokenInfo } from './ITO'
import { useChainId } from '../../../web3/hooks/useChainState'
import { formatEthereumAddress } from '../../../plugins/Wallet/formatter'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

const useStyles = makeStyles((theme) =>
    createStyles({
        listItem: {
            display: 'flex',
            alignItems: 'center',
        },
        symbol: {
            marginLeft: theme.spacing(3),
            fontSize: 16,
            flexGrow: 1,
            fontWeight: 400,
        },
        address: {
            color: '#D9D9D9',
            fontSize: 14,
        },
        link: {
            marginLeft: theme.spacing(1),
            width: 16,
            height: 16,
        },
    }),
)

export interface SelectSwapTokenProps extends withClasses<'root'> {
    open: boolean
    onClose: () => void
    onSelect: (token: EtherTokenDetailed | ERC20TokenDetailed) => void
    exchangeTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
    DialogProps?: Partial<DialogProps>
}

export function SelectSwapTokenDialog(props: SelectSwapTokenProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const chainId = useChainId()
    const { tokenIconListTable } = getSupportTokenInfo(chainId)
    return (
        <>
            <InjectedDialog
                open={props.open}
                title={t('plugin_ito_dialog_claim_select_token_dialog_title')}
                DialogProps={{ maxWidth: 'xs' }}
                onClose={props.onClose}>
                <DialogContent>
                    <List>
                        {props.exchangeTokens.map((t, i) => {
                            const TokenIcon = tokenIconListTable[t.address.toLowerCase()]

                            return TokenIcon ? (
                                <ListItem button className={classes.listItem} onClick={() => props.onSelect(t)}>
                                    <TokenIcon size={32} />
                                    <span className={classes.symbol}>{t.symbol}</span>
                                    <span className={classes.address}>{formatEthereumAddress(t.address, 6)}</span>
                                    <OpenInNewIcon fontSize="small" className={classes.link} />
                                </ListItem>
                            ) : null
                        })}
                    </List>
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
