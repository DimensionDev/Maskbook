import { Button, createStyles, Grid, makeStyles } from '@material-ui/core'
import classNames from 'classnames'
import { map } from 'lodash-es'
import React from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { QRCodeModel } from './QRCodeModel'

const links: Record<string, string> = {
    Rainbow: 'https://rnbwapp.com/wc',
    MetaMask: 'https://metamask.app.link/wc',
    Trust: 'https://link.trustwallet.com/wc',
    imToken: 'imtokenv2://wc',
}
const useStyles = makeStyles(() =>
    createStyles({
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        content: {
            height: 400,
        },
    }),
)

export const SafariPlatform: React.FC<{ uri: string }> = ({ uri }) => {
    const { t } = useI18N()
    const classes = useStyles()
    const [qrMode, setQRMode] = React.useState(false)
    const makeConnect = (link: string) => () => {
        const url = new URL(link)
        url.searchParams.set('uri', uri)
        open(url.toString())
    }
    const ViewArea = () => {
        if (qrMode) {
            return <QRCodeModel uri={uri} />
        }
        return (
            <div className={classNames(classes.container, classes.content)}>
                {map(links, (link, name) => (
                    <Button key={name} onClick={makeConnect(link)}>
                        Connect to {name}
                    </Button>
                ))}
            </div>
        )
    }
    return (
        <Grid className={classes.container}>
            <ViewArea />
            <Button onClick={() => setQRMode(!qrMode)}>
                {t(qrMode ? 'plugin_wallet_return_mobile_wallet_options' : 'plugin_wallet_view_qr_code')}
            </Button>
        </Grid>
    )
}
