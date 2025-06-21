#!/bin/bash

# ENS Voicemail Deployment Script
echo "🚀 Building ENS Voicemail for deployment..."

# Build the project
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in ./dist/"
    echo ""
    echo "To deploy to GitHub Pages:"
    echo "1. Push this code to your GitHub repository"
    echo "2. Go to Settings > Pages in your GitHub repo"
    echo "3. Set source to 'GitHub Actions'"
    echo "4. The workflow will automatically deploy on push to main/master"
    echo ""
    echo "Or manually deploy by copying ./dist/ contents to your web server"
else
    echo "❌ Build failed!"
    exit 1
fi 