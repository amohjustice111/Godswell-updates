# Godswell Updates — YouTube Automation starter

This repository is named **Godswell Updates**. The current interface branding follows your selected picture and uses **YouTube Automation** as the product name.

## What is included
- Responsive black-and-yellow landing page
- Create Call / Join Call interface
- Share-site-link action using the browser share sheet where supported
- PWA manifest so the project can be prepared for installation
- Responsive feature cards and meeting-room preview

## Important: what is not connected yet
This is a frontend starter, not yet a production video-calling service. Account creation, secure login, persistent profiles, live video/audio, screen sharing, participant approval, and in-meeting chat require backend/authentication and a video provider. The current buttons explain that these integrations are not connected; they do not pretend to create real meetings.

## Run locally
1. Install Node.js LTS from https://nodejs.org/
2. Open a terminal in this project folder.
3. Run `npm install`
4. Run `npm run dev`
5. Open the local URL Vite prints.

## Publish using GitHub and Vercel
1. Create a GitHub repository named `godswell-updates`.
2. Upload these files and folders to the repository root (not inside another nested folder).
3. In Vercel, import the GitHub repository.
4. Vercel should detect Vite. Build command: `npm run build`; output directory: `dist`.
5. Deploy.

## Next integration stage
Before real users rely on it, choose and configure:
- Authentication/database provider (for email + password, unique usernames, optional profile photos)
- Video meeting provider that supports your expected participant count, screen sharing, and room moderation
- Server-side protection for meeting tokens and private meeting access

Never put private API secrets in frontend code or commit them to GitHub.
