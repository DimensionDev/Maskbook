import { makeStyles, useStylesExtends } from '@masknet/theme'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'

interface StyleProps {
    tabLength: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    tab: {
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        marginRight: 1,
        '&:last-child': {
            marginRight: 0,
        },
    },
    tabs: {
        '& .MuiTabs-flexContainer': {
            display: 'grid',
            gridTemplateColumns: Array(props.tabLength)
                .fill(100 / props.tabLength + '%')
                .join(' '),
            backgroundColor: theme.palette.background.paper,
        },
    },
    tabContainer: {
        padding: '0 15px',
    },
}))

interface SavingsTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    tab: 'deposit' | 'withdraw'
    setTab(tab: 'deposit' | 'withdraw'): void
}

export function SavingsTab(props: SavingsTabProps) {
    const classes = useStylesExtends(useStyles({ tabLength: 2 }), props)

    const createTabItem = (name: string) => ({
        label: <span>{name}</span>,
        sx: { p: 0 },
        cb: () => props.setTab(name === 'Deposit' ? 'deposit' : 'withdraw'),
    })

    const tabs = [createTabItem('Deposit'), createTabItem('Withdraw')]

    const tabProps: AbstractTabProps = {
        tabs,
        index: props.tab === 'deposit' ? 0 : 1,
        classes,
        hasOnlyOneChild: true,
    }

    return (
        <div className={classes.tabContainer}>
            <AbstractTab {...tabProps} />
        </div>
    )
}
