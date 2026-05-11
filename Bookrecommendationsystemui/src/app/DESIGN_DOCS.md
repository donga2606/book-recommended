# Book Recommendation System - UI Documentation

## Overview
A modern web application for book recommendations with three distinct role interfaces: User, Admin, and Data Scientist.

## Design System
- **Color Palette**: Soft purples, pinks, and blues for accents on white backgrounds
- **Style**: Clean, minimal, card-based layout inspired by Netflix and Goodreads
- **Typography**: Using system defaults with consistent hierarchy
- **Spacing**: Generous padding and rounded corners (rounded-2xl, rounded-xl)

## Architecture

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│  Sidebar (64px width)                           │
│  ┌──────────┐  ┌─────────────────────────────┐ │
│  │  Logo    │  │                             │ │
│  ├──────────┤  │                             │ │
│  │  Role    │  │    Main Content Area        │ │
│  │ Switcher │  │    (Scrollable)             │ │
│  ├──────────┤  │                             │ │
│  │   Nav    │  │                             │ │
│  │  Links   │  │                             │ │
│  ├──────────┤  └─────────────────────────────┘ │
│  │  User    │                                   │
│  │  Info    │                                   │
│  └──────────┘                                   │
└─────────────────────────────────────────────────┘
```

## User Interface

### 1. Home Page (/)
- **Purpose**: Display personalized book recommendations
- **Components**:
  - Welcome header with user name
  - 3-column responsive grid of book cards
  - Each card shows:
    - Book cover image (aspect ratio 3:4)
    - Title and author
    - Star rating
    - Genre tag
    - "Why recommended" section with purple background

### 2. Search Page (/search)
- **Purpose**: Advanced book search with filters
- **Components**:
  - Search bar with icon
  - Filter dropdowns: Genre, Min Rating
  - Results count
  - 4-column responsive grid of book cards
  - Simplified cards (no recommendation reason)

### 3. Book Detail Page (/book/:id)
- **Purpose**: Detailed view of a single book
- **Components**:
  - Back button
  - Two-column layout:
    - Left: Large book cover
    - Right: Full book details
      - Genre badge
      - Title and author
      - Large star rating
      - Meta information (year, pages, ISBN)
      - Full description
      - Action buttons (Add to List, Mark as Read)
  - Similar books section below

### 4. Profile Page (/profile)
- **Purpose**: User reading history and preferences
- **Components**:
  - Profile card with:
    - Avatar
    - Name and email
    - Books read count
    - Reading preferences tags
    - Edit button
  - Reading history grid (3 columns)
  - "Completed" badges on read books

## Admin Dashboard (/admin)

### Purpose
Manage all books in the system with CRUD operations

### Components
1. **Header Section**:
   - Title and description
   - "Add Book" button

2. **Statistics Cards** (3 columns):
   - Total Books count
   - Average Rating
   - Number of Genres

3. **Books Table**:
   - Columns: Title, Author, Genre, Rating, Year, Actions
   - Genre displayed as pill/badge
   - Star icon for rating
   - Edit and Delete action buttons
   - Hover effects on rows

4. **Add/Edit Dialog**:
   - Modal form with fields:
     - Title, Author (row 1)
     - Genre, Rating (row 2)
     - Description (full width)
     - Year, Pages, ISBN (row 3)
     - Cover URL (full width)
   - Cancel and Submit buttons

## Data Scientist Dashboard (/data-scientist)

### Purpose
Monitor model performance and analytics

### Components

1. **Model Status Banner** (gradient purple to pink):
   - Model status (Trained/Training) with icon
   - Last trained timestamp
   - Training duration
   - "Retrain Model" button
   - 4 metric cards:
     - Accuracy: 87.5%
     - Precision: 84.2%
     - Recall: 89.3%
     - F1 Score: 86.7%

2. **Analytics Charts** (2 columns):
   - **User Activity Line Chart**:
     - Shows total users vs active readers over 6 months
     - Purple and pink lines
     - Grid and tooltips
   
   - **Popular Books Bar Chart**:
     - Top 5 most-read books
     - Purple bars with rounded tops
     - Angled labels for readability

3. **Insights Cards** (3 columns):
   - Engagement Rate: 87.3% (↑ 12.5%)
   - Avg. Session Time: 24 min (↑ 8.2%)
   - Click-Through Rate: 42.1% (↑ 5.7%)
   - Each with colored icon background

## Navigation

### Sidebar Structure
1. **Logo Section**: BookRec with book icon
2. **Role Switcher**: Toggle between User/Admin/Data Scientist
3. **Navigation Menu**: Context-sensitive based on role
   - User: Home, Search Books, My Profile
   - Admin/Data Scientist: No additional nav items
4. **User Info**: Avatar, name, email at bottom

### Active States
- Active links: Purple background (bg-purple-50) with purple text
- Inactive links: Gray text with hover state

## Color Palette

### Primary Colors
- Purple: `#8b5cf6` (purple-600)
- Pink: `#ec4899` (pink-500)
- Blue: `#3b82f6` (blue-500)

### Neutral Colors
- Background: `#f8fafc` (slate-50)
- Cards: `#ffffff` (white)
- Text Primary: `#1e293b` (slate-800)
- Text Secondary: `#64748b` (slate-600)
- Borders: `#e2e8f0` (slate-200)

### Accent Colors
- Success: Green (`#22c55e`)
- Warning: Amber (`#f59e0b`)
- Rating: Amber (`#fbbf24`)
- Error: Red (`#ef4444`)

## Interactions

### Hover Effects
- Cards: Shadow elevation on hover
- Images: Scale transform (105%) on hover
- Buttons: Slight color darkening
- Table rows: Background color change

### Transitions
- All transitions: 200ms ease
- Image transforms: 300ms ease

## Responsive Design
- **Desktop First**: Optimized for 1440px+
- **Breakpoints**:
  - lg: 3-4 columns for book grids
  - md: 2 columns
  - sm: 1 column
- Sidebar remains fixed on all screen sizes
- Charts are responsive with ResponsiveContainer

## Key Features

### User Experience
✓ Personalized recommendations with explanations
✓ Advanced search with multiple filters
✓ Detailed book information
✓ Reading history tracking

### Admin Features
✓ Complete CRUD operations
✓ Inline editing in modal
✓ Data validation
✓ Real-time statistics

### Data Science Features
✓ Model performance metrics
✓ User activity analytics
✓ Popular content tracking
✓ One-click model retraining

## Technical Stack
- React Router for navigation
- Recharts for data visualization
- Radix UI components for accessibility
- Tailwind CSS for styling
- Lucide React for icons
