# Bitmap Utils Deployment Guide

This directory contains the files needed to deploy the Bitmap Utils project to Netlify.

## Files

- `index.html`: The main HTML file that will be served when someone visits your site
- `example.js`: The JavaScript file that contains the example code
- `utils/MondrianLayout.js`: The MondrianLayout utility class
- `netlify.toml`: Configuration file for Netlify

## How to Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com/) and log in or sign up
2. Click on "Add new site" > "Import an existing project"
3. Choose "Deploy manually" option
4. Upload the `netlify-docs.zip` file (which contains all the files in this directory)
5. Once the upload is complete, Netlify will automatically deploy your site
6. You can configure your custom domain (e.g., multiverso.club) in the Netlify site settings

## Troubleshooting

If you encounter any issues with the deployment:

1. Make sure all the required files are included in the zip file
2. Check the Netlify deployment logs for any errors
3. Verify that the `netlify.toml` file is correctly configured 