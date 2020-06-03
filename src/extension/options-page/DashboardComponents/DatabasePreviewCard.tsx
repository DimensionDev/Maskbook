import React from 'react'
import classNames from 'classnames'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import { Table, TableBody, TableRow, TableCell, Typography, makeStyles, Theme, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { unreachable } from '../../../utils/utils'

const useDatabasePreviewCardStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            width: 432,
            borderRadius: 4,
            borderCollapse: 'unset',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 32,
            marginLeft: -32,
            marginBottom: 38,
        },
        cell: {
            border: 'none',
            padding: '9px 0 !important',
        },
        label: {
            verticalAlign: 'middle',
            fontSize: 20,
            fontWeight: 500,
            lineHeight: '30px',
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
    }),
)

export enum DatabaseRecordType {
    Persona,
    Profile,
    Post,
    Contact,
}

export interface DatabasePreviewCardProps {
    records: {
        type: DatabaseRecordType
        length: number
        checked: boolean
    }[]
}

export function DatabasePreviewCard(props: DatabasePreviewCardProps) {
    const { t } = useI18N()
    const classes = useDatabasePreviewCardStyles()

    const resolveRecordName = (type: DatabaseRecordType) => {
        switch (type) {
            case DatabaseRecordType.Persona:
                return t('personas')
            case DatabaseRecordType.Profile:
                return t('profiles')
            case DatabaseRecordType.Post:
                return t('posts')
            case DatabaseRecordType.Contact:
                return t('contacts')
            default:
                return unreachable(type)
        }
    }
    const records = props.records.map((record) => ({
        ...record,
        name: resolveRecordName(record.type),
    }))
    return (
        <Table className={classes.table} size="small">
            <TableBody>
                {records.map((record) => (
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
                            {record.checked ? (
                                <CheckCircleOutlineIcon className={classNames(classes.icon, classes.iconChecked)} />
                            ) : (
                                <RadioButtonUncheckedIcon className={classes.icon} />
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
