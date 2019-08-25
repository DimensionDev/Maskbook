import * as React from 'react'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Button, Typography, Box, Theme, useTheme } from '@material-ui/core'
import { styled } from '@material-ui/styles'
import WelcomeContainer from './WelcomeContainer'
import Navigation from './Navigation/Navigation'
import { IdentifierRefContext } from '../../extension/options-page/Welcome'
import { useValueRef } from '../../utils/hooks/useValueRef'

const VerticalCenter = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 180,
})
const LinedBox = styled('div')(({ theme }: { theme: Theme }) => ({
    border: '1px solid #ddd',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'start',
    padding: '1rem 1.25rem',
    margin: '2rem 0',
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
        '& > *': { minWidth: '100%' },
        textAlign: 'center',
    },
}))

interface Props {
    create(): void
    restore(): void
    close(): void
}
const useStyles = makeStyles<Theme>(theme => ({
    article: {
        [theme.breakpoints.down('xs')]: {
            padding: '0 1rem',
        },
        padding: '0 3rem',
        textAlign: 'center',
    },
    title: {
        marginBottom: theme.spacing(3),
        color: theme.palette.grey[500],
    },
    subtitle: {
        maxWidth: '24rem',
        margin: 'auto',
    },
    commonButton: {
        margin: '0 0.5rem',
    },
}))
export default function Welcome({ create, restore, close }: Props) {
    const theme = useTheme()
    const classes = useStyles()
    const idContext = useValueRef(React.useContext(IdentifierRefContext))
    return (
        <WelcomeContainer>
            <Navigation close={close} />
            <article className={classes.article}>
                <Typography variant="h5" className={classes.title}>
                    {geti18nString('welcome_0_title')}
                </Typography>
                <Typography variant="subtitle1" className={classes.subtitle}>
                    {geti18nString('welcome_0_description')}
                </Typography>
                <LinedBox theme={theme}>
                    <Box flex={1}>
                        <Typography variant="body1">{geti18nString('welcome_0_new_user')}</Typography>
                        <Typography variant="h6">{geti18nString('welcome_0_connect_maskbook')}</Typography>
                    </Box>
                    <VerticalCenter>
                        <Button className={classes.commonButton} onClick={create} variant="contained" color="primary">
                            {geti18nString('welcome_0_connect_maskbook')}
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <LinedBox theme={theme}>
                    <Box flex={1}>
                        <Typography variant="body1">{geti18nString('welcome_0_old_user')}</Typography>
                        <Typography variant="h6">{geti18nString('welcome_0_restore_key')}</Typography>
                    </Box>
                    <VerticalCenter>
                        <Button className={classes.commonButton} onClick={restore} variant="outlined">
                            {geti18nString('restore')}
                        </Button>
                    </VerticalCenter>
                </LinedBox>
                <Typography variant="caption" className={classes.title}>
                    {geti18nString('welcome_0_caption')}
                </Typography>
            </article>
        </WelcomeContainer>
    )
}
