# Heisig Kanji Learning Application

A comprehensive web application for learning kanji using the Heisig method (Remembering the Kanji) with intelligent spaced repetition. Designed for undergraduate Japanese language courses with instructor tools for course management, student roster authentication, and an optimized learning system.

## Features

### For Students
- **Study Mode**: Browse through kanji sequentially with keyboard navigation
- **Quiz Mode**: Test your knowledge with multiple quiz types and spaced repetition
- **Mnemonic Stories**: Create and save personalized mnemonic stories for each kanji
- **SRS Dashboard**: Track your progress with visual statistics
- **Self-Assessment**: Rate your knowledge (Again/Hard/Good/Easy) to optimize review schedule
- **Offline-Ready**: All data stored locally in your browser

### For Instructors
- **Course Management**: Create custom lessons with selected kanji
- **Roster Integration**: Upload Canvas gradebook CSV for student authentication
- **Course Sharing**: Generate shareable codes, URLs, and QR codes
- **Lesson Editor**: Search, filter, and organize kanji into lessons
- **Access Tracking**: Monitor which students have accessed the application
- **Master Access**: Special access keys for instructors with extended sessions

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CSV Parsing**: PapaCSV
- **Data Storage**: localStorage (client-side only, no backend required)
- **Data Source**: cyphar/heisig-rtk-index (3039 kanji characters)

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for data extraction)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Quinna-create/japan370.git
cd japan370
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Extract Kanji Data

The repository includes ZIP files with kanji data. Extract them using the Python script:

```bash
python3 scripts/extract_kanji_data.py
```

This will create `public/data/kanji.json` with 3039 kanji characters.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" and import the `japan370` repository
3. Vercel will auto-detect Next.js configuration
4. Click "Deploy"
5. Your app will be live at `https://your-project.vercel.app`

The kanji data file is included in the repository and will be deployed automatically.

## Initial Setup for Instructors

### 1. Access Instructor Dashboard

- Navigate to `/login`
- Enter the master access key: `quinna` (default)
- You will be redirected to the instructor dashboard

### 2. Create a Course

- On first visit, you'll be prompted to create a course
- Enter course name (e.g., "Japanese 101 - Fall 2026")
- Add a brief description

### 3. Create Lessons

- Click "Create New Lesson"
- Enter lesson name and description
- Search for kanji using the character, keyword, or Heisig number
- Click kanji cards to add them to your lesson
- Save the lesson

### 4. Upload Student Roster

- Go to "Manage Roster"
- Upload your Canvas gradebook CSV file
- The system will extract student names, Panther IDs, emails, and sections
- Toggle the roster to "Active" to enable authentication

### 5. Share Course with Students

- Go to "Settings"
- Copy the course code or shareable URL
- Share with students via email, Canvas, or QR code
- Students use this to join your course

## Usage for Students

### 1. Join a Course

- Visit the application URL shared by your instructor
- Click "Join Course" and paste the course code
- OR: Click the shareable link directly (code is embedded)

### 2. Login

- Enter your Panther ID (from the roster)
- You'll be logged in with a 24-hour session

### 3. Study Kanji

- Go to "Study Mode" from the home page
- Navigate through kanji using arrow keys or buttons
- View kanji, meaning, and primitive components
- Create mnemonic stories to help you remember
- Stories are saved automatically to your local device

### 4. Take Quizzes

- Go to "Quiz Mode" from the home page
- Choose filter: Due Cards / New Cards / All Cards
- Choose quiz type:
  - Kanji → Meaning (most common)
  - Meaning → Kanji
  - Meaning → Primitives
  - Kanji → Story
- Reveal the answer and rate your knowledge:
  - **Again** (red): Forgot completely → Review in <1 day
  - **Hard** (orange): Struggled → Shorter interval
  - **Good** (green): Normal recall → Standard progression
  - **Easy** (blue): Instant recall → Longer interval

### 5. Track Progress

