# Gibson Retail App (Next.js)

Full-stack retail shopping exercise with two clients in one repository:

- Next.js TypeScript web app + in-memory BFF API
- React Native (Expo) TypeScript mobile app
- Stock reservation lifecycle with 2-minute inactivity expiration

## Quick Start

npm install
npm run dev

Open http://localhost:3000

## Mobile App

cd mobile
npm install
npm run ios

Set EXPO_PUBLIC_API_BASE_URL to your local BFF URL (default: http://localhost:3000).

## Testing

npm run test

## Full Documentation

See SOLUTION.md for architecture notes, API details, discount engine behavior, assumptions, and run instructions.
