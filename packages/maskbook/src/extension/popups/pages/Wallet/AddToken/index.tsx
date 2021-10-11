import { memo } from 'react'
import { Button, Stack, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useWallet } from '@masknet/web3-shared'
import { ERC20TokenList } from '@masknet/shared'
import { useI18N } from '../../../../../utils'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles()({
    header: {
        padding: '10px 16px',
        backgroundColor: '#EFF5FF',
        color: '#1C68F3',
        fontSize: 14,
        lineHeight: '20px',
    },
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    button: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        color: '#1C68F3',
        lineHeight: '20px',
        backgroundColor: '#F7F9FA',
    },
})

const AddToken = memo(() => {
    const { t } = useI18N()
    const wallet = useWallet()
    const { classes } = useStyles()
    const history = useHistory()

    const excludeTokens = Array.from(wallet?.erc20_token_whitelist ?? [])

    return (
        <>
            <div className={classes.header}>{t('add_token')}</div>
            <div className={classes.content}>
                <Typography className={classes.label}>{t('popups_wallet_token')}</Typography>
                <ERC20TokenList FixedSizeListProps={{ height: 340, itemSize: 54 }} blacklist={excludeTokens} />
            </div>
            <Stack height="100%" sx={{ px: 2, pb: 2 }} justifyContent="center" alignItems="center">
                <Button fullWidth className={classes.button} onClick={history.goBack}>
                    {t('popups_wallet_go_back')}
                </Button>
            </Stack>
        </>
    )
})

export default AddToken
