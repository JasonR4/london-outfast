# Media Buying London - OOH Advertising Platform

A modern web application for out-of-home (OOH) advertising services in London, built with React, TypeScript, and Supabase.

## Features

- **Format Directory**: Browse 55+ OOH advertising formats
- **Quote System**: Get instant quotes for advertising campaigns
- **Content Management**: Full CMS for managing pages and content
- **SEO Optimization**: Advanced SEO management and analytics
- **Media Library**: Upload and manage advertising assets
- **Team Management**: User roles and permissions

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tool**: Vite
- **UI Components**: Radix UI, shadcn/ui
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd media-buying-london
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── data/              # Static data (OOH formats)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── integrations/      # Third-party integrations
└── assets/           # Static assets
```

## Deployment

The application can be deployed to any static hosting provider:

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

All rights reserved.