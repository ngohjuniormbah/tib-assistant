import ROUTES from '@/constants/routes';

export default function DataProtection() {
  return (
    <div className="box-white grow !py-4 !px-4 lg:!px-6 [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h4]:my-2">
      <h1>Data protection</h1>
      <h2>Privacy Statement</h2>
      <p>
        Data protection is of high priority for the Technische
        Informationsbibliothek (TIB). As a general rule, the use of TIB&apos;s
        services does not require the provision of any personal data. However,
        the processing of personal data may be required where a data subject
        wants to use special services via the TIB&apos;s web pages. Where the
        processing of personal data is required and where there is no legal
        basis for such processing, we shall obtain the data subject&apos;s
        consent.
      </p>
      <p>
        The processing of personal data, such as for example the data
        subject&apos;s name, address, email address, or telephone number shall
        always be carried out in accordance with the General Data Protection
        Regulation (GDPR) and the state and institution-specific data protection
        rules and regulations applicable to the TIB. This privacy statement
        serves to inform the public about the nature, scope and purpose of the
        personal data we collect, use and process, as well as of the rights data
        subjects are entitled to.
      </p>
      <p>
        The terms used in this privacy statement are to be understood within the
        meaning of the European General Data{' '}
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679"
          rel="nofollow"
          target="_blank"
        >
          Protection Regulation (GDPR).
        </a>
      </p>
      <h3>Name and address of the controller</h3>
      <p>The controller under data protection law shall be:</p>
      <p>
        Technische Informationsbibliothek (TIB)
        <br />
        Welfengarten 1 B<br />
        30167 Hannover
        <br />
        Germany
      </p>
      <p>
        Phone: +49 511 762-8989
        <br />
        Email:{' '}
        <a rel="nofollow" href="mailto:information@tib.eu">
          information@tib.eu
        </a>{' '}
        <br />
        Website:{' '}
        <a href="https://www.tib.eu/en/" rel="nofollow" target="_blank">
          www.tib.eu
        </a>
      </p>
      <h3>Name and address of the data protection officer</h3>
      <p>The data protection officer of the controller shall be:</p>
      <p>
        Elke Brehm
        <br />
        Phone: +49 511 762-8138
        <br />
        Email:{' '}
        <a rel="nofollow" href="mailto:datenschutz@tib.eu">
          datenschutz@tib.eu
        </a>
      </p>
      <p>
        <strong>Postal address:</strong>
      </p>
      <p>
        Technische Informationsbibliothek (TIB)
        <br />
        data protection officer
        <br />
        Welfengarten 1 B<br />
        30167 Hannover
        <br />
        Germany
      </p>
      <p>
        <strong>Visiting Address:</strong>
      </p>
      <p>
        TIB Conti-Campus
        <br />
        Königsworther Platz 1 B<br />
        30167 Hannover
      </p>
      <p>
        Any data subject may contact our data protection officer directly
        regarding any and all questions and suggestions regarding data
        protection at any time.
      </p>

      <h3>Registration for TIB AIssistant</h3>
      <p>
        Users who want to use the TIB AIssistant must register with ORKG at
        https://orkg.org/ . Signing into the TIB AIssistant is only possible
        with an ORKG account via OAuth. This is required so we can more reliable
        track used LLM tokens. Each registered user receives a number of tokens
        per day, when the daily token limit is reached, users must wait until
        the next day before they can use the TIB AIssistant again. When
        registering, ORKG collects personal data in order to be able to provide
        personalized and generally improved services to users. Services that
        require user authentication cannot be used without providing the
        required data.
      </p>
      <p>
        The legal basis for the collection of such data shall be the{' '}
        <a
          href="https://www.tib.eu/en/service/terms-of-use"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of use of the TIB
        </a>
        , the{' '}
        <a href={ROUTES.TERMS_OF_USE} target="_blank" rel="noopener noreferrer">
          Special Conditions
        </a>{' '}
        applicable to the TIB AIssistant service, or the consent given by the
        user. For further information, please refer to the{' '}
        <a
          href={ROUTES.INFO_SHEET_DATA_PROTECTION}
          target="_blank"
          rel="noopener noreferrer"
        >
          information sheet on data protection provided for the TIB AIssistant
        </a>{' '}
        offered by the TIB.
      </p>
      <h4>
        Via third-party providers (e.g. Semantic Scholar) TIB provides access to
        scholarly articles based on Art. 1a GDPR which is granted as part of the
        following legal regulations:
      </h4>
      <ul className="list-disc ps-4">
        <li>licensing contracts with authors and other contributors.</li>
        <li>
          licensing contracts with editors or other content providers, to whom
          authors and other contributors licensed rights for publication in
          advance.
        </li>
        <li>
          open-access-licenses, under which the … were published on other
          platforms.
        </li>
        <li>
          German secondary publication right (par. 38 German Copyright Code, §
          38 UrhG)
        </li>
      </ul>

      <h3>OpenAI</h3>
      <p>
        Data used within the chat, including assets, is processed by OpenAI. By
        using TIB AIssistant you agree that your data is processed according to
        OpenAI&apos;s data protection policy, which is available via:{' '}
        <a
          href="https://platform.openai.com/docs/guides/your-data"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://platform.openai.com/docs/guides/your-data
        </a>
        . Specifically, the GPT models are used as inference engine to be able
        to have AI-generated research support. Additionally, you declare no
        personal information is provided into any chat on the TIB AIssistant
        platform, as all chat messages are processed by OpenAI. OpenAI&apos;s
        address is OpCo, LLC, 1455 3rd Street, San Francisco, CA 94158, USA. As
        the use OpenAI is crucial for the TIB AIssistant, your consent is
        required to be able to use the TIB AIssistant. Without accepting OpenAI
        service usage, it is at this moment not possible to use the TIB
        AIssistant.{' '}
      </p>
      <h3>Gravatar</h3>
      <p>
        We have integrated Gravatar on our platform, which is a service to
        display a personalized avatar for the signed-in user based on the email
        address of the signed in user. By using this service, your email address
        is hashed (SHA256) and then send to the Gravatar service. This service
        works on an opt-in basis, Gravatar only works when activated by the
        user. Gravatar is run by Automattic Inc., 60 29th Street #343, San
        Francisco, CA 94110, USA. More information about their privacy policy is
        available via:{' '}
        <a
          href="https://automattic.com/privacy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://automattic.com/privacy/
        </a>
      </p>

      <h3>Contact possibility via the web pages</h3>
      <p>
        The TIB&apos;s web pages contain information and forms that enable quick
        electronic contacting via contact form or by email providing name and
        email address also for customers not registered with the TIB. The
        indication of name and email address is necessary to establish contact
        following clarification of the data subject&apos;s concerns. The
        personal data transmitted by the data subject to the TIB via email or
        via a contact form are automatically stored internally and only for the
        purpose of processing or contacting the data subject.
      </p>
      <h3>Cookies</h3>
      <p>
        The TIB AIssistant and ORKG use cookies. Cookies are text files that are
        placed and stored on a computer system via an Internet browser and serve
        to render the offer of the TIB AIssistant and ORKG more user-friendly,
        effective and secure.
      </p>
      <p>
        The cookies used are so-called “session cookies”, which are
        automatically deleted at the end of the visit. Other cookies remain
        stored on the user&apos;s terminal device until he or she deletes them.
        These cookies enable the ORKG to recognise the user&apos;s browser on
        his or her next visit.
      </p>

      <h3>Use of web analysis tools</h3>
      <p>
        TIB AIssistant and ORKG uses the open source web analytics software
        Matomo (matomo.org) to analyse usage data in order to optimise its
        online offer. TIB self-hosts Matomo and no data is shared with third
        parties. Cookies are used to enable a statistical analysis of the use of
        this website by its visitors as well as the display of usage-related
        content. There is no other use, merging with other data or disclosure to
        third parties.{' '}
      </p>

      <h3>Matomo-Opt-Out</h3>
      <p>
        The information generated with Matomo about the use of this website is
        processed and stored exclusively with the TIB AIssistant and ORKG.
      </p>

      <p>
        In this case, an opt-out cookie is placed in the browser of the data
        subject, which prevents Matomo from storing usage data. When the cookies
        are deleted, the Matomo opt-out cookie is also deleted. Such objection
        (opt-out) must be redeclared when visiting the TIB AIssistant and ORKG
        again.
      </p>

      <h3>Collection of general data and information (logfiles)</h3>
      <p>
        Whenever a data subject calls the TIB AIssistant and ORKG service, the
        service automatically collects information in so-called server log
        files, which your browser automatically transmits to the service. This
        is:
      </p>

      <ul className="list-disc ps-4">
        <li>Browser type and browser version</li>
        <li>Operating system used</li>
        <li>Referrer URL</li>
        <li>Hostname of the accessing computer</li>
        <li>IP address</li>
        <li>Internet service provider of the accessing system</li>
        <li>Time of the server request</li>
      </ul>
      <p>
        As a general rule, this data is not attributable to a particular person.
        This data will not be merged with other data sources and will be deleted
        after they have fulfilled the purpose of securing technical functioning
        of the service.
      </p>

      <h3>Routine deletion and blocking of personal data</h3>
      <p>
        The TIB processes and stores the data subject&apos;s personal data only
        for the period necessary to achieve the purpose of such storage and in
        accordance with the General Data Protection Regulation and the country
        and institution-specific data protection regulations applicable to the
        TIB. Thereafter, the personal data will routinely be blocked or deleted
        in accordance with the statutory provisions. If the user no longer
        wishes to use the services of the TIB and in the absence of any claims
        of the TIB against the user and of any other legal basis for storage, we
        shall delete the personal data upon request.
      </p>

      <h3>Rights of the data subject</h3>
      <p>
        You shall at any time be entitled to obtain information about the data
        stored in this library, its origin and recipient and about the purpose
        of such data processing, as well as to rectification or erasure or
        restriction of processing or - to the extent that such processing is
        based on your consent - a right of withdrawal, possibly a right of
        objection and the right to data portability. Complaints may be lodged
        with the above-mentioned supervisory authority. You can contact us at
        any time for further questions on the subject of personal data.
      </p>
    </div>
  );
}
