import { makeStyles } from '@masknet/theme'
import { Fragment, memo, useEffect } from 'react'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { Box, Link, Typography } from '@mui/material'
import { isSameAddress, type EIP4361Message, type ParsedEIP4361Message } from '@masknet/web3-shared-base'
import { useInteractionWalletContext } from '../../pages/Wallet/Interaction/InteractionContext.js'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { TypedMessageTextRender } from '../../../../typed-message/react/src/Renderer/Core/Text.js'
import { Alert } from '@masknet/shared'
import { RenderFragmentsContext, type RenderFragmentsContextType } from '@masknet/typed-message-react'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        textAlign: 'center',
    },
    source: {
        padding: theme.spacing(1.25),
        border: `1px solid ${theme.palette.maskColor.line}`,
        marginTop: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.25),
        borderRadius: 8,
    },
    sourceText: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
    },
    messageTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: theme.spacing(3),
    },
    dangerField: {
        color: theme.palette.error.main,
    },
}))

interface SignRequestInfoProps {
    message: string | EIP4361Message | undefined
    rawMessage: string | object | undefined
    origin: string | undefined
}

// TODO: render typed sign
export const SignRequestInfo = memo<SignRequestInfoProps>(({ message, rawMessage, origin }) => {
    const t = useMaskSharedTrans()
    const { classes } = useStyles()

    const isEIP4361 = typeof message === 'object' && message.type === 'eip4361'

    let EIP4361Message
    let TextMessage
    if (isEIP4361) {
        TextMessage = message.message
        if (message.parsed) {
            if (!origin) throw new Error('EIP4361 message must have an origin')
            EIP4361Message = (
                <EIP4361Render invalidFields={message.invalidFields} message={message.parsed} messageOrigin={origin} />
            )
        } else {
            EIP4361Message = (
                <Alert className={classes.dangerField} open>
                    {t.popups_wallet_sign_in_message_invalid_eip4361()}
                </Alert>
            )
        }
    }
    if (!TextMessage && typeof message === 'string') TextMessage = message
    if (!TextMessage && typeof rawMessage === 'string') TextMessage = rawMessage

    return (
        <main className={classes.container}>
            <Typography className={classes.title}>
                {isEIP4361 ? t.popups_wallet_sign_in_message() : t.popups_wallet_signature_request_title()}
            </Typography>
            {origin ?
                <Box className={classes.source}>
                    <Typography fontSize={16} fontWeight={700}>
                        {t.popups_wallet_request_source()}
                    </Typography>
                    <Typography className={classes.sourceText}>{origin}</Typography>
                </Box>
            :   null}
            {EIP4361Message}
            <Typography className={classes.messageTitle}>{t.popups_wallet_sign_message()}</Typography>
            <Typography className={classes.sourceText} component={isEIP4361 ? 'details' : 'p'}>
                {TextMessage}
            </Typography>
            {rawMessage && message !== rawMessage ?
                <>
                    <Typography className={classes.messageTitle}>{t.popups_wallet_sign_raw_message()}</Typography>
                    <Typography className={classes.sourceText} component={isEIP4361 ? 'details' : 'p'}>
                        {typeof rawMessage === 'string' ? rawMessage : JSON.stringify(rawMessage, null, 2)}
                    </Typography>
                </>
            :   undefined}
        </main>
    )
})

interface EIP4361RenderProps {
    message: ParsedEIP4361Message
    invalidFields: Array<keyof ParsedEIP4361Message>
    messageOrigin: string
}

const TextFragmentRender: RenderFragmentsContextType = {
    Link: (props) => {
        return (
            <Link href={props.href} style={props.style} target="_blank">
                {props.children}
            </Link>
        )
    },
}

