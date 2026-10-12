'use client';

import { faGitlab } from '@fortawesome/free-brands-svg-icons';
import {
  faBook,
  faDatabase,
  faPerson,
  faToolbox,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Link as UiLink } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import Image from 'next/image';
import Link from 'next/link';

import LifeCycle from '@/app/(layoutWithSidebar)/(home)/images/life-cycle.svg';
import NextJsLogo from '@/app/(layoutWithSidebar)/(home)/images/nextjs.svg';
import OpenAiLogo from '@/app/(layoutWithSidebar)/(home)/images/openai.svg';
import LogoCarousel from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/LogoCarousel';
import ASSETS from '@/config/assets';
import ASSISTANTS from '@/config/assistants';
import TOOL_GALLERY from '@/config/toolGallery';
import ROUTES from '@/constants/routes';

export default function Home() {
  return (
    <div className="grow min-w-0">
      <div className="flex flex-col gap-4">
        <Alert status="warning" className="grow-0">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              The TIB AIssistant is an early preview version
            </Alert.Title>
            <Alert.Description>
              Explore, create and use, but always with caution. Certain features
              are unstable and are subject to change. Your data is stored
              locally in your browser and might be deleted at anytime.{' '}
              <strong>
                TIB AIssistant is provided &quot;as is&quot; and comes with{' '}
                absolutely no warranty
              </strong>
              . Data is sent to{' '}
              <Link
                href="https://openai.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI
              </Link>
              ,{' '}
              <Link href={ROUTES.DATA_PROTECTION}>see our privacy policy</Link>.
            </Alert.Description>
          </Alert.Content>
        </Alert>
        <div className="box-white grow !p-5 sm:!p-8">
          <h1>Welcome to TIB AIssistant</h1>
          <p className="mb-4">
            The AI-supported TIB AIssistant platform helps researchers
            throughout the research life cycle. Get AI assistance during
            research, while you stay in the driver seat.
          </p>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mt-6 lg:mt-10 mb-3">
            <div className="flex-1 lg:border-r-1 lg:pe-5">
              <h2>Assistants</h2>
              <p>
                <span className="font-semibold">Assistants</span> are designed
                to help you with tasks. You can use assistant sequentially, or
                you can use assistants individually, only using the support
                where you need it.
              </p>
            </div>
            <div className="flex-1 lg:border-r-1 lg:pe-5">
              <h2>Tools</h2>
              <p>
                Assistants use <span className="font-semibold">Tools</span> to
                connect to external services. This makes TIB AIssistant unique,
                as it integrates various different scholarly services into a
                single AI platform.
              </p>
            </div>
            <div className="flex-1">
              <h2>Assets</h2>
              <p>
                Assistant outputs are stored in the{' '}
                <span className="font-semibold">Assets</span>, which in turn can
                serve as input to other assistants. Assets are stored locally in
                your browser.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col grow gap-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="box w-full lg:w-7/12 flex">
                <div className="text-center flex-1 border-r-1 pe-5 flex flex-col gap-2 items-center justify-center">
                  <FontAwesomeIcon
                    icon={faPerson}
                    className="text-muted"
                    size="xl"
                  />
                  <h3 className="m-0 text-2xl">
                    {Object.keys(ASSISTANTS).length}
                  </h3>
                  <p>Assistants</p>
                </div>
                <div className="text-center flex-1 border-r-1 pe-5 flex flex-col gap-2 items-center justify-center">
                  <FontAwesomeIcon
                    icon={faToolbox}
                    className="text-muted"
                    size="xl"
                  />
                  <h3 className="m-0 text-2xl">
                    {Object.values(TOOL_GALLERY).flat().length}
                  </h3>
                  <p>Tools</p>
                </div>
                <div className="text-center flex-1 flex flex-col gap-2 items-center justify-center">
                  <FontAwesomeIcon
                    icon={faDatabase}
                    className="text-muted"
                    size="xl"
                  />
                  <h3 className="m-0 text-2xl">{ASSETS.length}</h3>
                  <p>Assets</p>
                </div>
              </div>
              <div className="box w-full lg:w-5/12 text-center">
                <h2>Open source</h2>
                <p>Developed by researchers, made for research.</p>
                {/* HeroUI Link styled with buttonVariants: one interactive element,
                    where an <a> wrapping a <Button> produced two tab stops. HeroUI's
                    `.link.button` rule zeroes the gap (it expects a trailing
                    `Link.Icon`), so the button's own gap-2 is restored for the
                    leading icon. */}
                <div className="mt-3 flex gap-2 justify-center">
                  <UiLink
                    href="https://gitlab.com/TIBHannover/orkg/tib-aissistant/web-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: 'tertiary',
                      className: 'gap-2',
                    })}
                  >
                    <FontAwesomeIcon icon={faGitlab} />
                    Gitlab
                  </UiLink>
                  <UiLink
                    href="https://tibhannover.gitlab.io/orkg/tib-aissistant/web-app/storybook/?path=/docs/introduction--docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: 'tertiary',
                      className: 'gap-2',
                    })}
                  >
                    <FontAwesomeIcon icon={faBook} />
                    Developer docs
                  </UiLink>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="box w-full lg:w-5/12 flex flex-col justify-center items-center">
                <h2>Tech stack</h2>
                <div className="flex items-center justify-center grow gap-6 flex-wrap">
                  <a
                    href="https://platform.openai.com/"
                    className="text-foreground font-bold text-xl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={OpenAiLogo}
                      alt="OpenAI logo"
                      className="h-10 mx-auto dark:invert"
                    />
                  </a>
                  <a
                    href="https://nextjs.org/"
                    className="text-foreground font-bold text-xl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={NextJsLogo}
                      alt="Next.js logo"
                      className="h-10 mx-auto dark:invert"
                    />
                  </a>
                  <a
                    href="https://ai-sdk.dev/"
                    className="text-foreground font-bold text-xl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    AI SDK
                  </a>
                </div>
              </div>
              {/*
                Partner marks are raster logos drawn for light backgrounds. The
                card follows the theme like its neighbours; each logo sits on its
                own light plate (see LogoCarousel) so it stays legible in dark mode.
              */}
              <div className="box w-full lg:w-7/12">
                <LogoCarousel autoplay />
              </div>
            </div>
          </div>
          <div className="box w-full lg:w-3/12 flex flex-col">
            <h2 className="text-center">
              Research life <br />
              cycle support
            </h2>
            <div className="flex justify-center my-5 items-center grow">
              <Image src={LifeCycle} alt="Research life cycle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
