import { memo } from 'react'
import { Button, Stack } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FungibleTokenList } from '@masknet/shared'
import { useBlockedFungibleTokens } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../../../utils/index.js'
import { useNavigate } from 'react-router-dom'
import { useTitle } from '../../../hook/useTitle.js'
import { useRowSize } from '../../../../../../../shared/src/contexts/components/useRowSize.js'

const useStyles = makeStyles()((theme) => ({
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
    channel: {
        flex: 1,
        '& > div': {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
        },
    },
    listBox: {
        flex: 1,
    },
    wrapper: {
        height: '374px!important',
        paddingTop: theme.spacing(2),
    },
    input: {
        fontSize: 12,
        background: '#F7F9FA',
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
                    classes={{ channel: classes.channel, listBox: classes.listBox }}
                    blacklist={blackList.map((x) => x.address)}
                    FixedSizeListProps={{ height: 340, itemSize: rowSize + 16, className: classes.wrapper }}
                    SearchTextFieldProps={{ className: classes.input }}
                />
            </div>
            <Stack sx={{ p: 2 }} justifyContent="center" alignItems="center">
                <Button fullWidth className={classes.button} onClick={() => navigate(-1)}>
                    {t('popups_wallet_go_back')}
                </Button>
            </Stack>
        </>
    )
})

export default AddToken
