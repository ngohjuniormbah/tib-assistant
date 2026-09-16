export default function Accessibility() {
  return (
    <div className="box-white grow !py-4 !px-4 lg:!px-6 [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h4]:my-2">
      <h1>About</h1>
      <p>
        The TIB AIssistant is a platform that provides AI support throughout the
        entire research life cycle. You can use the various assistants
        sequentially—from Ideation to Review—or access each assistant
        individually.
      </p>
      <p>
        When working with an assistant, you can import and export data using the
        assets panel on the right side of the screen. Assistants share data
        through these assets but do not share their context windows. Each
        assistant specifies a set of available tools, which you can view below
        the input field. It is also possible to modify the set of tools
        accessible to an assistant.
      </p>
      <p>
        The TIB AIssistant is an early prototype of our vision for a research
        assistant that supports researchers while keeping them fully in control
        of their work. With this human-machine collaboration approach, we aim to
        provide tools that are genuinely useful throughout the research life
        cycle and to go beyond a simple chat interface. Future improvements will
        focus on community features, enabling users to create custom assistants
        directly through the interface.
      </p>
      <h2>Cite the TIB AIssistant</h2>
      <p>
        Please cite the following work when referring to the{' '}
        <em>TIB AIssistant vision:</em>
      </p>
      <div className="border-l-4 border-accent bg-surface-secondary p-4 my-4 text-sm rounded-r-lg">
        <p>
          Auer S, Oelen A, Jaradeh MY, Khalid M, Keya F, Gaddipati SK,
          D&apos;Souza J, Schlüter L, Alasti A, Rabby G, Jiomekong A., Karras,
          O. (2025).{' '}
          <em>
            Towards AI-Supported Research: a Vision of the TIB AIssistant.
          </em>{' '}
          In 5th International Workshop on Scientific Knowledge: Representation,
          Discovery, and Assessment (Sci-K 2025). Available via{' '}
          <a
            href="https://sci-k.github.io/2025/papers/paper09.pdf"
            target="_blank"
            rel="noreferrer noopener"
          >
            PDF direct link
          </a>{' '}
          and{' '}
          <a
            href="https://arxiv.org/abs/2512.16447"
            target="_blank"
            rel="noreferrer noopener"
          >
            arXiv preprint
          </a>
          .
        </p>
      </div>
      <p>
        And cite the following work specifically for the{' '}
        <em>TIB AIssistant application:</em>
      </p>
      <div className="border-l-4 border-accent bg-surface-secondary p-4 my-4 text-sm rounded-r-lg">
        <p>
          Oelen, A., & Auer, S. (2025).{' '}
          <em>
            TIB AIssistant: a Platform for AI-Supported Research Across Research
            Life Cycles.
          </em>{' '}
          Joint Proceedings of Industry, Doctoral Consortium, Posters and Demos
          of the 24th International Semantic Web Conference (ISWC-C 2025).
          Available via{' '}
          <a
            href="https://ceur-ws.org/Vol-4085/paper74.pdf"
            target="_blank"
            rel="noreferrer noopener"
          >
            PDF direct link
          </a>{' '}
          and{' '}
          <a
            href="https://arxiv.org/abs/2512.16442"
            target="_blank"
            rel="noreferrer noopener"
          >
            arXiv preprint
          </a>
          .
        </p>
      </div>
      <h2>Source code</h2>
      <p>
        The TIB AIssistant is an open-source project and is released under the
        MIT license. We welcome contributions from the community, such as
        improvements to the platform or additions of new tools and assistants.
        You can find the{' '}
        <a
          href="https://gitlab.com/TIBHannover/orkg/tib-aissistant/web-app"
          target="_blank"
          rel="noreferrer noopener"
        >
          source code on GitLab
        </a>
        . The{' '}
        <a
          href="https://tibhannover.gitlab.io/orkg/tib-aissistant/web-app/storybook/?path=/docs/introduction--docs"
          target="_blank"
          rel="noreferrer noopener"
        >
          developer documentation
        </a>{' '}
        provides an overview of how to contribute.
      </p>
      <h2>Demonstration video</h2>
      <p>
        Have a look at the demonstration video below to see how you can get
        started with the AIssistant. As we are continuously improving the
        platform, the contents of the video might slightly differ from the
        current version.
      </p>
      <div className="flex justify-center mt-10">
        <div className="relative w-full max-w-[800px] aspect-video">
          <iframe
            src="https://av.tib.eu/player/71179"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
