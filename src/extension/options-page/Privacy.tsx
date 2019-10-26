import React from 'react'

export default function PrivacyDialog() {
    return (
        <main className="container">
            <style>
                {`.container {
                        padding: 24px;
                    }
                    article > h1 {
                        margin-top: 0;
                    }
                    `}
            </style>
            <article>
                <h1>Maskbook (Browser Extension) Privacy Policy</h1>

                <p>Last Updated on July 22, 2019</p>

                <h2>Coverage</h2>

                <p>
                    This privacy policy document covers first-party implementations of Maskbook the Extension Software,
                    which are engineered to work with web browsers, e.g. Google Chrome, Mozilla Firefox. It does not
                    cover distribution methods (e.g. Google Chrome Web Store), Maskbook website, third-party
                    implementations of Maskbook, or other first-party implementations of Maskbook which are engineered
                    to work in alternative environments (e.g. Apple iOS and Google Android).
                </p>

                <h2>Information Being Collected by Maskbook the Extension Software</h2>

                <p>
                    The Extension Software collects the following information and store them locally only and will not
                    send them over network, except for which are specified in other sections. These information are
                    collected for and only for the fulfillment of functionalities of the Extension Software.
                </p>

                <ul>
                    <li>Your Facebook profile metadata, including name, username, avatar, etc.</li>
                    <li>Your Facebook timeline information, including posts, comments under posts, etc.</li>
                    <li>Information you generate and/or create with Maskbook the Extension Software.</li>
                    <li>Information you transfer from alternative implementations of Maskbook.</li>
                </ul>

                <p>
                    Counterparts of such information on other social networks may also be collected, if you choose to
                    use Maskbook for those platforms.
                </p>

                <h2>Intermediary Services</h2>

                <p>
                    Definition: An intermediary service is an online network service which is designed to work with
                    Maskbook software implementations in order to allow Maskbook work properly (or efficiently).
                </p>

                <p>
                    Some information are sent to intermediary services over network, for and only for the fulfillment of
                    functionalities of Maskbook the Extension Software.
                </p>

                <ul>
                    <li>Your Maskbook public key.</li>
                    <li>The URL of your Facebook profile.</li>
                    <li>The URL of your Facebook account ownership proof post.</li>
                    <li>
                        Un-anonymized recipient-specific asymmetric ciphers (ECDH) which encrypt the post-encryption
                        keys (AES). (Until v1.6.0)
                    </li>
                    <li>
                        Anonymized recipient-specific asymmetric ciphers (ECDH) which encrypt the post-encryption keys
                        (AES). (Since v1.6.0)
                    </li>
                </ul>

                <p>
                    Maskbook the Extension Software is designed to work with alternative intermediary services.
                    Alternative intermediary services are those intermediary services which are operated by parties
                    other than the developer of Maskbook. Maskbook will discover alternative intermediary services when
                    first-party intermediary services (those intermediary services provided by the developer of
                    Maskbook) are unavailable or unstable. These alternative intermediary services will be able to
                    obtain the same information which are sent to first-party intermediary services, no less, no more.
                </p>

                <h2>Information Being Collected by Alternative Parties</h2>

                <p>
                    As long as the online services provided by the developers of Maskbook run on PaaS and IaaS
                    cloud-computing platforms and through CDN, services employed by the developer of Maskbook, including
                    Amazon AWS, Google Cloud Engine, Microsoft Azure, CloudFlare, Fastly, GitHub, Akamai, Linode, and
                    Digital Ocean may technically be able to intercept communication and computation of online services
                    provided by the developer of Maskbook which are designed for and only for the fulfillment of the
                    functionalities of Maskbook. NSA, CIA, FBI and other intelligence agencies and law enforcement
                    authorities may also intercept communications. The developer of Maskbook assume no liability in such
                    cases of infringement.
                </p>

                <h2>Changes to this Statement / Contact Us</h2>

                <p>
                    We may update this Privacy Policy to reflect changes to our information practices. If we make any
                    material changes we will provide notice on this website, prior to the change becoming effective. We
                    encourage you to periodically review this page for the latest information on our privacy practices.
                    If you continue to use Maskbook the Extension Software after those changes are in effect, you agree
                    to the revised policy.
                </p>
                <p>
                    If you have any other questions about this policy please contact{' '}
                    <a href="info@dimension.im">info@dimension.im</a>.
                </p>
            </article>
        </main>
    )
}
