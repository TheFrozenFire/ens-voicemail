# ENS Voicemail App - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Then edit `.env` and add your Alchemy API key:

```bash
# Get your free API key from: https://www.alchemy.com/
VITE_ALCHEMY_API_KEY=your_actual_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

## 🔑 API Keys Required

### Alchemy API Key
The app uses Alchemy for ENS resolution. You can get a free API key at [Alchemy](https://www.alchemy.com/).

**Why Alchemy?**
- Reliable ENS resolution
- High rate limits
- Free tier available
- Excellent documentation

**How to get an API key:**
1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up for a free account
3. Create a new app
4. Copy your API key
5. Add it to your `.env` file

### Alternative Providers
You can also use other providers by uncommenting and configuring them in `.env`:

```bash
# VITE_INFURA_API_KEY=your_infura_key_here
# VITE_ETHERSCAN_API_KEY=your_etherscan_key_here
```

## 🔒 Security Notes

- **Never commit your `.env` file** - It's already in `.gitignore`
- **Use the `.env.example` template** - Shows required variables without exposing keys
- **Rotate API keys regularly** - For production use
- **Use environment-specific keys** - Different keys for dev/staging/prod

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run Playwright tests
- `npm run debug:chrome` - Launch Chrome with debugging
- `npm run debug:playwright` - Run tests with debugging

### Environment Variables
The app uses Vite's environment variable system. All variables must be prefixed with `VITE_` to be accessible in the browser.

**Available variables:**
- `VITE_ALCHEMY_API_KEY` - Alchemy API key for ENS resolution
- `VITE_INFURA_API_KEY` - Infura API key (alternative)
- `VITE_ETHERSCAN_API_KEY` - Etherscan API key (alternative)

## 🚀 Deployment

### Environment Setup
For production deployment, set environment variables in your hosting platform:

**Vercel:**
- Go to Project Settings → Environment Variables
- Add `VITE_ALCHEMY_API_KEY` with your production API key

**Netlify:**
- Go to Site Settings → Environment Variables
- Add `VITE_ALCHEMY_API_KEY` with your production API key

**GitHub Pages:**
- Use GitHub Secrets for environment variables
- Set up GitHub Actions to inject them during build

### Build Process
```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔧 Troubleshooting

### API Key Issues
- **"Invalid API key"** - Check your Alchemy API key in `.env`
- **"Rate limit exceeded"** - Upgrade your Alchemy plan or use demo key
- **"Network error"** - Check your internet connection

### Environment Variable Issues
- **"API key not found"** - Ensure `.env` file exists and has correct format
- **"Variable undefined"** - Check that variable name starts with `VITE_`
- **"Build fails"** - Verify all required environment variables are set

### Development Issues
- **"Hot reload not working"** - Restart the dev server
- **"Tests failing"** - Check if API keys are configured for test environment
- **"Debug tools not working"** - Ensure Chrome is installed and accessible

## 📚 Additional Resources

- [Alchemy Documentation](https://docs.alchemy.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [ENS Documentation](https://docs.ens.domains/)
- [Ethers.js Documentation](https://docs.ethers.io/) 