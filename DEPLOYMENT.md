# Deployment Guide for Toilet App

This guide explains how to deploy the Toilet App to Netlify with GitHub integration for data persistence.

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **GitHub Personal Access Token**: You need a token with `repo` permissions
3. **Netlify Account**: Free account at [netlify.com](https://netlify.com)

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Toilet App Netlify"
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (if you want to use GitHub Actions)
5. Click "Generate token"
6. **Copy the token** - you won't see it again!

### 2. Deploy to Netlify

#### Option A: Deploy from GitHub (Recommended)

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build:netlify` (this handles function dependencies)
   - **Publish directory**: `dist`
   - **Node version**: 18 (automatically detected from .nvmrc)
6. Click "Deploy site"

#### Option B: Manual Deploy

1. Run `npm run build` locally
2. Drag the `dist` folder to Netlify's deploy area

### 3. Configure Environment Variables

1. In your Netlify dashboard, go to **Site settings > Environment variables**
2. Add these variables:
   ```
   VITE_GITHUB_TOKEN=your_github_token_here
   VITE_GITHUB_REPO_OWNER=your_github_username
   VITE_GITHUB_REPO_NAME=your_repo_name
   VITE_GITHUB_BRANCH=main
   ```

### 4. Configure the App

1. Visit your deployed app
2. Click "Configure GitHub" in the blue banner
3. Enter your GitHub credentials:
   - **Token**: Your personal access token
   - **Repository Owner**: Your GitHub username
   - **Repository Name**: Your repository name
   - **Branch**: Usually `main` or `master`
4. Click "Validate" to test the connection
5. Click "Save Configuration"

## How It Works

### Data Flow

1. **User Interaction**: User clicks like/dislike on a toilet
2. **Local Update**: UI updates immediately for responsiveness
3. **GitHub API Call**: App calls Netlify function with GitHub API
4. **File Update**: Function updates the markdown file in your repository
5. **Commit**: Changes are committed with a descriptive message
6. **Deployment**: Netlify automatically redeploys with updated data

### File Structure

```
data/toilets/
├── 1-old-town-square.md
├── 2-palladium.md
├── 3-charles-bridge.md
└── ...
```

Each markdown file contains YAML frontmatter with toilet data and a detailed description.

### Netlify Functions

The app uses Netlify serverless functions to:

- Handle GitHub API calls securely
- Update markdown files
- Commit changes to your repository

## Security Considerations

- **Token Storage**: Tokens are stored in browser localStorage (not in code)
- **API Access**: Only your repository is accessible
- **Permissions**: Token has minimal required permissions
- **HTTPS**: All communication is encrypted

## Troubleshooting

### Common Issues

1. **"Invalid token" error**

   - Check token permissions (needs `repo` scope)
   - Verify token hasn't expired
   - Ensure repository name is correct

2. **"Repository not found" error**

   - Check repository owner and name
   - Ensure token has access to the repository
   - Verify repository is not private (or token has access)

3. **"Permission denied" error**

   - Token needs `repo` permissions
   - Repository must be accessible to the token

4. **Build failures**

   - Check build command in Netlify (should be `npm run build:netlify`)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

5. **"axios dependency not installed" error**
   - This is now resolved with the `build:netlify` script
   - The script automatically installs function dependencies
   - Ensure you're using `npm run build:netlify` as the build command

### Debug Mode

Enable debug logging by adding to your browser console:

```javascript
localStorage.setItem("debug", "true");
```

## Customization

### Adding New Toilets

1. Create a new markdown file in `data/toilets/`
2. Follow the existing format with YAML frontmatter
3. Include required fields: `id`, `name`, `address`, `latitude`, `longitude`
4. Add optional fields: `description`, `images`, `isFree`

### Modifying the Rating System

The rating calculation is in the Netlify function:

```javascript
const rating = (likes * 5 + dislikes * 1) / totalRatings;
```

### Styling and UI

- Modify `src/components/` for UI changes
- Update `src/index.css` for global styles
- Use Tailwind CSS classes for styling

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify GitHub token permissions
3. Check Netlify function logs
4. Ensure repository structure is correct

## License

This project is open source. Feel free to modify and distribute according to your needs.
