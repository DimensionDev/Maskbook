import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { ChangeEvent, useCallback, useState } from 'react'
import { Typography } from '@mui/material'
import { useI18N } from '../locales/index'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: 600,
        display: 'flex',
        padding: theme.spacing(1),
    },
    input: {
        flex: 1,
        padding: theme.spacing(0.5),
    },
    button: {
        padding: theme.spacing(1, 2),
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    skeleton: {
        borderRadius: 8,
        margin: theme.spacing(1),
        marginTop: 0,
        backgroundColor: theme.palette.background.default,
        height: '48px',
    },
}))
interface ENSDetailProps {
    ensInfo: string
}

const ENSDetail: React.FC<ENSDetailProps> = (props) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [ensName, setEnsName] = useState('')

    const handleEnsNameChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const ens_ = ev.currentTarget.value
        setEnsName(ens_)
    }, [])

    const handleSearch = useCallback(() => {
        console.log(ensName)
    }, [ensName])
    return (
        <>
            <Box className={classes.wrapper}>
                <Typography variant="h6">{t('parent')}</Typography>
                <Typography marginLeft={2} variant="h6">
                    eth
                </Typography>
            </Box>
            <Box className={classes.wrapper}>
                <Typography variant="h6">{t('registrant')}</Typography>
                <Typography variant="h6" marginLeft={2}>
                    0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85
                </Typography>
            </Box>
            <Box className={classes.wrapper}>
                <Typography variant="h6">{t('controller')}</Typography>
                <Typography variant="h6" marginLeft={2}>
                    0x6d9690b31109eC7c418C78Ac94e6BF36Aa793739
                </Typography>
            </Box>
            <Box className={classes.wrapper}>
                <Typography variant="h6">{t('expiration_date')}</Typography>
                <Typography variant="h6" marginLeft={2}>
                    2022.05.26 at 12:54 (UTC+08:00)
                </Typography>
            </Box>
        </>
    )
}

export default ENSDetail