function EIP4361Render({ message, messageOrigin, invalidFields }: EIP4361RenderProps) {
    const {
        address,
        chainId,
        domain,
        expiration_time,
        nonce,
        issued_at,
        not_before,
        request_id,
        resources,
        statement,
        uri,
        version,
    } = message
    const t = useMaskSharedTrans()
    const { classes, cx } = useStyles()

    const { interactionWallet, setInteractionWallet } = useInteractionWalletContext()
    useEffect(() => {
        if (!isValidAddress(address)) return
        if (isSameAddress(address, interactionWallet)) return
        setInteractionWallet(address)
    }, [interactionWallet, address])

    // TODO: show warning for non https request
    const invalidDomain = invalidFields.includes('domain')
    const invalidVersion = invalidFields.includes('version')
    // TODO: invalid chainID
    const invalidChainId = invalidFields.includes('chainId')
    const invalidNotBefore = invalidFields.includes('not_before')
    const invalidExpirationTime = invalidFields.includes('expiration_time')

    const classesDangerTitle = cx(classes.messageTitle, classes.dangerField)
    const classesDangerField = cx([classes.sourceText, classes.dangerField])

    const normalFields = [
        <Fragment key="statement">
            <Typography className={classes.messageTitle}>{t.popups_wallet_signature_request_message()}</Typography>
            <Typography className={classes.sourceText}>
                {statement ?
                    <RenderFragmentsContext.Provider value={TextFragmentRender}>
                        <TypedMessageTextRender content={statement} serializable type="text" version={1} />
                    </RenderFragmentsContext.Provider>
                :   null}
            </Typography>
        </Fragment>,
        <Fragment key="uri">
            <Typography className={classes.messageTitle}>URI</Typography>
            <Typography className={classes.sourceText}>
                <RenderFragmentsContext.Provider value={TextFragmentRender}>
                    <TypedMessageTextRender content={uri} serializable type="text" version={1} />
                </RenderFragmentsContext.Provider>
            </Typography>
        </Fragment>,
        resources?.length ?
            <Fragment key="resources">
                <Typography className={classes.messageTitle}>{t.popups_wallet_sign_in_message_resource()}</Typography>
                <Typography className={classes.sourceText}>
                    <RenderFragmentsContext.Provider value={TextFragmentRender}>
                        <TypedMessageTextRender content={resources.join('\n')} serializable type="text" version={1} />
                    </RenderFragmentsContext.Provider>
                </Typography>
            </Fragment>
        :   null,
        <Fragment key="issuedAt">
            <Typography className={classes.messageTitle}>{t.popups_wallet_sign_in_message_issued_at()}</Typography>
            <Typography className={classes.sourceText}>{issued_at.toLocaleString()}</Typography>
        </Fragment>,
    ]
    const dangerFields = [
        invalidVersion ?
            <Fragment key="version">
                <Typography className={classesDangerTitle}>{t.popups_wallet_sign_in_message_version()}</Typography>
                <Typography className={classesDangerField}>{version}</Typography>
                <Alert className={classes.dangerField} open>
                    {t.popups_wallet_sign_in_message_version_invalid()}
                </Alert>
            </Fragment>
        :   null,
    ]

    const domainJSX = (
        <Fragment key="domainJSX">
            <Typography className={invalidDomain ? classesDangerTitle : classes.messageTitle}>
                {t.popups_wallet_sign_in_message_domain()}
            </Typography>
            <Typography className={invalidDomain ? classesDangerField : classes.sourceText}>{domain}</Typography>
            {invalidDomain ?
                <Alert className={classes.dangerField} open>
                    {t.popups_wallet_sign_in_message_domain_invalid({ messageOrigin, domain: message.domain })}
                </Alert>
            :   null}
        </Fragment>
    )
    if (invalidDomain) dangerFields.push(domainJSX)
    else normalFields.push(domainJSX)

    const chainID_JSX = (
        <Fragment key="chainID">
            <Typography className={invalidChainId ? classesDangerTitle : classes.messageTitle}>
                {t.chain_id()}
            </Typography>
            <Typography className={invalidChainId ? classesDangerField : classes.sourceText}>{chainId}</Typography>
            {invalidChainId ?
                <Alert className={classes.dangerField} open>
                    {t.popups_wallet_sign_in_message_chainID_invalid()}
                </Alert>
            :   null}
        </Fragment>
    )
    if (invalidChainId) dangerFields.push(chainID_JSX)
    else normalFields.push(chainID_JSX)

    const notBeforeJSX =
        not_before ?
            <Fragment key="notBefore">
                <Typography className={invalidNotBefore ? classesDangerTitle : classes.messageTitle}>
                    {t.popups_wallet_sign_in_message_not_before()}
                </Typography>
                <Typography className={invalidNotBefore ? classesDangerField : classes.sourceText}>
                    {not_before.toLocaleString()}
                </Typography>
                {invalidNotBefore ?
                    <Alert className={classes.dangerField} open>
                        {t.popups_wallet_sign_in_message_not_before_invalid()}
                    </Alert>
                :   null}
            </Fragment>
        :   null
    if (invalidNotBefore) dangerFields.push(notBeforeJSX)
    else normalFields.push(notBeforeJSX)

    const expirationTimeJSX =
        expiration_time ?
            <Fragment key="expirationTime">
                <Typography className={invalidExpirationTime ? classesDangerTitle : classes.messageTitle}>
                    {t.popups_wallet_sign_in_message_not_after()}
                </Typography>
                <Typography className={invalidExpirationTime ? classesDangerField : classes.sourceText}>
                    {expiration_time.toLocaleString()}
                </Typography>
                {invalidExpirationTime ?
                    <Alert className={classes.dangerField} open>
                        {t.popups_wallet_sign_in_message_expiration_time_invalid()}
                    </Alert>
                :   null}
            </Fragment>
        :   null
    if (invalidExpirationTime) dangerFields.push(expirationTimeJSX)
    else normalFields.push(expirationTimeJSX)

    const nonceJSX = (
        <Fragment key="nonce">
            <Typography className={classes.messageTitle}>{t.nonce()}</Typography>
            <Typography className={classes.sourceText}>{nonce}</Typography>
        </Fragment>
    )
    normalFields.push(nonceJSX)

    const request_id_JSX =
        request_id ?
            <Fragment key="request_id">
                <Typography className={classes.messageTitle}>{t.popups_wallet_sign_in_message_request_id()}</Typography>
                <Typography className={classes.sourceText}>{request_id}</Typography>
            </Fragment>
        :   null
    normalFields.push(request_id_JSX)

    return (
        <>
            {dangerFields}
            {normalFields}
        </>
    )
}
