# Setup Instructions for Club Management System

## Database Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be fully provisioned

2. **Run Database Schema:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `database/clubs-schema.sql`
   - Run the SQL script to create the clubs table and policies

3. **Google Places API Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the "Places API"
   - Create an API key in "Credentials"
   - Restrict the API key to your domain for production

4. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Get your project URL and anon key from Supabase dashboard (Settings > API)
   - Add your Google Places API key
   - Update your `.env` file:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GOOGLE_PLACES_API_KEY=your-google-places-api-key
   ```

## Features Implemented

### 🏢 Club Management Dashboard
- **Header**: Clean navigation with title and logout button
- **Add Club Button**: Primary action to create new clubs
- **Clubs Table**: Display all clubs with contact information and actions
- **CRUD Operations**: Create, Read, Update, Delete clubs

### 📝 Club Form Modal
- **Dynamic Form**: Works for both creating and editing clubs
- **Field Validation**: Required fields and format validation
- **French Interface**: All text in French as requested
- **Responsive Design**: Works on desktop and mobile

### 🔔 Toast Notifications (French)
- **Success Messages**: "Club créé avec succès", "Club modifié avec succès", etc.
- **Error Messages**: "Erreur lors de la création", "Erreur lors de la suppression", etc.
- **Visual Feedback**: Green for success, red for errors

### 🗂️ Club Data Structure (Simplified)
- **Name** (required)
- **Address** (combined location/address with Google Places autocomplete)
- **Latitude/Longitude** (automatically filled via Google Places)
- **Created/Updated timestamps**

### 🔒 Security
- **Row Level Security (RLS)** enabled
- **User Authentication** required for all operations
- **Policies** for secure data access

## Usage

1. **Login**: Use the existing login form
2. **View Clubs**: Dashboard shows all registered clubs in a table
3. **Add Club**: Click "Ajouter un club" button to open form modal
4. **Edit Club**: Click edit icon (pencil) in table row
5. **Delete Club**: Click delete icon (trash) with confirmation dialog
6. **Toast Feedback**: All actions show success/error messages in French

## Development Commands

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Check code quality
```

## Components Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── ClubFormModal.tsx    # Modal with club form
│   ├── ClubsTable.tsx       # Table displaying clubs
│   └── Dashboard.tsx        # Main dashboard
├── lib/
│   ├── clubs.ts      # Club CRUD operations
│   └── supabase.ts   # Supabase client
└── types/
    └── club.ts       # TypeScript types
```

All text and user interface elements are in French as requested, providing a localized experience for French-speaking users.