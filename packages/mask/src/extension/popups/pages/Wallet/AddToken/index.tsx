import { memo } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ERC20TokenList } from '@masknet/shared'
import { useI18N } from '../../../../../utils'
import { useNavigate } from 'react-router-dom'
import { useTitle } from '../../../hook/useTitle'
import { useBlockedFungibleTokens } from '@masknet/plugin-infra/web3'

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
        fontWeight: 600,
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
    const { classes } = useStyles()
    const navigate = useNavigate()
    const blackList = useBlockedFungibleTokens()

    useTitle(t('add_token'))

    return (
        <>
            <div className={classes.content}>
                <Typography className={classes.label}>{t('popups_wallet_token')}</Typography>
                <ERC20TokenList
                    FixedSizeListProps={{ height: 340, itemSize: 54 }}
                    blacklist={blackList.map((x) => x.address)}
                />
            </div>
            <Stack height="100%" sx={{ px: 2, pb: 2 }} justifyContent="center" alignItems="center">
                <Button fullWidth className={classes.button} onClick={() => navigate(-1)}>
                    {t('popups_wallet_go_back')}
                </Button>
            </Stack>
        </>
    )
})

export default AddToken
