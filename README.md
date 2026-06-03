# CharmChime

Chimes of Imagination, Stories of Wonder

CharmChime is a family-focused web application designed to bridge the gap between parents and children through interactive features, memory preservation, and achievement tracking. The platform provides separate interfaces for both parents and children, offering a secure and engaging experience for the entire family.

## Features

### For Parents
- **Dashboard**: Centralized hub to monitor and manage family activities
- **Analytics**: Detailed insights into children's activities and progress
- **Reports**: Comprehensive reports on various aspects of child development
- **Activity Monitoring**: Track and view child activities in real-time
- **Settings**: Manage account preferences and security settings
- **Insights**: AI-powered insights about your child's interests and behaviors

### For Children
- **Home Screen**: Personalized dashboard with recommended activities
- **Journal Entries**: Create and maintain digital journals
- **Memories**: Preserve and relive special moments
- **Achievements**: Track milestones and accomplishments
- **Calendar**: View scheduled activities and events
- **Story Mode**: Interactive storytelling experiences
- **Settings**: Manage personal preferences

## Tech Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI) + Radix UI components
- **Styling**: Emotion (CSS-in-JS) + CSS
- **Icons**: Lucide React
- **Development**: Node.js

## Project Structure

```
src/
├── pages/           # Screen components for different app sections
├── components/      # Reusable UI components
├── styles/          # Global and theme styles
└── assets/          # Images and static files
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CharmChime
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` directory.

## Development Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Create production-ready build

## Configuration

Vite configuration is managed in `vite.config.ts`. Adjust build settings as needed for your environment.

## Environment Variables

Create a `.env` or `.env.local` file in the project root for environment-specific settings:

```
VITE_API_BASE_URL=<your-api-endpoint>
VITE_ENV=development
```

## Features Roadmap

- [ ] Real-time notifications
- [ ] Advanced parental controls
- [ ] AI-powered content recommendations
- [ ] Family photo sharing
- [ ] Achievement badges and rewards
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is part of a FYP (Final Year Project). Please refer to your institution's guidelines for usage and distribution.

## Support

For issues, questions, or suggestions, please create an issue in the repository or contact the development team.

---

**CharmChime** - Making family memories more meaningful, one chime at a time. 🎵✨
