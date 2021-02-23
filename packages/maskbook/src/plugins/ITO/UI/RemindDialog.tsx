import { Typography, Link, Checkbox, makeStyles, createStyles, FormControlLabel, Box } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import classNames from 'classnames'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TokenIcon } from '../../../extension/options-page/DashboardComponents/TokenIcon'
import { formatEthereumAddress } from '../../Wallet/formatter'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import type { ChainId } from '../../../web3/types'
import { ClaimStatus } from './ClaimGuide'
import { useState } from 'react'

const useStyles = makeStyles((theme) =>
    createStyles({
        reminderText: {
            color: '#FF5555',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
        },
        reminderTextLast: {
            marginBottom: 0,
        },
        docBox: {
            height: 280,
            overflow: 'scroll',
        },
        center: {
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
        },
        bigCenter: {
            fontSize: '1.5rem',
        },
        bold: {
            fontWeight: 'bold',
            fontSize: '1.1rem',
        },
        tokenWrapper: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(2),
            padding: '1rem 2rem',
            background: theme.palette.mode === 'dark' ? '#17191D' : '#F7F9FA',
            borderRadius: 15,
        },
        tokenIcon: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 39,
            height: 39,
        },
        tokenTextWrapper: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 45,
            marginLeft: '1rem',
        },
        tokenSymbol: {
            color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
            fontSize: 18,
            cursor: 'default',
        },
        tokenLink: {
            color: '#6F767C',
            fontSize: 15,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        comfirmWrapper: {
            marginTop: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
        },
        comfirmText: {
            color: '#6F767C',
        },
        button: {
            width: 'fit-content',
            margin: '0 auto',
            padding: '6px 48px',
        },
        table: {
            border: '1px solid #FF5555',
            color: '#FF5555',
        },
        cell: {
            width: '50%',
            border: '1px solid #FF5555',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
        },
        moreCell: {
            flexDirection: 'column',
        },
        column: {
            width: '100%',
            display: 'flex',
        },
        lowSpacing: {
            marginTop: 4,
            marginBottom: 4,
        },
    }),
)

export interface RemindDialogProps extends withClasses<'root'> {
    token: EtherTokenDetailed | ERC20TokenDetailed
    chainId: ChainId
    setStatus: (status: ClaimStatus) => void
    isMask: boolean
}

