# Supabase Storage Setup for PDF Files

This document explains how to configure Supabase Storage for handling PDF files in the Senegal Livres application.

## Overview

The application now supports storing PDF files in Supabase Storage as the primary storage method, with automatic fallback to local file storage if Supabase is not configured.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Service Role Key** (under "Project API keys" → "service_role")

### 2. Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Name it: `pdfs`
4. Set it as **Public** (so files can be accessed via public URLs)
5. Click **Create bucket**

### 3. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

For **Vercel deployment**, add these as environment variables in your Vercel project settings.

### 4. Storage Policies (Optional - Already Public)

Since the bucket is public, files can be read without authentication. If you want to restrict access:

1. Go to **Storage** → **Policies** → `pdfs` bucket
2. Add custom RLS (Row Level Security) policies as needed

## How It Works

### PDF Upload Flow

1. **Admin uploads PDF** (`/api/books/upload-pdf`):
   - PDF is uploaded to Supabase Storage
   - Public URL is stored in `book.pdfFile`
   - Filename is stored in `book.pdfFileName`

2. **User submits book** (`/api/submit-book`):
   - PDF is uploaded to Supabase Storage under `submissions/` folder
   - If Supabase fails, falls back to local storage
   - Public URL or local path stored in `submission.pdfFile`

### PDF Download Flow

1. **User downloads purchased book** (`/api/pdfs/download`):
   - Checks user's purchase record
   - Priority 1: Fetches from Supabase URL if `book.pdfFile` contains a full URL
   - Priority 2: Falls back to local storage at `/public/pdfs/{bookId}.pdf`
   - Streams PDF to user with authentication

2. **Email delivery** (`/api/email/send-book`):
   - Generates download links using `book.pdfFile` if available
   - Falls back to local storage check

## Benefits

✅ **Cloud-based storage** - No need to store large PDFs in your git repository  
✅ **Scalability** - Supabase Storage handles files efficiently  
✅ **CDN delivery** - Fast global access to PDF files  
✅ **Fallback support** - Works with local storage if Supabase is not configured  

## Storage Structure

```
pdfs/
├── {bookId}_{timestamp}.pdf          # Admin-uploaded books
└── submissions/
    └── {uuid}.pdf                     # User-submitted books
```

## Troubleshooting

### "Supabase Storage not configured" Error

**Cause**: Missing or invalid `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`

**Solution**: 
1. Verify environment variables are set correctly
2. Restart your application/server
3. For Vercel, redeploy after adding environment variables

### Upload Fails with Permission Error

**Cause**: Service role key might be incorrect or bucket doesn't exist

**Solution**:
1. Verify the service role key (not the anon key)
2. Check bucket name is exactly `pdfs`
3. Ensure bucket is created and public

### PDF Not Found After Upload

**Cause**: PDF uploaded but URL not saved correctly

**Solution**:
1. Check database `book.pdfFile` field contains the full URL
2. Verify the URL is accessible in a browser
3. Check Supabase Storage dashboard to confirm file exists

## Migration from Local Storage

If you have existing PDFs in `/public/pdfs/`:

1. The system will continue to serve them as fallback
2. For new uploads, PDFs will go to Supabase
3. Optionally migrate old PDFs manually:
   - Upload each PDF through admin interface
   - Or use a migration script to bulk upload to Supabase

## Cost Considerations

Supabase Free Tier includes:
- 1 GB storage
- 2 GB bandwidth/month

For production with many PDFs, consider upgrading to a paid plan.

## Security Notes

- Service role key has full access - keep it secret
- Never expose service role key in client-side code
- The `pdfFile` URLs are public but download endpoint requires authentication
- PDFs are served through API route with purchase verification

## Support

For issues or questions:
- Check Supabase Storage documentation: https://supabase.com/docs/guides/storage
- Review application logs for detailed error messages
