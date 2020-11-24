import { Button, createStyles, Grid, GridList, GridListTile, makeStyles, SvgIconProps } from '@material-ui/core'
import { map } from 'lodash-es'
import { useState, createElement } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { Provider } from '../Provider'
import { IMTokenIcon, MetaMaskIcon, RainbowIcon, TrustIcon } from './Icons'
import { QRCodeModel } from './QRCodeModel'

const useStyles = makeStyles(() =>
    createStyles({
        container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
        grid: { width: '100%' },
        content: { height: 400 },
        icon: { fontSize: 45 },
    }),
)

interface WalletProvider {
    name: string
    logo: React.ComponentType<SvgIconProps>
    protocol: string
}

const providers: WalletProvider[] = [
    { name: 'MetaMask', logo: MetaMaskIcon, protocol: 'https://metamask.app.link/wc' },
    { name: 'Rainbow', logo: RainbowIcon, protocol: 'https://rnbwapp.com/wc' },
    { name: 'Trust', logo: TrustIcon, protocol: 'https://link.trustwallet.com/wc' },
    { name: 'imToken', logo: IMTokenIcon, protocol: 'imtokenv2://wc' },
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
        <GridList className={classes.grid} spacing={16} cellHeight={183}>
            {map(providers, ({ name, logo, protocol }, key) => (
                <GridListTile key={key}>
                    <Provider
                        name={name}
                        logo={createElement(logo, { className: classes.icon, viewBox: '0 0 45 45' })}
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