export function RemindDialog(props: RemindDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const { token, chainId, setStatus, isMask } = props

    const [agreeReminder, setAgreeReminder] = useState(false)

    return (
        <>
            {isMask ? (
                <Box className={classes.docBox}>
                    <Typography variant="body1" className={classes.reminderText}>
                        THE OFFER AND SALE OF THE INTERESTS DESCRIBED HEREUNDER HAS NOT BEEN REGISTERED UNDER THE U.S.
                        SECURITIES ACT OF 1933, AS AMENDED (THE “SECURITIES ACT”), OR UNDER THE SECURITIES LAWS OF ANY
                        STATE OR FOREIGN JURISDICTION. THIS OFFERING IS BEING MADE ONLY TO “ACCREDITED INVESTORS” (AS
                        DEFINED IN THE U.S. SECURITIES ACT AND ANY APPLICABLE STATE AND FOREIGN SECURITIES LAWS) IN
                        RELIANCE ON REGULATION D UNDER THE SECURITIES ACT. THE INTERESTS MAY NOT BE TRANSFERRED, PLEDGED
                        OR HYPOTHECATED EXCEPT AS PERMITTED UNDER THE U.S. SECURITIES ACT AND APPLICABLE STATE AND
                        FOREIGN SECURITIES LAWS.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        A PURCHASE OF THE INTERESTS INVOLVES A HIGH DEGREE OF RISK. YOU SHOULD CAREFULLY REVIEW THE
                        CONFIDENTIAL INFORMATION STATEMENT PROVIDED TO YOU IN CONNECTION HEREWITH, TOGETHER WITH ALL OF
                        THE OTHER INFORMATION CONTAINED IN THIS AGREEMENT, BEFORE MAKING A PURCHASE DECISION.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.center)}>
                        SUJITECH HOLDING LIMITED
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.center)}>
                        FUTURE TOKEN INTEREST SUBSCRIPTION AGREEMENT
                    </Typography>
                    <Box className={classes.table}>
                        <Box className={classes.column}>
                            <Box className={classes.cell}>
                                <Typography variant="body1" className={classNames(classes.reminderText)}>
                                    Number of Tokens Underlying Future Token Interests:
                                </Typography>
                            </Box>
                            <Box className={classes.cell}></Box>
                        </Box>
                        <Box className={classes.column}>
                            <Box className={classes.cell}>
                                <Typography variant="body1" className={classNames(classes.reminderText)}>
                                    Price Per Token (USD):
                                </Typography>
                            </Box>
                            <Box className={classNames(classes.cell, classes.moreCell)}>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.reminderText, classes.lowSpacing)}>
                                    Round 1: 1 Token = USD$0.85
                                </Typography>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.reminderText, classes.lowSpacing)}>
                                    Round 2: 1 Token = USD$0.90
                                </Typography>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.reminderText, classes.lowSpacing)}>
                                    Round 3: 1 Token = USD$0.95
                                </Typography>
                                <Typography
                                    variant="body1"
                                    className={classNames(classes.reminderText, classes.lowSpacing)}>
                                    LBP: Price as determined by the LBP
                                </Typography>
                            </Box>
                        </Box>
                        <Box className={classes.column}>
                            <Box className={classes.cell}>
                                <Typography variant="body1" className={classNames(classes.reminderText)}>
                                    Total Purchase Price:
                                </Typography>
                            </Box>
                            <Box className={classes.cell}></Box>
                        </Box>
                    </Box>
                    <Typography variant="body1" className={classes.reminderText}>
                        THIS CERTIFIES THAT in exchange for the payment by the undersigned purchaser (the “Purchaser”)
                        of the Total Purchase Price set forth above on or about the date (the “Effective Date”)
                        indicated under the Company signature hereto, Sujitech Holding Limited, a Cayman Islands company
                        (the “Company”), hereby issues to the Purchaser the right (the “Future Token Interest” and,
                        collectively with any securities received in substitution or fulfillment of the Future Token
                        Interest, or in replacement of the Future Token Interest, as may be applicable, the “Interests”)
                        to receive, automatically and without requiring any future payment, a number of Tokens (as
                        defined below) equal to the Number of Tokens Underlying Future Token Interests set forth above,
                        subject to the terms set forth below.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        1. OFFERING
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        1.1 This Future Coin Interest Subscription Agreement (“TSA”) is issued by the Company in
                        connection with the offering (“Offering”) of Future Token Interests by the Company via a series
                        of agreements on substantially similar terms to this TSA (collectively, the “TSAs”). Purchaser
                        acknowledges that TSAs may be issued in a series of multiple closings to certain qualified
                        persons and entities, all as determined from time to time by the Company in its sole discretion.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        2. OFFER AND SALE
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        2.1 Purchaser Qualification. Purchaser acknowledges and agrees that it is required to meet
                        certain requirements in order to participate in this Offering, including the Purchaser’s
                        qualification as an accredited investor and compliance with this TSA. Purchaser acknowledges and
                        agrees that, in the event the Company determines that Purchaser does not meet the Company’s
                        requirements for purchasers hereunder (as determined by the Company in its sole discretion), the
                        Company may immediately and without notice rescind or terminate, as applicable, this TSA, the
                        Future Token Interests and the Tokens, notwithstanding Purchaser’s compliance with this TSA,
                        delivery of the Total Purchase Price to the Company, or that the Company may have delivered a
                        signature page to this TSA.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        2.2 Payment. Purchaser covenants and agrees to pay the Total Purchase Price to the Company on or
                        about the Effective Date, and in any case no later than three (3) business days after the
                        Effective Date. Purchaser acknowledges and agrees that the Company may, in its sole discretion
                        and without notice, rescind or terminate, as applicable, this TSA, the Future Token Interests
                        and the Tokens in the event that Purchaser does not deliver to the Company its signature page or
                        voluntary consent to this TSA or the Total Purchase Price, in each case within three (3)
                        business days of the Effective Date.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        2.3 Form of Payment. The Company agrees to accept payment for the Total Purchase Price in Tether
                        (USDT), USD Coin (USDC), DAI (DAI), Binance USD (BUSD), Huobi USD (USD) and Ether (ETH).
                        Purchasers may convert Bitcoin (BTC) or other cryptocurrencies into the froms of payment set
                        forth above at the point of sale and pay on an as-converted basis; provided that the Company may
                        elect to accept other forms of payment on an as-converted basis in its sole discretion. The
                        exchange rate for BTC or any other forms of payment shall be determined solely by the Company or
                        its assignee or agent in accordance with reasonable and accepted market practices and additional
                        transaction fees may apply.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        3. TOKEN DELIVERY
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        3.1 Delivery. Subject to the terms and conditions set forth herein, the Company, its agents or
                        representatives shall deliver to the Purchaser, in full satisfaction of this TSA, the Number of
                        Tokens Underlying Future Token Interests as soon as the closing the Offering (the “Token
                        Delivery”).
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        3.2 Conditions to Token Delivery. In connection with, as a condition to, and prior to the
                        delivery of Tokens by the Company to the Purchaser pursuant to Section 3.1, and in each case
                        unless waived in writing by the Company:
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        3.2.1 The Purchaser will execute and deliver to the Company any and all other transaction
                        documents related to this TSA as are reasonably requested by the Company, including
                        documentation to verify Purchaser’s status as an “accredited investor” (as defined in Regulation
                        D promulgated under the U.S. Securities Act, or to verify non-U.S. person status under the
                        applicable securities laws);
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        3.2.2 The Purchaser will provide to the Company, in writing, a network wallet address (“Wallet”)
                        to which the Purchaser’s Tokens will be delitrvered; and
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        3.2.3 The Purchaser will complete and deliver all AML and KYC Forms (as defined below) requested
                        by the Company.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        3.3 Lockup. Purchaser agrees that it will not, at any time prior to the date of Liquidity Pool
                        Launch (“Liquidty Pool Launch”), transfer any Tokens, any options to purchase any Tokens, or any
                        instruments convertible into, exchangeable for, or that represent the right to receive Tokens,
                        including this TSA and the Future Token Interests hereunder.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        4. DEFINITIONS
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        4.1 “AML and KYC Forms” means any and all forms, documents, processes and procedures, including,
                        for the avoidance of doubt, any electronic verification system or process, which the Company
                        determines, in its sole discretion, are reasonably necessary for the Company to comply with
                        applicable Money Laundering Laws and “Know Your Customer” policies required by the Company.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        4.2 “MASKs” or “Tokens” means the native unit of value as set forth in the Offering Documents of
                        the Company.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        4.3 “Governmental Authority” means any nation or government, any state or other political
                        subdivision thereof, any entity exercising legislative, judicial or administrative functions of
                        or pertaining to government, including, without limitation, any government authority, agency,
                        department, board, commission or instrumentality, and any court, tribunal or arbitrator(s) of
                        competent jurisdiction, and any self-regulatory organization.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        4.4 “Money Laundering Laws” means the applicable laws, rules and regulations of all
                        jurisdictions in which the Purchaser is located, resident, organized or operates concerning or
                        related to anti-money laundering, including but not limited to those contained in the Bank
                        Secrecy Act of 1970 and the Uniting and Strengthening America by Providing Appropriate Tools
                        Required to Intercept and Obstruct Terrorism Act of 2001 (the “Patriot Act”), each as amended
                        and including the rules and regulations thereunder, and any related or similar rules,
                        regulations or guidelines, issued, administered or enforced by any Governmental Authority.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        4.5 “Liquity Pool Launch” means the provision of liquity on Uniswap by the Company, from when
                        users may transfer and exchange Tokens in accordance with the Offering Documents, as determined
                        by the Company in its sole discretion.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        4.6 “Person” means any individual or legal entity, including a government or political
                        subdivision or an agency or instrumentality thereof.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        4.7 “Network” means the decentralized social network platform as described in the Offering
                        Documents of the Company as amended from time to time and available at
                        https://masknetwork.medium.com (the “Offering Documents”).
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        4.8 “Transfer” means, with respect to any instrument, the direct or indirect assignment, sale,
                        transfer, tender, pledge, hypothecation, or the grant, creation or suffrage of a lien or
                        encumbrance in or upon, or the gift, placement in trust, or other disposition of such instrument
                        or any right, title or interest therein, or the record or beneficial ownership thereof, the
                        offer to make such a sale, transfer or other disposition, and each agreement, arrangement or
                        understanding, whether or not in writing, to effect any of the foregoing.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        5. PURCHASER REPRESENTATIONS
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        5.1 Authorization. The Purchaser has full legal capacity, power and authority to enter into this
                        TSA. This TSA, when executed and delivered by the Purchaser, will constitute valid and legally
                        binding obligations of the Purchaser, enforceable in accordance with their terms, except as
                        limited by applicable bankruptcy, insolvency, reorganization, moratorium, fraudulent conveyance,
                        and any other laws of general application affecting enforcement of creditors’ rights generally,
                        and as limited by laws relating to the availability of specific performance, injunctive relief,
                        or other equitable remedies.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.2 Purchase Entirely for Own Account. This TSA is made with the Purchaser in reliance upon the
                        Purchaser’s representation to the Company, which by the Purchaser’s execution of this TSA, the
                        Purchaser hereby confirms, that the Interests to be acquired by the Purchaser will be acquired
                        for investment for the Purchaser’s own account, not as a nominee or agent, and not with a view
                        to the resale or for the resale in connection with, the distribution any part thereof, and that
                        the Purchaser has no present intention of selling, granting any participation in, or otherwise
                        distributing the same. By executing this TSA, the Purchaser further represents that the
                        Purchaser does not presently have any contract, undertaking, agreement or arrangement with any
                        Person to sell, Transfer or grant participations to such Person or to any third Person, with
                        respect to any of the Interests. The Purchaser has not been formed for the specific purpose of
                        acquiring the Interests.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.3 The Purchaser has sufficient knowledge of and experience in business and financial matters
                        to be able to evaluate the risks and merits of its purchase of this TSA and of the Interests, is
                        able to incur a complete loss thereof without impairing the Purchaser’s financial condition and
                        is able to bear the risks thereof for an indefinite period of time. The Purchaser is aware of
                        Company’s business and management affairs and financial condition and has acquired sufficient
                        information about the Company to reach an informed and knowledgeable decision in relation to
                        this TSA and the Interests, including but not limited to the terms and conditions of the
                        offering. The Purchaser understands and expressly accepts that the Interests will be created and
                        delivered to the Purchaser at the sole risk of the Purchaser on an “AS IS” and “UNDER
                        DEVELOPMENT” basis. The Purchaser understands and expressly accepts that the Purchaser has not
                        relied on any representations or warranties made by the Company outside of this instrument,
                        including, but not limited to, conversations of any kind, whether through oral or electronic
                        communication, or any offering documents.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.4 The Purchaser understands that the Interests have not been, and will not be, registered
                        under the U.S. Securities Act or any applicable state or foreign securities laws, by reason of a
                        specific exemption from the registration provisions of the Securities Act and other applicable
                        state securities laws which depends upon, among other things, the bona fide nature of the
                        investment intent and the accuracy of the Purchaser’s representations as expressed herein. The
                        Purchaser understands that the Interests may be deemed “restricted securities” under applicable
                        United States federal and state securities laws and that, pursuant to these laws, the Purchaser
                        must hold the Interests indefinitely unless they are registered with the Securities and Exchange
                        Commission and qualified by state authorities, or an exemption from such registration and
                        qualification requirements is available. The Purchaser acknowledges that the Company has no
                        obligation to register or qualify the Interests for resale, and exemptions from registration and
                        qualification may not be available or may not permit the Purchaser to transfer all or any of the
                        Interests in the amounts or at the times proposed by the Purchaser. The Purchaser further
                        acknowledges that if an exemption from registration or qualification is available, it may be
                        conditioned on various requirements including, but not limited to, the time and manner of sale,
                        the holding period for the Interests, and on requirements relating to the Company which are
                        outside of the Purchaser’s control, and which the Company is under no obligation and may not be
                        able to satisfy.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        5.5 No Public Market. The Purchaser understands that no public market now exists for the
                        Interests, and that the Company has made any assurances that a public market will ever exist for
                        the Interests and the Company is under no obligation to register or qualify the Interests under
                        the laws of any Governmental Authority.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.6 Accredited Investor. Purchaser is an accredited investor as defined in the U.S. Securities
                        Act (i.e., Rule 501(a) of Regulation D promulgated under the Securities Act) and any applicable
                        state and foreign securities laws. The Purchaser has accurately and completely completed the
                        accredited investor verification process.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.7 Waiver of Warranties; Assumption of Risks. THE RISK OF LOSS IN BUYING, HOLDING AND TRADING
                        DIGITAL ASSETS AND RIGHTS THEREIN, INCLUDING THE INTERESTS, CAN BE IMMEDIATE AND SUBSTANTIAL.
                        THERE IS NO GUARANTEE AGAINST LOSSES FROM PARTICIPATING IN THE OFFERING. PURCHASER SHOULD
                        THEREFORE CAREFULLY CONSIDER WHETHER TRADING OR HOLDING VIRTUAL CURRENCY IS SUITABLE FOR THE
                        PURCHASER IN LIGHT OF ITS FINANCIAL CONDITION. Purchaser acknowledges that it has carefully read
                        and reviewed the offering documents provided to the Purchaser in connection herewith. Purchaser
                        understands that the Interests involve risks, all of which the Purchaser fully and completely
                        assumes, including, but not limited to, the risks that (i) the technology and economic models
                        associated with the Network will not function as intended; (ii) the Network will fail to attract
                        sufficient interest from users; and (iii) the Company, the Network and/or third parties involved
                        in the development of the Network may be subject to investigation and punitive actions from
                        Governmental Authorities; as well as certain other risks as detailed in that certain
                        Confidential Information Statement provided to the Purchaser in connection herewith. Purchaser
                        understands and expressly accepts that the Tokens will be created and delivered to the Purchaser
                        at the sole risk of the Purchaser on an “AS IS” and “UNDER DEVELOPMENT” basis. THE COMPANY MAKES
                        NO WARRANTY WHATSOEVER WITH RESPECT TO THE TOKENS, INCLUDING ANY (i) WARRANTY OF
                        MERCHANTABILITY; (ii) WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE; (iii) WARRANTY OF TITLE; OR
                        (iv) WARRANTY AGAINST INFRINGEMENT OF INTELLECTUAL PROPERTY RIGHTS OF A THIRD PARTY; WHETHER
                        ARISING BY LAW, COURSE OF DEALING, COURSE OF PERFORMANCE, USAGE OF TRADE, OR OTHERWISE. EXCEPT
                        AS EXPRESSLY SET FORTH HEREIN, PURCHASER ACKNOWLEDGES THAT IT HAS NOT RELIED UPON ANY
                        REPRESENTATION OR WARRANTY MADE BY THE COMPANY, OR ANY OTHER PERSON ON THEIR BEHALF. WITHOUT
                        LIMITING THE GENERALITY OF THE FOREGOING, PURCHASER ASSUMES ALL RISKS AND LIABILITIES FOR THE
                        RESULTS OBTAINED BY THE USE OF ANY TOKENS AND REGARDLESS OF ANY ORAL OR WRITTEN STATEMENTS MADE
                        BY THE COMPANY, BY WAY OF TECHNICAL ADVICE OR OTHERWISE, RELATED TO THE USE OF THE TOKENS.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.8 Other Applicable Law. Purchaser represents that it has satisfied itself as to the full
                        observance of the laws of its jurisdiction in connection with the purchase of the Interests,
                        including (a) the legal requirements within the Purchaser’s jurisdiction for the purchase of the
                        Interests, (b) any foreign exchange restrictions applicable to such purchase, (c) any
                        governmental or other consents that may need to be obtained, and the income tax and other tax
                        consequences, if any, that may be relevant to the purchase, holding, redemption, sale, or
                        transfer of the Interests. The Purchaser’s purchase and payment for and continued beneficial
                        ownership of the Interests will not violate any applicable laws of the Purchaser’s jurisdiction.
                        The Purchaser understands that Purchaser bears sole responsibility for any taxes as a result of
                        the matters and transactions the subject of this instrument, and any future acquisition,
                        ownership, use, sale or other disposition of Tokens held by the Purchaser.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        5.9 OFAC. Neither the Purchaser, nor, if applicable, any of its affiliates or direct or indirect
                        beneficial owners; (i) appears on the Specially Designated Nationals and Blocked Persons List of
                        the Office of Foreign Assets Control of the United States Department of the Treasury (“OFAC”),
                        nor are they otherwise a party with which the Company is prohibited to deal under the laws of
                        the United States; (ii) is a person identified as a terrorist organization on any other relevant
                        lists maintained by any Governmental Authority; or (iii) unless otherwise disclosed in writing
                        to the Company prior to the date of this Agreement, is a senior foreign political figure, or any
                        immediate family member or close associate of a senior foreign political figure. The Purchaser
                        further represents and warrants that, if applicable, the Purchaser: (a) has conducted thorough
                        due diligence with respect to all of its beneficial owners; (b) has established the identities
                        of all direct and indirect beneficial owners and the source of each beneficial owners’ funds;
                        and (c) will retain evidence of those identities, any source of funds and any due diligence.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.10 Sources and Uses of Funds. The Purchaser further represents, warrants and agrees as
                        follows:
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.10.1 No payment or other transfer of value to the Company and no payment or other transfer of
                        value to the Company shall cause the Company to be in violation of applicable U.S. federal or
                        state or non-U.S. laws or regulations, including, without limitation, anti-money laundering,
                        economic sanctions, anti-bribery or anti-boycott laws or regulations, the Patriot Act, or the
                        various statutes, regulations and executive orders administered by OFAC (“OFAC Regulations”).
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.10.2 No payment or other transfer of value to the Company is or will be derived from, pledged
                        for the benefit of, or related in any way to, (i) the government of any country designated by
                        the U.S. Secretary of State or other Governmental Authority as a country supporting
                        international terrorism,
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        (ii) property that is blocked under any OFAC Regulations or that would be blocked under OFAC
                        Regulations if it were in the custody of a U.S. national, (iii) persons to whom U.S. nationals
                        cannot lawfully export services, or with whom U.S. nationals cannot lawfully engage in
                        transactions under OFAC Regulations, (iv) the government of any country that has been designated
                        as a non- cooperative country or designated by the U.S. Secretary of the Treasury or other
                        Governmental Authority as a money laundering jurisdiction or (v) directly or indirectly, any
                        illegal activities. The Purchaser acknowledges that Money Laundering Laws may require the
                        Company to collect documentation verifying the identity and the source of funds used to acquire
                        the Interests before, and from time to time after, the date of this Agreement.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.10.3 All payments or other transfer of value to the Company by the Purchaser will be made
                        through an account (or virtual currency public address whose associated balance, either directly
                        or indirectly, has been funded by such an account) located in a jurisdiction that does not
                        appear on the list of boycotted countries published by the U.S. Department of Treasury pursuant
                        to § 999(a)(3) of the Code as in effect at the time of the payment or other transfer of value.
                        In the event that the Purchaser is, receives deposits from, makes payments to or conducts
                        transactions relating to a non-U.S. banking institution (a “Non-U.S. Bank”) in connection with
                        the acquisition of the Interests, the Non-U.S. Bank: (i) has a fixed address, other than an
                        electronic address or a post office box, in a country in which it is authorized to conduct
                        banking activities, (ii) employs one or more individuals on a full-time basis, (iii) maintains
                        operating records related to its banking activities, (iv) is subject to inspection by the
                        banking authority that licensed it to conduct banking activities and (v) does not provide
                        banking services to any other Non-U.S. Bank that does not have a physical presence in any
                        country and that is not a registered affiliate.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.11 Additional Information. The Purchaser will provide to the Company any information that the
                        Company from time to time determines to be necessary or appropriate (a) to comply with Money
                        Laundering Laws, anti-terrorism laws, rules and regulations and or any similar laws and
                        regulations of any applicable jurisdiction and (b) to respond to requests for information
                        concerning the identity and or source of funds of the Purchaser from any Governmental Authority,
                        self-regulatory organization or financial institution in connection with its anti-money
                        laundering compliance procedures, or to update that information. The Purchaser understands and
                        acknowledges that the Company may be required to report any action or failure to comply with
                        information requests and to disclose the identity to Governmental Authorities, self-regulatory
                        organizations and financial institutions, in certain circumstances without notifying the
                        Purchaser that the information has been so provided. The Purchaser further understand and agrees
                        that any failure on its part to comply with this Section 5.13 would allow the Company to
                        terminate this TSA and require the forfeiture of any Tokens previously delivered to the
                        Purchaser.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        5.12 Suspicious Activity Reports. The Purchaser acknowledges and agrees that the Company, in
                        complying with anti-money laundering statutes, regulations and goals, may file voluntarily or as
                        required by law, a suspicious activity report (“SAR”) or any other information with governmental
                        and law enforcement agencies that identify transactions and activities that the Company
                        reasonably determines to be suspicious, or is otherwise required by law. The Purchaser
                        acknowledges that the Company is prohibited by law from disclosing to third parties, including
                        the Purchaser, any SAR filing itself or the fact that a SAR has been filed.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        5.13 Voluntary Compliance. The Purchaser understands and agrees that, even if the Company is not
                        obligated to comply with any U.S. anti-money laundering requirements, the Company may
                        nevertheless choose to voluntarily comply with such requirements as the Company deems
                        appropriate in its sole discretion. The Purchaser agrees to cooperate with the Company as may be
                        required in the reasonable opinion of the Company in connection with such compliance.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        6. DISCLAIMERS
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        6.1 Wallet. You assume full responsibility and liability for any losses resulting from any
                        intentional or unintentional misuse or your Wallet. The Company assumes no responsibility or
                        liability in connection with any such misuse.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        6.2 Indemnity. THE COMPANY SHALL NOT BE LIABLE TO THE PURCHASER, AND THE PURCHASER AGREES TO
                        INDEMNIFY, DEFEND AND HOLD HARMLESS THE COMPANY, ITS AFFILIATES, EMPLOYEES, AGENTS (INCLUDING
                        ADVISORS, AUDITORES, DEVELOPERS, CONTRACTORS OR FOUNDERS), THE SUCCESSORS AND ASSIGNS OF THE
                        FOREGOING, FROM AND AGAINST, ALL OR ANY PART OF ANY THIRD PARTY CAUSES OF ACTION, CLAIMS,
                        LIABILITIES, LOSSES, COSTS, DAMAGES AND EXPENSES (INCLUDING, WITHOUT LIMITATION, ATTORNEYS’ FEES
                        AND EXPENSES) (COLLECTIVELY “CLAIMS”) FOR DAMAGES TO OR LOSS OF PROPERTY ARISING OUT OF OR
                        RESULTING FROM THE TRANSACTIONS CONTEMPLATED HEREIN, EXCEPT TO THE EXTENT SUCH CLAIMS ARISE FROM
                        THE BAD FAITH OR INTENTIONAL MISCONDUCT OF THE COMPANY. To the extent permitted by law, the
                        Purchaser further agrees to indemnify, defend and hold the Company or any of its affiliates,
                        employees or agents (including developers, auditors, contractors or founders) harmless for any
                        claim, liability, assessment or penalty with respect to any taxes (other than any net income
                        taxes of the Company that result from the issuance of Tokens to the Purchaser pursuant to
                        Section 1(a) of the instrument) associated with or arising from the Purchaser’s purchase of
                        Tokens hereunder, or the use or ownership of Tokens.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        6.3 Limitation of Liability. The Purchaser understands that Purchaser has no right against the
                        Company or any other Person except in the event of the Company’s breach of this instrument or
                        intentional fraud. NEITHER THE COMPANY, NOR ANY OTHER PARTY INVOLVED IN THE OFFERING WILL BE
                        LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR ENHANCED
                        DAMAGES, OR DAMAGES FOR LOST PROFITS, LOST REVENUES, LOST SAVINGS, LOST BUSINESS OPPORTUNITY,
                        LOSS OF DATA OR GOODWILL, DIMINUTION IN VALUE, SERVICE INTERRUPTION, COMPUTER DAMAGE OR SYSTEM
                        FAILURE OR THE COST OF SUBSTITUTE ACTIVITIES OF ANY KIND ARISING OUT OF OR IN CONNECTION WITH
                        THIS TSA OR THE PURCHASER’S PARTICIPATION IN, OR INABILITY TO PARTICIPATE IN, THE OFFERING,
                        WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY OR ANY OTHER
                        LEGAL THEORY, AND WHETHER OR NOT THE COMPANY OR ANY OTHER PARTY HAS BEEN INFORMED OF THE
                        POSSIBILITY OF SUCH DAMAGE, EVEN IF A LIMITED REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF
                        ITS ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY
                        FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATION MAY NOT APPLY. IN NO EVENT WILL
                        THE COMPANY’S TOTAL LIABILITY TO THE PURCHASER ARISING OUT OF OR IN CONNECTION WITH THIS TSA OR
                        FROM THE PURCHASER’S PARTICIPATION IN, OR INABILITY TO PARTICIPATE IN, THE OFFERING EXCEED THE
                        TOTAL AMOUNTS PAID TO THE COMPANY (AS DENOMINATED IN USD). THE EXCLUSIONS AND LIMITATIONS OF
                        DAMAGES SET FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN BETWEEN THE COMPANY
                        AND THE PURCHASER.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        6.4 Class Action Waiver. Any claim or dispute arising under this TSA will take place on an
                        individual basis without resort to any form of class or representative action (the “Class Action
                        Waiver”). THIS CLASS ACTION WAIVER PRECLUDES ANY PARTY FROM PARTICIPATING IN OR BEING
                        REPRESENTED IN ANY CLASS OR REPRESENTATIVE ACTION REGARDING A CLAIM. Regardless of anything else
                        in this TSA to the contrary, the validity and effect of the Class Action Waiver may be
                        determined only by a court or referee and not by an arbitrator, and Purchaser acknowledges that
                        this Class Action Waiver is material and essential to the arbitration of any disputes between
                        the parties and is non-severable from this TSA.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.bold)}>
                        7. MISCELLANEOUS
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        7.1 Entire Agreement. This TSA sets forth the entire agreement and understanding of the parties
                        relating to the subject matter herein and supersedes all prior or contemporaneous disclosures,
                        discussions, understandings and agreements, whether oral of written, between them. This TSA is
                        one of a series of similar agreements entered into by the Company from time to time. Any
                        provision of this TSA may be amended, waived or modified only upon the written consent of the
                        Company and the holders of a majority, in the aggregate, of the Total Purchase Price paid to the
                        Company with respect to all TSAs outstanding at the time of such amendment, waiver or
                        modification.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        7.2 Notices. Any notice required or permitted by this TSA will be deemed sufficient when sent by
                        email to the relevant address listed on the signature page hereto, as subsequently modified by
                        written notice received by the appropriate party.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        7.3 No Rights as Stockholder. The Purchaser is not entitled, as a holder of this TSA, the Future
                        Token Interests or the Tokens, to vote or receive dividends or be deemed an equityholder of the
                        Company for any purpose, nor will anything contained herein be construed to confer on the
                        Purchaser, as such, any of the rights of an equityholder or any right to vote for the election
                        of directors or upon any matter submitted to the board of directors at any meeting thereof, or
                        to give or withhold consent to any corporate action or to receive notice of meetings, or to
                        receive subscription rights or otherwise.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        7.4 Transfers and Assigns. Neither this TSA nor the rights contained herein may be Transferred,
                        by operation of law or otherwise, by the Purchaser without the prior written consent of the
                        Company. The Company may assign this TSA without the consent of the Purchaser.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        7.5 Severability. In the event any one or more of the provisions of this TSA is for any reason
                        held to be invalid, illegal or unenforceable, in whole or in part or in any respect, or in the
                        event that any one or more of the provisions of this TSA operate or would prospectively operate
                        to invalidate this TSA, then and in any such event, such provision(s) only will be deemed null
                        and void and will not affect any other provision of this TSA and the remaining provisions of
                        this TSA will remain operative and in full force and effect and will not be affected,
                        prejudiced, or disturbed thereby.
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText)}>
                        This TSA and any action related thereto will be governed by the laws of Singapore without regard
                        to its conflicts of law rules. Any dispute, controversy, difference or claim arising out of or
                        relating to this contract, including the existence, validity, interpretation, performance,
                        breach or termination thereof or any dispute regarding non-contractual obligations arising out
                        of or relating to it shall be referred to and finally resolved by arbitration administered by
                        the International Chamber of Commerce (“ICC”) International Court of Arbitration in Singapore in
                        accordance with ICC Arbitration Rules in force at the time of submission of Notice of
                        Arbitration. The seat of arbitration shall be Singapore. The number of arbitrators shall be
                        three. The arbitration proceedings shall be conducted in English.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        7.7 Additional Assurances. The Purchaser shall, and shall cause its affiliates to, from time to
                        time, execute and deliver such additional documents, instruments, conveyances and assurances and
                        take such further actions as may be reasonably requested by Company or are necessary for the
                        Company, upon the advice of counsel, to carry out the provisions of this TSA and give effect to
                        the transactions contemplated hereby, including, without limitation, to enable the Company to
                        register the Interests, to enable the Interests to qualify for or maintain an exemption from
                        registration (to the extent any such exemptions are available), to comply with Money Laundering
                        Laws, or to otherwise complete the transactions contemplated hereby and to comply with
                        applicable laws as then in effect.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        7.8 Force Majeure. Without limitation of anything else in this TSA, the Company shall not be
                        liable or responsible to the Purchaser, nor be deemed to have defaulted under or breached this
                        TSA, for any failure or delay in fulfilling or performing any term of this instrument, including
                        without limitation, launching the Network and delivering the Tokens, when and to the extent such
                        failure or delay is caused by or results from acts beyond the affected party’s reasonable
                        control, including, without limitation: (a) acts of God; (b) flood, fire, earthquake or
                        explosion; (c) war, invasion, hostilities (whether war is declared or not), terrorist threats or
                        acts, or other civil unrest; (d) changes to applicable law; or (e) action by any Governmental
                        Authority.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        THIS CONFIDENTIAL INFORMATION STATEMENT, THE INFORMATION PROVIDED HEREIN AND ANY ADDITIONAL
                        INFORMATION OR MATERIALS PROVIDED TO YOU IN CONNECTION HEREWITH OR THE CONTEMPLATED SALE AND ANY
                        ADDITIONAL COMMUNICATIONS RELATED TO THE CONTEMPLATED OFFERING ARE CONFIDENTIAL. BY ACCEPTING
                        THESE DOCUMENTS, YOU AGREE TO HOLD THEM IN CONFIDENCE AND KEEP THEM CONFIDENTIAL. YOU CAN
                        DISCUSS THE INFORMATION CONTAINED IN THIS DOCUMENT WITH YOUR LEGAL, TAX OR INVESTMENT ADVISORS
                        AS DESCRIBED BELOW. YOU MAY NOT COPY THIS DOCUMENT (EXCEPT THAT YOU MAY MAKE COPIES FOR YOUR
                        ADVISORS). YOU MAY USE THIS DOCUMENT ONLY TO EVALUATE THE CONTEMPLATED OFFERING. WE ARE NOT
                        GIVING YOU ANY LEGAL, TAX OR INVESTMENT ADVICE. YOU SHOULD CONSULT YOUR OWN ADVISORS FOR SUCH
                        ADVICE.
                    </Typography>
                    <Typography
                        variant="body1"
                        className={classNames(classes.reminderText, classes.center, classes.bigCenter)}>
                        SUJITECH HOLDING LIMITED
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.center)}>
                        Confidential Information Statement
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.center)}>
                        RIGHT TO MASK TOKENS
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        This Confidential Information Statement (this “Information Statement”) has been prepared by
                        Sujitech Holding Limited, a Cayman Islands company (the “Company”), for use by certain
                        prospective purchasers, to whom the Company is offering (the “Offering”) the opportunity to
                        purchase rights (“Future Token Interests”) to tokens (“Tokens”), the native unit of value as set
                        forth in the Offering Documents of the Company, to be developed and initiated by the Company.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        The Mask Network has not launched, and Tokens do not currently exist. No public market for the
                        Future Token Interests or the Tokens currently exists.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        The Future Token Interests and the Tokens may be subject to restrictions on transferability and
                        resale and generally may not be transferred or resold except as specified herein and in the
                        applicable Offering Document. Purchasers of Future Token Interests (each, a “Purchaser” and
                        collectively, the “Purchasers”) should be aware that they will be required to bear the financial
                        risks of this purchase for an indefinite period of time.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        Unless otherwise indicated herein, all references to the number of Tokens set forth in this
                        Information Statement refers to the number of Tokens in the Offering Documents of the Company.
                        The actual number of Tokens may be subject to change from time to time and at any time via any
                        forward split, reverse split, combination of Tokens or other similar events.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        Purchases may be made in U.S. dollars, USD Coin (USDC), Bitcoin (BTC) or Ether (ETH); provided
                        that the Company may elect to accept other forms of payment on an as-converted to U.S. dollars
                        basis in its sole discretion. The U.S. dollar exchange rate for BTC or any other forms of
                        payment shall be determined solely by the Company or its assignee or agent in accordance with
                        reasonable and accepted market practices. Such currencies are subject to fluctuations in the
                        rate of exchange and, in the case of digital assets, the exchange valuations. Such fluctuations
                        may have an adverse effect on the value, price or income of a purchase.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        NEITHER THE FUTURE TOKEN INTERESTS NOR ANY SECURITIES RECEIVED (IF ANY) IN SUBSTITUTION OR
                        FULFILLMENT OF THE FUTURE TOKEN INTERESTS, OR IN REPLACEMENT OF THE FUTURE TOKEN INTERESTS, AS
                        MAY BE APPLICABLE (COLLECTIVELY, THE “INTERESTS”) HAVE BEEN NOR WILL BE REGISTERED UNDER THE
                        U.S. SECURITIES ACT OF 1933, AS AMENDED (THE “SECURITIES ACT”), OR ANY STATE OR FOREIGN
                        SECURITIES LAW OR REGULATION GOVERNING THE OFFERING, SALE OR EXCHANGE OF SECURITIES IN THE
                        UNITED STATES OR ANY OTHER JURISDICTION. THIS OFFERING IS BEING MADE ONLY TO “ACCREDITED
                        INVESTORS” (AS DEFINED IN SECTION 501 OF THE U.S. SECURITIES ACT) IN RELIANCE ON REGULATION D
                        UNDER THE U.S. SECURITIES ACT.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        THE FUTURE TOKEN INTERESTS ARE BEING OFFERED AND WILL BE OFFERED FOR SALE ONLY IN THOSE
                        JURISDICTIONS WHERE SUCH OFFER AND SALE IS PERMITTED UNDER APPLICABLE LAW.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        THE COMPANY WILL NOT BE REQUIRED TO, NOR DOES THE COMPANY CURRENTLY INTENDS TO, OFFER TO
                        EXCHANGE THE INTERESTS FOR ANY SECURITIES REGISTERED UNDER THE SECURITIES ACT OR ANY OTHER LAW,
                        OR REGISTER THE INTERESTS FOR RESALE UNDER THE SECURITIES ACT.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        NO GOVERNMENTAL AUTHORITY OR ANY OTHER JURISDICTION HAS PASSED JUDGMENT UPON OR APPROVED THE
                        TERMS OR MERITS OF THIS DOCUMENT.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        A purchase of the Future Token Interests involves a high degree of risk, volatility and
                        illiquidity. A prospective purchaser should thoroughly review the confidential information
                        contained herein and the terms of the applicable Offering Documents, and carefully consider
                        whether a purchase of the Future Token Interests is suitable to its financial situation and
                        goals.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        No person has been authorized to make any statement concerning the Company or the sale of the
                        Future Token Interests discussed herein other than as set forth in the applicable Offering
                        Documents, and any such statements, if made, must not be relied upon.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        Investors should make their own investigations and evaluations of the Tokens that will be
                        delivered pursuant thereto, including the merits and risks involved in an investment therein.
                        Prior to any investment, the Company will give investors the opportunity to ask questions of and
                        receive answers and additional information from it concerning the terms and conditions of this
                        offering and other relevant matters to the extent the Company possesses the same or can acquire
                        it without unreasonable effort or expense. Investors should inform themselves as to the legal
                        requirements applicable to them in respect of the acquisition, holding and disposition of the
                        Tokens upon their delivery, and as to the income and other tax consequences to them of such
                        acquisition, holding and disposition.
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        Neither the U.S. Securities and Exchange Commission nor any state or foreign securities
                        authorities has approved or disapproved of this offering or passed upon the adequacy or accuracy
                        of the information herein. Any representation to the contrary is a criminal offense.
                    </Typography>
                </Box>
            ) : (
                <Box className={classes.docBox}>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_reminder_text1')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_reminder_text2')}
                    </Typography>
                    <Typography variant="body1" className={classes.reminderText}>
                        {t('plugin_ito_dialog_claim_reminder_text3')}
                    </Typography>
                    <Typography variant="body1" className={classNames(classes.reminderText, classes.reminderTextLast)}>
                        {t('plugin_ito_dialog_claim_reminder_text4')}
                    </Typography>
                </Box>
            )}

            <section className={classes.tokenWrapper}>
                <TokenIcon address={token.address} classes={{ icon: classes.tokenIcon }} />
                <div className={classes.tokenTextWrapper}>
                    <Typography variant="h5" className={classes.tokenSymbol}>
                        {token.name}
                    </Typography>

                    <Link
                        target="_blank"
                        className={classes.tokenLink}
                        rel="noopener noreferrer"
                        href={`${resolveLinkOnEtherscan(chainId)}/token/${token.address}`}>
                        <Typography variant="body2">
                            {formatEthereumAddress(token.address, 4)}(View on Etherscan)
                        </Typography>
                    </Link>
                </div>
            </section>
            <section className={classes.comfirmWrapper}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={agreeReminder}
                            onChange={(event) => {
                                setAgreeReminder(event.target.checked)
                            }}
                        />
                    }
                    label={t('plugin_ito_dialog_claim_reminder_agree')}
                />
            </section>
            <ActionButton
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => setStatus(ClaimStatus.Swap)}
                disabled={!agreeReminder}>
                Continue
            </ActionButton>
        </>
    )
}
