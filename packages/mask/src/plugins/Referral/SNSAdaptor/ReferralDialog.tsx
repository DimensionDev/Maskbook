import { useState, useCallback } from 'react'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useTheme } from '@mui/material/styles'

import { PageHistory, PagesType, DialogInterface } from '../types'
import { useI18N } from '../locales'

import { InjectedDialog } from '@masknet/shared'
import { Landing } from './Landing'
import { ReferralFarms } from './ReferralFarms'
import { CreateFarm } from './CreateFarm'
import { ReferToFarm } from './ReferToFarm'
import { SelectToken } from './SelectToken'
import { BuyToFarm } from './BuyToFarm'
import { AdjustFarmRewards } from './AdjustFarmRewards'
import { Transaction } from './Transaction'
import { Deposit } from './Deposit'
import { AttraceLogoDarkTheme, AttraceLogoLightTheme } from './shared-ui/icons'

interface ReferralDialogProps {
    open: boolean
    onClose?: () => void
}

const useStyles = makeStyles<{ hideBackBtn?: boolean }>()((theme, { hideBackBtn = false }) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    content: {
        fontFamily: theme.typography.fontFamily,
        fontWeight: 400,
        padding: theme.spacing(0, 3, 0),
        margin: 0,
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    powered: {
        display: 'flex',
        alignItems: 'center',
        fontWeight: 400,
        fontSize: '12px',
        color: theme.palette.text.secondary,
        '& svg': {
            marginLeft: 5,
        },
    },
    dialogTitleTypography: {
        flex: '1',
        marginLeft: 0,
    },
    dialogTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        minHeight: '60px',
        padding: theme.spacing(0, 3),
        fontSize: '19px',
        lineHeight: '27px',
        fontWeight: 600,
        margin: 0,
    },
    dialog: {
        maxWidth: 600,
        boxShadow: 'none',
        backgroundImage: 'none',
    },
    dialogCloseButton: {
        display: hideBackBtn ? 'none' : 'inline-flex',
        color: theme.palette.text.strong,
        padding: 0,
        marginRight: '16px',
    },
}))

export function ReferralDialog({ open, onClose }: ReferralDialogProps) {
    const [propsData, setPropsData] = useState<DialogInterface>()

    const t = useI18N()
    const { classes } = useStyles({ hideBackBtn: propsData?.hideBackBtn })
    const [currentPage, setCurrentPage] = useState<PageHistory>({
        page: PagesType.LANDING,
        title: t.__plugin_name(),
    })
    const mode = useTheme().palette.mode
    const [previousPages, setPreviousPages] = useState<PageHistory[]>([])
    const [currentTitle, setCurrentTitle] = useState(t.__plugin_name())

    const onContinue = (
        currentPage: PagesType,
        nextPage: PagesType,
        title: string = t.__plugin_name(),
        props?: DialogInterface,
    ) => {
        setPreviousPages([...previousPages, { page: currentPage, title: currentTitle }])
        setCurrentPage({ page: nextPage, title })
        setCurrentTitle(title)
        setPropsData(props)
    }

    const onChangePage = (page: PagesType, title: string = t.__plugin_name(), props?: DialogInterface) => {
        setCurrentPage({ page, title })
        setCurrentTitle(title)
        setPropsData(props)
    }

    const renderViews = () => {
        const { page } = currentPage
        switch (page) {
            case PagesType.LANDING:
                return <Landing continue={onContinue} />
            case PagesType.REFERRAL_FARMS:
                return <ReferralFarms continue={onContinue} />
            case PagesType.CREATE_FARM:
                return <CreateFarm continue={onContinue} onClose={onClose} onChangePage={onChangePage} />
            case PagesType.REFER_TO_FARM:
                return <ReferToFarm continue={onContinue} onClose={onClose} onChangePage={onChangePage} />
            case PagesType.BUY_TO_FARM:
                return <BuyToFarm continue={onContinue} onClose={onClose} onChangePage={onChangePage} />
            case PagesType.ADJUST_REWARDS:
                return (
                    <AdjustFarmRewards
                        {...propsData?.adjustFarmDialog}
                        continue={onContinue}
                        onClose={onClose}
                        onChangePage={onChangePage}
                    />
                )
            case PagesType.DEPOSIT:
                return <Deposit {...propsData?.depositDialog} />
            case PagesType.SELECT_TOKEN:
                return <SelectToken />
            case PagesType.TRANSACTION:
                return <Transaction onClose={onClose} {...propsData?.transactionDialog} />
            default:
                return <Landing continue={onContinue} />
        }
    }

    const onBackToAdjustRewardsDialog = useCallback(async () => {
        const props: DialogInterface = {
            adjustFarmDialog: {
                ...propsData?.depositDialog?.adjustFarmData,
                continue: () => {},
            },
        }
        setPropsData(props)
    }, [propsData])

    const onHandleClose = useCallback(() => {
        onClose?.()
        setCurrentPage({
            page: PagesType.LANDING,
            title: t.__plugin_name(),
        })
        setCurrentTitle(t.__plugin_name())
    }, [])

    return (
        <InjectedDialog
            open={open}
            onClose={onHandleClose}
            titleBarIconStyle="close"
            title={
                propsData?.hideAttrLogo ? (
                    currentTitle
                ) : (
                    <span className={classes.title}>
                        {currentTitle}
                        <span className={classes.powered}>
                            {t.powered_by()}
                            {mode === 'dark' ? <AttraceLogoDarkTheme /> : <AttraceLogoLightTheme />}
                        </span>
                    </span>
                )
            }
            disableBackdropClick
            classes={{
                paper: classes.dialog,
                dialogCloseButton: classes.dialogCloseButton,
                dialogTitle: classes.dialogTitle,
                dialogTitleTypography: classes.dialogTitleTypography,
            }}>
            <DialogContent className={classes.content}>{renderViews()}</DialogContent>
        </InjectedDialog>
    )
}
