import { memo } from 'react'
import { Button, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FungibleTokenList } from '@masknet/shared'
import { useBlockedFungibleTokens } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../../../utils'
import { useNavigate } from 'react-router-dom'
import { useTitle } from '../../../hook/useTitle'
import { useRowSize } from '../../../../../../../shared/src/contexts/components/useRowSize'

const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
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
    list: {
        marginTop: theme.spacing(4),
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
        height: 288,
        boxSizing: 'border-box',
    },
    wrapper: {
        paddingTop: theme.spacing(2),
    },
}))

const AddToken = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const blackList = useBlockedFungibleTokens()
    const rowSize = useRowSize()

    useTitle(t('add_token'))

    return (
        <>
            <div className={classes.content}>
                <FungibleTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    blacklist={blackList.map((x) => x.address)}
                    FixedSizeListProps={{ height: 340, itemSize: rowSize + 16, className: classes.wrapper }}
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
