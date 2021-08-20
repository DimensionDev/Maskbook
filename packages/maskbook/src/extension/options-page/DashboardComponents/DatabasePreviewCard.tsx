import classNames from 'classnames'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import { Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { unreachable } from '@dimensiondev/kit'
import { useI18N } from '../../../utils'
import { useStylesExtends } from '@masknet/shared'

const useDatabasePreviewCardStyles = makeStyles()((theme) => ({
    table: {
        borderCollapse: 'unset',
    },
    cell: {
        border: 'none',
        padding: '9px 0 !important',
    },
    label: {
        verticalAlign: 'middle',
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.75,
    },
    icon: {
        color: theme.palette.divider,
        width: 20,
        height: 20,
        verticalAlign: 'middle',
        marginLeft: 18,
    },
    iconChecked: {
        color: theme.palette.success.main,
    },
}))

export enum DatabaseRecordType {
    Persona = 0,
    Profile = 1,
    Post = 2,
    Wallet = 3,
}

export interface DatabasePreviewCardProps extends withClasses<'table' | 'label' | 'icon'> {
    dense?: boolean
    records: {
        type: DatabaseRecordType
        length: number
        checked: boolean
    }[]
}

export function DatabasePreviewCard(props: DatabasePreviewCardProps) {
    const { dense = false, records } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useDatabasePreviewCardStyles(), props)

    const resolveRecordName = (type: DatabaseRecordType) => {
        switch (type) {
            case DatabaseRecordType.Persona:
                return t('personas')
            case DatabaseRecordType.Profile:
                return t('profiles')
            case DatabaseRecordType.Post:
                return t('posts')
            case DatabaseRecordType.Wallet:
                return t('wallets')
            default:
                return unreachable(type)
        }
    }
    const resolvedRecords = records.map((record) => ({
        ...record,
        name: resolveRecordName(record.type),
    }))
    return (
        <Table className={classes.table} size="small">
            <TableBody>
                {resolvedRecords.map((record) => (
                    <TableRow key={record.name}>
                        <TableCell className={classes.cell} component="th" align="left">
                            <Typography className={classes.label} variant="body2" component="span">
                                {record.name}
                            </Typography>
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                            <Typography className={classes.label} variant="body2" component="span">
                                {record.length}
                            </Typography>
                            {!dense ? (
                                record.checked ? (
                                    <CheckCircleOutlineIcon className={classNames(classes.icon, classes.iconChecked)} />
                                ) : (
                                    <RadioButtonUncheckedIcon className={classes.icon} />
                                )
                            ) : null}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
