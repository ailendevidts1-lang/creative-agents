# Creative Agents - AI Development System

A private AI development system that turns natural language into production-ready software. Generate web apps, mobile apps, AI assistants, operating systems, and automation tools with a fully automated pipeline.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI
- Git

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> 📝 **Getting Supabase Credentials:**
> 1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Select your project → Settings → API
> 3. Copy **Project URL** and **Project API Key (anon public)**

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Servers

**Terminal A - Supabase Functions:**
```bash
supabase functions serve
```

**Terminal B - React App:**
```bash
npm run dev
```

### 4. Access the Application

Open [http://localhost:5173](http://localhost:5173) in your browser.

## ✅ Testing the Pipeline

1. **Navigate to "Generate Project" tab**
2. **Enter a project prompt:**
   ```
   Build me an AI voice assistant that can manage my email, calendar, and control my smart home devices
   ```
3. **Click "Generate Project"** - watch the pipeline progress
4. **View generated project** in "Active Projects" tab
5. **Click "Generate Code"** to create the actual codebase
6. **Download the ZIP** when generation completes

Expected flow: `prompt → plan → generate-code function → ZIP URL → success`

## 🏗️ System Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Supabase Client** for backend communication

### Backend Stack
- **Supabase Edge Functions** (Deno runtime)
- **OpenAI GPT-5** for code generation
- **PostgreSQL** for data persistence

### AI Agent Pipeline
1. **Requirements Analysis** - Extract project specifications
2. **Tech Stack Selection** - Choose optimal technologies
3. **Design System** - Create UI/UX guidelines
4. **Architecture Planning** - Define system structure
5. **AI Integration** - Configure AI services
6. **Code Generation** - Produce working code
7. **QA & Testing** - Validate functionality
8. **Deployment** - Configure deployment pipeline

## 🔧 Project Structure

```
creative-agents/
├── src/
│   ├── agents/              # AI agent implementations
│   │   ├── enhancedOrchestrator.ts
│   │   ├── requirementsAgent.ts
│   │   ├── techStackAgent.ts
│   │   └── ...
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── ProjectCard.tsx
│   │   ├── CodeViewer.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   └── useProjectGeneration.ts
│   ├── pages/               # Application pages
│   │   ├── Home.tsx
│   │   └── Settings.tsx
│   ├── services/            # API services
│   │   └── aiCodeService.ts
│   └── ...
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── generate-code/
│   │   ├── deploy-project/
│   │   ├── run-sandbox/
│   │   └── ...
│   └── config.toml          # Supabase configuration
├── .env.example             # Environment template
└── README.md
```

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=          # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Your Supabase anon key
```

### Edge Functions (Supabase Secrets)
```env
OPENAI_API_KEY=             # OpenAI API key for AI generation
SUPABASE_URL=               # Same as frontend
SUPABASE_ANON_KEY=          # Same as frontend  
SUPABASE_SERVICE_ROLE_KEY=  # Service role key for admin operations
```

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Supabase
supabase start          # Start local Supabase
supabase functions serve # Serve edge functions locally
supabase db reset       # Reset local database
```

## 📊 Supported Project Types

- **Web Apps** - SaaS dashboards, e-commerce, social networks
- **Mobile Apps** - iOS/Android native or cross-platform  
- **AI Assistants** - Voice/text AI with memory and tools
- **Websites** - Corporate sites, portfolios, landing pages
- **Automation Tools** - Trading bots, IoT controllers, workflows
- **Operating Systems** - Custom Linux distros, embedded OS

## 🔍 Troubleshooting

### Common Issues

**1. "VITE_SUPABASE_URL is not defined"**
- Ensure `.env` file exists with correct variables
- Restart the development server after adding variables

**2. "Failed to invoke function"**  
- Check that Supabase functions are running (`supabase functions serve`)
- Verify OPENAI_API_KEY is configured in Supabase secrets

**3. "Code generation failed"**
- Verify OpenAI API key has sufficient credits
- Check Edge Function logs for detailed error messages

**4. Pipeline gets stuck**
- Check browser console for JavaScript errors
- Verify all agent files are present and complete

### Debug Tools
- **Console Logs** - Check browser developer tools
- **Network Tab** - Monitor API requests/responses  
- **Supabase Logs** - View edge function execution logs

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Supabase)
```bash
supabase functions deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature` 
5. Open a Pull Request

## 🔄 Version History

- **v1.0.0** - Initial release with full AI pipeline
- **v1.1.0** - Added code generation and sandbox support
- **v1.2.0** - Enhanced UI and error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Building! 🚀**

Transform ideas into code with the power of AI.