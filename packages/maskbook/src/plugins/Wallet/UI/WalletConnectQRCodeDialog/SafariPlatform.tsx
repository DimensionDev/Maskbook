import { Button, createStyles, Grid, GridList, GridListTile, makeStyles } from '@material-ui/core'
import { map } from 'lodash-es'
import { useState } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { Provider } from '../Provider'
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
            width: '100%',
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
    const [qrMode, setQRMode] = useState(false)
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
            <GridList className={classes.container} spacing={16} cellHeight={183}>
                {map(links, (link, name) => (
                    <GridListTile key={name}>
                        <Provider logo={null} name={name} description={name} onClick={makeConnect(link)} />
                    </GridListTile>
                ))}
            </GridList>
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
