import { CopyButton, FormattedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useWeb3Utils } from '@masknet/web3-hooks-base'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Alert, Link, Tooltip, Typography } from '@mui/material'
import { type ReactNode } from 'react'
import { z } from 'zod'

const useStyles = makeStyles()({
    box: {
        margin: 8,
        border: '1px solid #ccc',
        borderRadius: 4,
        wordBreak: 'break-word',
    },
    object: {
        paddingInline: 0,
        marginInline: 16,
        listStyle: 'none',
        textTransform: 'capitalize',
    },
    fieldName: { fontWeight: 'bold' },
    value: {},
    list: {
        paddingInline: 0,
        marginInline: 32,
        '& > li > ul': {
            marginInline: 0,
        },
    },
    error: { display: 'inline-flex' },
})

export function RenderEIP712({ data, messageTitle, title }: { data: Data; title: ReactNode; messageTitle: ReactNode }) {
    const { classes } = useStyles()
    const isDomainValid = def.safeParse(data.types.EIP712Domain)
    const utils = useWeb3Utils()
    return (
        <>
            {title}
            <div className={classes.box}>
                {isDomainValid.success ? renderField(data.domain, 'EIP712Domain', data.types) : null}
            </div>
            {messageTitle}
            <div className={classes.box}>{renderField(data.message, data.primaryType, data.types)}</div>
        </>
    )

    function renderField(fieldData: unknown, fieldType: string, schema: Record<string, Item>): ReactNode {
        switch (fieldType) {
            case 'bool':
                return (
                    <Tooltip title={fieldType}>
                        {typeof fieldData !== 'boolean' ?
                            <Alert className={classes.error} severity="error">
                                Not a {fieldType}.
                            </Alert>
                        :   <Typography component="span" className={classes.value}>
                                {String(fieldData)}
                            </Typography>
                        }
                    </Tooltip>
                )
            case 'bytes':
            case 'bytes1':
            case 'bytes32':
            case 'uint8':
            case 'uint256':
            case 'int8':
            case 'int256':
                return (
                    <Tooltip title={fieldType}>
                        {typeof fieldData !== 'string' && typeof fieldData !== 'number' ?
                            <Alert className={classes.error} severity="error">
                                Not a {fieldType}.
                            </Alert>
                        :   <Typography component="span" className={classes.value}>
                                {fieldData}
                            </Typography>
                        }
                    </Tooltip>
                )
            case 'string':
                return (
                    <Tooltip title={fieldType}>
                        {typeof fieldData !== 'string' ?
                            <Alert className={classes.error} severity="error">
                                Not a {fieldType}.
                            </Alert>
                        :   <Typography component="span" className={classes.value}>
                                {fieldData}
                            </Typography>
                        }
                    </Tooltip>
                )
            case 'address':
                return typeof fieldData !== 'string' ?
                        <Alert className={classes.error} severity="error">
                            Not a {fieldType}.
                        </Alert>
                    :   <Tooltip title={String(fieldData)}>
                            <Link
                                className={classes.value}
                                href={utils.explorerResolver.addressLink(ChainId.Mainnet, fieldData)}
                                target="_blank"
                                rel="noopener noreferrer">
                                <FormattedAddress address={fieldData} size={6} formatter={formatEthereumAddress} />
                                <CopyButton size={14} text={fieldData} />
                            </Link>
                        </Tooltip>
        }
        if (fieldType.match(/\[(\d+)?]$/)) {
            const type = fieldType.replace(/\[(\d+)?]$/, '')
            const data = Array.isArray(fieldData) ? fieldData : []
            return (
                <ol className={classes.list}>
                    {data.map((field, index) => (
                        // eslint-disable-next-line react/no-missing-key
                        <li>{renderField(field, type, schema)}</li>
                    ))}
                </ol>
            )
        } else {
            const define = schema[fieldType]
            if (!define)
                return (
                    <Alert className={classes.error} severity="error">
                        This request is missing the definition of {fieldType}
                    </Alert>
                )
            if (!(typeof fieldData === 'object' && fieldData !== null))
                return (
                    <Alert className={classes.error} severity="error">
                        Field is not an object.
                    </Alert>
                )
            return (
                <ul className={classes.object}>
                    {define.map((field) => (
                        // eslint-disable-next-line react/no-missing-key
                        <li>
                            <Tooltip title={field.type}>
                                <span>
                                    <Typography className={classes.fieldName} component="span">
                                        {field.name}
                                    </Typography>
                                </span>
                            </Tooltip>
                            :{' '}
                            {field.name in fieldData ?
                                renderField((fieldData as any)[field.name], field.type, schema)
                            :   <Alert className={classes.error} severity="error">
                                    ?
                                </Alert>
                            }
                        </li>
                    ))}
                </ul>
            )
        }
    }
}

const def = z
    .object({
        type: z.string(),
        name: z.string(),
    })
    .array()
type Item = z.infer<typeof def>
const data = z.object({
    types: z
        .object({
            EIP712Domain: z.array(z.unknown()),
        })
        .catchall(def)
        .describe('types'),
    domain: z.object({}).passthrough(),
    primaryType: z.string(),
    message: z.object({}).passthrough(),
})
type Data = z.infer<typeof data>
