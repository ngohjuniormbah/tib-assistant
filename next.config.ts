import type { NextConfig } from 'next';

import { version } from '@/../package.json';

const scriptSrcEval =
  process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';

const cspHeader = `
  default-src 'self';
  img-src 'self'
    https://gravatar.com
  ;
  script-src 'self' 'unsafe-inline'${scriptSrcEval};
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  frame-src 'self'
    https://av.tib.eu
  ;
  frame-ancestors 'self' 
    https://accounts.orkg.org
    *.localhost:*
  ;
  connect-src 'self' 
    127.0.0.1:*
    localhost:*
    *.localhost:*
    https://*.tib.eu:*
    http://*.test.service.tib.eu:*
    https://api.semanticscholar.org 
    https://api.ask.orkg.org
  ;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
              .replace(/\n/g, ' ')
              .replace(/\s{2,}/g, ' ')
              .trim(),
          },
        ],
      },
    ];
  },
  experimental: {
    authInterrupts: true,
  },
  reactCompiler: true,
  env: {
    version,
  },
  output: process.env.VERCEL ? undefined : 'standalone',
};

export default nextConfig;
