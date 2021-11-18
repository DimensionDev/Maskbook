import { makeStyles } from '@masknet/theme'
import { RedPacketFormProps, RedPacketERC20Form } from './RedPacketERC20Form'
import { RedPacketERC721Form } from './RedPacketERC721Form'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'
import { MINDS_ID } from '../../../social-network-adaptor/minds.com/base'
import { activatedSocialNetworkUI } from '../../../social-network'

import { IconURLs } from './IconURL'

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
        margin: `0 ${snsId === MINDS_ID ? '12px' : 'auto'}`,
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
    wrapper: {
        padding: theme.spacing(0, 2, 2, 2),
    },
}))

export function RedPacketCreateNew(props: RedPacketFormProps & { state: readonly [number, (next: number) => void] }) {
    const { origin, onNext, onChange, onClose, SelectMenuProps, state } = props
    const { t } = useI18N()
    const { classes } = useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier })
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: (
                    <div className={classes.labelWrapper}>
                        <img className={classes.img} src={IconURLs.erc20Token} />
                        <span>{t('plugin_red_packet_erc20_tab_title')}</span>
                    </div>
                ),
                children: (
                    <RedPacketERC20Form
                        origin={origin}
                        onClose={onClose}
                        onNext={onNext}
                        onChange={onChange}
                        SelectMenuProps={SelectMenuProps}
                    />
                ),
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
            },
        ],
        state,
        classes,
    }
    return (
        <div className={classes.wrapper}>
            <AbstractTab {...tabProps} />
        </div>
    )
}
