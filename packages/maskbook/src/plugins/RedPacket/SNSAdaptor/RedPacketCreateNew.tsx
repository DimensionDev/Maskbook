import { makeStyles } from '@masknet/theme'
import { RedPacketFormProps, RedPacketERC20Form } from './RedPacketERC20Form'
import { RedPacketERC721Form } from './RedPacketERC721Form'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'

import { IconURLs } from './IconURL'

const useStyles = makeStyles()((theme) => ({
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
        color: theme.palette.mode === 'light' ? '#15181B' : '#D9D9D9',
    },
    tabs: {
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        width: 544,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        '& .Mui-selected': {
            backgroundColor: '#1C68F3',
            color: '#fff !important',
        },
        borderRadius: 4,
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
    const { classes } = useStyles()
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
