import { memo } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useEnterDashboard } from '../../hook/useEnterDashboard'
import { MaskNotSquareIcon } from '@masknet/icons'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    placeholder: {
        marginTop: 87,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        fontWeight: 600,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 20,
        marginTop: 85,
        marginLeft: 16,
        marginRight: 16,
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #FFFFFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        height: 187,
    },
    title: {
        fontWeight: 700,
        fontSize: 24,
        lineHeight: 1.2,
        color: '#07101B',
    },
    description: {
        fontSize: 14,
        color: '#ACB4C1',
        textAlign: 'center',
        lineHeight: '18px',
        fontWeight: 700,
        marginTop: 12,
    },
})

export const InitialPlaceholder = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const onEnter = useEnterDashboard()

    return (
        <Box className={classes.container}>
            <Box className={classes.header}>
                <MaskNotSquareIcon />
            </Box>
            <Box className={classes.placeholder}>
                <Typography className={classes.title}>{t('welcome_to_mask')}</Typography>
                <Typography className={classes.description}>
                    {t('welcome_description_congrats')} <br />
                    {t('welcome_description_content')} <br />
                    {t('welcome_description_content_second')}
                </Typography>
            </Box>
            <Button variant="contained" color="primary" className={classes.button} onClick={onEnter}>
                {t('browser_action_enter_dashboard')}
            </Button>
        </Box>
    )
})
