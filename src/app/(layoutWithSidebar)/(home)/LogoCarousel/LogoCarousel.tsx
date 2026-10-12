'use client';

import 'slick-carousel/slick/slick-theme.scss';
import 'slick-carousel/slick/slick.scss';

import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Slider from 'react-slick';

import erc from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/erc.png';
import eulist from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/eulist.png';
import fdmNds from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/fdm-nds.png';
import l3s from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/l3s.png';
import leibnizAssociation from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/leibniz-association.svg';
import nfdi from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/nfdi.png';
import tib from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/tib.png';
import uniHannover from '@/app/(layoutWithSidebar)/(home)/LogoCarousel/images/uni-hannover.png';

export default function LogoCarousel({
  autoplay = false,
}: {
  autoplay?: boolean;
}) {
  const LOGOS = [
    {
      name: 'TIB logo',
      src: tib,
      width: 100,
    },
    {
      name: 'L3S logo',
      src: l3s,
      width: 120,
    },
    {
      name: 'EUList logo',
      src: eulist,
      width: 100,
    },
    {
      name: 'NFDI logo',
      src: nfdi,
      width: 250,
    },
    {
      name: 'ERC logo',
      src: erc,
      width: 90,
    },
    {
      name: 'Uni Hannover logo',
      src: uniHannover,
      width: 170,
    },
    {
      name: 'Leibniz Association logo',
      src: leibnizAssociation,
      width: 120,
    },
    {
      name: 'fdmNds logo',
      src: fdmNds,
      width: 160,
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <h2 className="mb-4">Brought to you by</h2>
      <Slider
        dots
        arrows={false}
        infinite
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay={autoplay}
        className="mb-5 [&_.slick-slide]:h-auto [&_.slick-slide_>_div]:h-full [&_.slick-track]:flex  max-w-96"
        customPaging={() => (
          /* Dots sit on the card itself now, so `text-muted` adapts to both
             themes; the active dot picks up the accent. */
          <div className="text-muted/40 [.slick-active_&]:text-accent">
            <FontAwesomeIcon icon={faCircle} className="text-[0.5rem]" />
          </div>
        )}
      >
        {LOGOS.map((logo) => (
          <div
            className="!flex h-full items-center justify-center px-4 py-2"
            key={logo.name}
          >
            {/* Light plate behind each logo: transparent in light mode (the card
                is already light) and a light chip in dark mode, so the raster
                marks stay legible against the dark card. */}
            <div className="flex items-center justify-center rounded-xl bg-logo-plate px-6 py-4">
              <Image
                key={logo.name}
                src={logo.src}
                width={logo.width}
                height={120}
                alt={`preview of ${logo.name}`}
                fill={false}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
