import { Typography, Link, Checkbox, makeStyles, createStyles, FormControlLabel, Box } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import classNames from 'classnames'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { formatEthereumAddress } from '../../Wallet/formatter'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import type { ChainId } from '../../../web3/types'
import { ClaimStatus } from './ClaimGuide'
import { useState } from 'react'

const useStyles = makeStyles((theme) =>
    createStyles({
        reminderText: {
            color: '#FF5555',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
        },
        reminderTextLast: {
            marginBottom: 0,
        },
        docBox: {
            height: 300,
            overflow: "scroll",
        },
        center: {
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
        },
        bold: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(2),
            padding: '1rem 2rem',
            background: theme.palette.mode === 'dark' ? '#17191D' : '#F7F9FA',
            borderRadius: 15,
        },
        tokenIcon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 39,
            height: 39,
        },
        tokenTextWrapper: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 45,
            marginLeft: '1rem',
        },
        tokenSymbol: {
            color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
            fontSize: 18,
            cursor: 'default',
        },
        tokenLink: {
            color: '#6F767C',
            fontSize: 15,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        comfirmWrapper: {
            marginTop: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
        },
        comfirmText: {
            color: '#6F767C',
        },
        button: {
            width: 'fit-content',
            margin: '0 auto',
            padding: '6px 48px',
        },
        table: {
            border: '1px solid #FF5555',
            color: '#FF5555',
        },
        cell: {
            width: '50%',
            border: '1px solid #FF5555',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        },
        moreCell: {
            flexDirection: 'column'
        },
        column: {
            width: '100%',
            display: 'flex',
        },
        lowSpacing: {
            marginTop: 4,
            marginBottom: 4,
        }
    }),
)

export interface RemindDialogProps extends withClasses<'root'> {
    token: EtherTokenDetailed | ERC20TokenDetailed
    chainId: ChainId
    setStatus: React.Dispatch<React.SetStateAction<ClaimStatus>>
    isMask: boolean
}

export function RemindDialog(props: RemindDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const { token, chainId, setStatus, isMask } = props

    const [agreeReminder, setAgreeReminder] = useState(false)

    return (
        <>
            {!isMask ?
                <Box className={classes.docBox}>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text1')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text2')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.center)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text3')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.center)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text4')}
                    </Typography>
                    <Box className={classes.table}>
                        <Box className={classes.column}>
                            <Box className={classes.cell}>
                                <Typography variant="body1" className={classNames(classes.reminderText)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text1')}</Typography>
                            </Box>
                            <Box className={classes.cell}></Box>
                        </Box>
                        <Box className={classes.column}>
                            <Box className={classes.cell}>
                                <Typography variant="body1" className={classNames(classes.reminderText)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text2')}</Typography>
                            </Box>
                            <Box className={classNames(classes.cell, classes.moreCell)}>
                                <Typography variant="body1" className={classNames(classes.reminderText, classes.lowSpacing)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text4')}</Typography>
                                <Typography variant="body1" className={classNames(classes.reminderText, classes.lowSpacing)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text5')}</Typography>
                                <Typography variant="body1" className={classNames(classes.reminderText, classes.lowSpacing)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text6')}</Typography>
                                <Typography variant="body1" className={classNames(classes.reminderText, classes.lowSpacing)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text7')}</Typography>
                            </Box>
                        </Box>
                        <Box className={classes.column}>
                            <Box className={classes.cell}>
                                <Typography variant="body1" className={classNames(classes.reminderText)}>{t('plugin_ito_dialog_claim_mask_reminder_table_text3')}</Typography>
                            </Box>
                            <Box className={classes.cell}></Box>
                        </Box>
                    </Box>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text5')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text6')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text6_1')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text7')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text8')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text9')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text10')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text11')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text12')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text13')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text14')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text15')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text16')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text17')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text18')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text19')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text20')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text21')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text22')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text23')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text24')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text25')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text26')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text27')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text28')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text29')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text30')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text31')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text32')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text33')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text34')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text35')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text36')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text37')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text38')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text39')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text40')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text41')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text42')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text43')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text44')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text45')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text46')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text47')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text48')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text49')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text50')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text51')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text52')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text53')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text54')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text55')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text56')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text57')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_mask_reminder_text58')}
                    </Typography>
                </Box>
                :
                <Box className={classes.docBox}>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_reminder_text1')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_reminder_text2')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_reminder_text3')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.reminderTextLast)}>
                        {t('plugin_ito_dialog_claim_reminder_text4')}
                    </Typography>
                </Box>
            }

            <section className={classes.tokenWrapper}>
                <TokenIcon address={token.address} classes={{ icon: classes.tokenIcon }} />
                <div className={classes.tokenTextWrapper}>
                    <Typography variant="h5" className={classes.tokenSymbol}>
                        {token.name}
                    </Typography>

                    <Link
                        target="_blank"
                        className={classes.tokenLink}
                        rel="noopener noreferrer"
                        href={`${resolveLinkOnEtherscan(chainId)}/token/${token.address}`}>
                        <Typography variant="body2">
                            {formatEthereumAddress(token.address, 4)}(View on Etherscan)
                        </Typography>
                    </Link>
                </div>
            </section>
            <section className={classes.comfirmWrapper}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={agreeReminder}
                            onChange={(event) => {
                                setAgreeReminder(event.target.checked)
                            }}
                        />
                    }
                    label={t('plugin_ito_dialog_claim_reminder_agree')}
                />
            </section>
            <ActionButton
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => setStatus(ClaimStatus.Swap)}
                disabled={!agreeReminder}>
                Continue
            </ActionButton>
        </>
    )
}
