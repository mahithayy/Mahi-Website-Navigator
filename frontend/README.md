README: Website Navigator (MERN Stack)
A full-stack web application that allows users to upload an Excel/CSV file containing website URLs and navigate through them seamlessly within the app.

 Live Demo
🔗 Frontend: https://mahi-website-navigator.vercel.app/
🔗 Backend API: https://mahi-website-navigator.onrender.com

No setup required — app is fully functional via deployed links.

Features
File Upload
Upload .xlsx or .csv files
Supports flexible column names (url, URL, link)
Validates file input and displays errors
URL Extraction
Parses Excel/CSV using xlsx (Please note that column header should be "url")
Normalizes column names (case-insensitive, trims spaces)
Filters out invalid/empty values
Website Navigation
Displays websites inside an iframe
Navigate websites using:
⬅ Previous
➡ Next
Shows current index and URL

Smart Error Handling
Handles real-world edge cases:
 Iframe blocked (X-Frame-Options / CSP)
 Site offline/unreachable
 Mixed content (HTTP inside HTTPS)
 Slow-loading websites (timeout warning)
 Invalid CSV / empty data
 Fallback Mechanism
If iframe fails → “Open in new tab” option provided
 MongoDB Integration
Stores uploaded URL lists in MongoDB Atlas
Tracks upload timestamp
Ensures persistence
 UI/UX Enhancements
Disabled file input after selection of a file.
Remove file button
File selection confirmation(shows a message after selection)
Loading states & error messages
Responsive, modern card-based UI

Tech Stack
Frontend
React.js
Axios
CSS (custom styling)
Backend
Node.js
Express.js
Multer (file uploads)
XLSX (file parsing)
Node-Fetch
Database
MongoDB Atlas
Mongoose

 Project Structure
website-navigator/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│
├── backend/
│   ├── models/
│   ├── uploads/ (temp files)
│   ├── server.js
│   ├── .env
│   └── .gitignore
│
└── README.md


 Setup Instructions
1️ Clone the repository
git clone https://github.com/mahithayy/Mahi-Website-Navigator.git
cd website-navigator

2️ Backend Setup
cd backend
npm install
For local development
Create a .env file inside backend/:
MONGO_URI=your_mongodb_connection_string

For deployed app (Render)
No setup required — environment variables are already configured.
Start backend:
node server.js


3️ Frontend Setup
cd frontend
npm install
npm start

API Endpoints
Upload File
POST /upload
Accepts: Excel/CSV file
Returns: Extracted URLs

Check Iframe Compatibility
GET /check-frame?url=<website_url>(ex: https://wikipedia.org)
Returns:
{
  blocked: boolean,
  offline: boolean,
  status: number,
  ok: boolean
}

 Key Technical Decisions
1. Robust CSV/Excel Parsing
Normalizes column names (trim + lowercase)
Handles inconsistent formats
2. Iframe Restrictions Handling
Backend checks headers (X-Frame-Options, CSP)
Frontend fallback for unreliable cases(Included an “Open in new tab” button)
3. Hybrid Detection Strategy
Backend validation + frontend timeout handling
Ensures better real-world reliability
4. File Cleanup
Temporary uploaded files deleted after processing. Otherwise every upload is stored in the uploads/ folder.
5. MongoDB Persistence
Stores each upload batch. The data persists even if the user has removed file in the frontend.
Enables future scalability (history, analytics)

 Known Limitations
Some websites block iframe embedding (security policies)
Not all sites expose headers reliably (HEAD request limitations)
Mixed content blocked on HTTPS

All these cases are handled gracefully with clear user feedback messages.

 Future Improvements
 Upload history view (from MongoDB)
 Search/filter URLs
 Bookmark favorite websites
 Analytics dashboard
 Drag & drop file upload
 Dark mode

 Author
Mahitha Holla
MERN Stack Developer

 License
This project is for educational and assignment purposes.
