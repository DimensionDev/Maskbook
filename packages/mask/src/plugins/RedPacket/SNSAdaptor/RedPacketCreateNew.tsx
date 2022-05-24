import { makeStyles } from '@masknet/theme'
import { useChainId, ChainId } from '@masknet/web3-shared-evm'
import { RedPacketFormProps, RedPacketERC20Form } from './RedPacketERC20Form'
import { RedPacketERC721Form } from './RedPacketERC721Form'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'
import { activatedSocialNetworkUI } from '../../../social-network'
import { IconURLs } from './IconURL'
import { EnhanceableSite } from '@masknet/shared-base'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        height: 36,
        minHeight: 36,
        margin: `0 ${snsId === EnhanceableSite.Minds ? '12px' : 'auto'}`,
        borderRadius: 4,
        backgroundColor: theme.palette.background.default,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    img: {
        width: 20,
        marginRight: 4,
    },
    labelWrapper: {
        display: 'flex',
    },
    tabWrapper: {
        padding: 0,
    },
}))

export function RedPacketCreateNew(props: RedPacketFormProps & { state: readonly [number, (next: number) => void] }) {
    const { origin, onNext, onChange, onClose, state } = props
    const { t } = useI18N()
    const { classes } = useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier })
    const chainId = useChainId()

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: (
                    <div className={classes.labelWrapper}>
                        <img className={classes.img} src={IconURLs.erc20Token} />
                        <span>{t('plugin_red_packet_erc20_tab_title')}</span>
                    </div>
                ),
                children: <RedPacketERC20Form origin={origin} onClose={onClose} onNext={onNext} onChange={onChange} />,
                sx: { p: 0 },
            },
            {
                label: (
                    <div className={classes.labelWrapper}>
                        <img className={classes.img} src={IconURLs.erc721Token} />
                        <span>{t('plugin_red_packet_erc721_tab_title')}</span>
                    </div>
                ),
                children: <RedPacketERC721Form onClose={onClose} />,
                sx: { p: 0 },
                disabled: ![ChainId.Mainnet, ChainId.Matic, ChainId.BSC, ChainId.Conflux].includes(chainId),
            },
        ],
        state,
        classes,
    }
    return (
        <div className={classes.tabWrapper}>
            <AbstractTab {...tabProps} />
        </div>
    )
}