- View your SRS dashboard on the home page
- See cards due today, new cards, mature cards, and total studied
- Click "Review Now" when cards are due

## Data Storage

All data is stored in your browser's localStorage:

- **User Progress**: Your stories and review data for each kanji
- **Course Data**: Lesson configurations and kanji assignments
- **Roster Data**: Student roster and access tracking
- **Session Data**: Current login session (24 hours for students, 7 days for instructors)

### Export/Import Progress

Students can export their progress as JSON for backup and import it on another device.

## Master Access Keys

Default master access key: `quinna`

Master access users:
- Bypass roster authentication
- Access the instructor dashboard
- Have 7-day sessions instead of 24 hours
- Are identified with an amber theme in the UI

To configure master access keys:
1. Go to Instructor Dashboard → Settings
2. Edit the "Master Access Keys" field
3. Enter comma-separated keys (e.g., `quinna, admin, instructor`)
4. Save settings

## Spaced Repetition Algorithm

The app uses an SM-2/Anki-style spaced repetition algorithm:

- **New cards**: Start with no review data
- **Learning cards**: Recently introduced cards with <21 day intervals
- **Mature cards**: Well-known cards with 21+ day intervals

Rating effects:
- **Again**: Resets interval to 1 day, decreases ease factor
- **Hard**: Shorter interval (×1.2), decreases ease factor slightly
- **Good**: Standard progression (1d → 6d → exponential based on ease)
- **Easy**: Longer interval (4d → 10d → exponential ×1.3), increases ease factor

## File Structure

```
app/
  layout.tsx              # Root layout with AuthGuard
  page.tsx                # Home page with SRS dashboard
  login/page.tsx          # Student login
  join/page.tsx           # Course joining
  study/page.tsx          # Study mode
  quiz/page.tsx           # Quiz mode with SRS
  instructor/
    page.tsx              # Instructor dashboard
    roster/page.tsx       # Roster management
    lesson/[id]/page.tsx  # Lesson editor
    settings/page.tsx     # Settings and course sharing

components/
  AuthGuard.tsx           # Authentication wrapper
  KanjiCard.tsx           # Reusable kanji display
  UserHeader.tsx          # User info and logout
  SRSDashboard.tsx        # Progress dashboard
  CourseSharing.tsx       # Course distribution tools

lib/
  kanjiData.ts            # Kanji data loading
  storage.ts              # localStorage utilities
  lessonData.ts           # Course and lesson management
  rosterData.ts           # Roster and authentication
  courseSharing.ts        # Course distribution
  srsAlgorithm.ts         # Spaced repetition logic

types/
  kanji.ts                # TypeScript type definitions

scripts/
  extract_kanji_data.py   # Data extraction script

public/
  data/
    kanji.json            # Extracted kanji data (3039 characters)
```

## Troubleshooting

### Kanji data not loading
- Ensure `public/data/kanji.json` exists
- Run `python3 scripts/extract_kanji_data.py` to regenerate

### Students can't log in
- Check if roster is uploaded and activated in Roster Management
- Verify student Panther ID matches the roster

### Session expired
- Students: Sessions last 24 hours
- Instructors: Master access sessions last 7 days
- Simply log in again to create a new session

### Course code doesn't work
- Ensure the course has been created and has lessons
- Try generating a new course code in Settings

## Development

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Lint code
```bash
npm run lint
```

### Type checking
```bash
npx tsc --noEmit
```

## Contributing

This is an educational project for Japanese language courses. Contributions are welcome!

## License

This project uses data from [cyphar/heisig-rtk-index](https://github.com/cyphar/heisig-rtk-index), which is released under the Creative Commons licenses.

## Support

For issues or questions, please contact your course instructor or open an issue on GitHub.

## Acknowledgments

- Kanji data from cyphar/heisig-rtk-index
- Inspired by the Heisig "Remembering the Kanji" method
- SRS algorithm based on SM-2 and Anki
