import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { ChangeEvent, useCallback, useState } from 'react'
import { Typography } from '@mui/material'
import { useI18N } from '../locales/index'
import type { ENS_Info_type } from './types'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: 600,
        display: 'flex',
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
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
    ENS_Info?: ENS_Info_type
}

const ENSDetail: React.FC<ENSDetailProps> = ({ ENS_Info }) => {
    const { classes } = useStyles()
    const t = useI18N()
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
                <Typography variant="subtitle1">{t.parent()}:</Typography>
                <Typography marginLeft={2} variant="subtitle1">
                    eth
                </Typography>
            </Box>
            <Box className={classes.wrapper}>
                <Typography variant="subtitle1">{t.owner()}:</Typography>
                <Typography variant="subtitle1" marginLeft={2}>
                    {ENS_Info?.owner}
                </Typography>
            </Box>
            <Box className={classes.wrapper}>
                <Typography variant="subtitle1">{t.resolver()}:</Typography>
                <Typography variant="subtitle1" marginLeft={2}>
                    {ENS_Info?.resolver}
                </Typography>
            </Box>
            <Box className={classes.wrapper}>
                <Typography variant="subtitle1">{t.ttl()}:</Typography>
                <Typography variant="subtitle1" marginLeft={2}>
                    {ENS_Info?.ttl === '0' ? 'not found' : ENS_Info?.ttl}
                </Typography>
            </Box>
        </>
    )
}

export default ENSDetail
