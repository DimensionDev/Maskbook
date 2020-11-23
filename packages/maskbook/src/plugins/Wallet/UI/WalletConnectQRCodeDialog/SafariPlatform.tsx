import { Button, createStyles, Grid, GridList, GridListTile, makeStyles } from '@material-ui/core'
import { map } from 'lodash-es'
import { useState } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { Provider } from '../Provider'
import { IMTokenIcon, MetaMaskIcon, RainbowIcon, TrustIcon } from './Icons'
import { QRCodeModel } from './QRCodeModel'

const useStyles = makeStyles(() => createStyles({ container: { width: '100%' }, content: { height: 400 } }))

const links: Record<string, string> = {
    Rainbow: 'https://rnbwapp.com/wc',
    MetaMask: 'https://metamask.app.link/wc',
    Trust: 'https://link.trustwallet.com/wc',
    imToken: 'imtokenv2://wc',
}

interface WalletProvider {
    name: string
    logo: React.ReactNode
    protocol: string
}

const providers: WalletProvider[] = [
    { name: 'MetaMask', logo: <MetaMaskIcon />, protocol: 'https://metamask.app.link/wc' },
    { name: 'Rainbow', logo: <RainbowIcon />, protocol: 'https://rnbwapp.com/wc' },
    { name: 'Trust', logo: <TrustIcon />, protocol: 'https://link.trustwallet.com/wc' },
    { name: 'imToken', logo: <IMTokenIcon />, protocol: 'imtokenv2://wc' },
]

export const SafariPlatform: React.FC<{ uri: string }> = ({ uri }) => {
    const { t } = useI18N()
    const classes = useStyles()
    const [qrMode, setQRMode] = useState(false)
    const makeConnect = (link: string) => () => {
        const url = new URL(link)
        url.searchParams.set('uri', uri)
        open(url.toString())
    }
    const descriptionMapping: Record<string, string> = {
        MetaMask: t('plugin_wallet_connect_safari_metamask'),
        Rainbow: t('plugin_wallet_connect_safari_rainbow'),
        Trust: t('plugin_wallet_connect_safari_trust'),
        imToken: t('plugin_wallet_connect_safari_im_token'),
    }
    const ProvideSelector = () => (
        <GridList className={classes.container} spacing={16} cellHeight={183}>
            {map(providers, ({ name, logo, protocol }, key) => (
                <GridListTile key={key}>
                    <Provider
                        logo={logo}
                        name={name}
                        description={descriptionMapping[name]}
                        onClick={makeConnect(protocol)}
                    />
                </GridListTile>
            ))}
        </GridList>
    )
    return (
        <Grid className={classes.container}>
            {qrMode ? <QRCodeModel uri={uri} /> : <ProvideSelector />}
            <Button onClick={() => setQRMode(!qrMode)}>
                {t(qrMode ? 'plugin_wallet_return_mobile_wallet_options' : 'plugin_wallet_view_qr_code')}
            </Button>
        </Grid>
    )
}
