# Technical Specification: AI-Powered Resume Builder

## 1. Product Overview

### 1.1 Core Features
- **User Authentication**: Secure signup/login via Email/Password and Google OAuth.
- **Dashboard**: Central hub to view, edit, delete, and create new resumes.
- **Resume Builder**: Step-by-step form interface for entering personal details, education, experience, skills, and projects.
- **AI-Powered Suggestions**: Use Google Gemini to generate professional summaries, optimize bullet points, and suggest skills based on job titles.
- **Real-time Preview**: Live preview of the resume as the user edits.
- **PDF Export**: High-quality PDF generation of the finalized resume.
- **Resume Scoring (Optional)**: AI analysis of the resume against a specific job description.

### 1.2 Target Users
- Job seekers (entry-level to experienced professionals).
- Students creating their first resumes.
- Professionals looking to tailor resumes for specific job applications.

### 1.3 Key Value Proposition
- **Speed**: Create a professional resume in minutes, not hours.
- **Quality**: AI-driven content optimization ensures high-quality, impactful language.
- **Customization**: Easily tailor resumes for different job roles with AI assistance.
- **Aesthetics**: Modern, professional templates that stand out.

---

## 2. System Architecture

### 2.1 High-Level Architecture
The application follows a standard MERN stack architecture with an external integration for AI services.

- **Frontend (Client)**: React.js application (SPA) hosted on a CDN (e.g., Vercel/Netlify). Handles user interaction, state management, and API calls.
- **Backend (Server)**: Node.js/Express REST API. Handles business logic, authentication, database interactions, and proxies requests to the AI service.
- **Database**: MongoDB (Atlas). Stores user data, resume content, and templates.
- **AI Service**: Google Gemini API. Accessed via the backend to generate content and analyze text.

### 2.2 Data Flow
1.  **User Action**: User enters resume details (e.g., job description) in the React frontend.
2.  **API Request**: Frontend sends a request to the Backend (e.g., `POST /api/ai/generate-summary`).
3.  **Processing**: Backend validates the request and constructs a prompt for Gemini.
4.  **AI Interaction**: Backend sends the prompt to Google Gemini API.
5.  **Response Handling**: Gemini returns the generated text. Backend parses/formats it.
6.  **Response Delivery**: Backend sends the formatted data back to the Frontend.
7.  **Update UI**: Frontend updates the specific form field or displays the suggestion to the user.
8.  **Persistence**: User saves the resume; Frontend sends entire resume object to Backend -> Database.

### 2.3 Scalability & Deployment
- **Stateless Backend**: The Node.js API is stateless, allowing for horizontal scaling (multiple instances) behind a load balancer.
- **Database**: MongoDB Atlas handles scaling (sharding/replication) automatically.
- **Caching**: Implement Redis (optional phase 2) for caching frequently accessed data (e.g., templates) or rate-limiting AI requests.

---

## 3. Frontend (React)

### 3.1 Component Structure
- `App.js`: Main router setup (React Router).
- `layouts/`:
    - `MainLayout`: Navbar, Footer.
    - `AuthLayout`: Centered layout for Login/Register.
- `pages/`:
    - `Home`: Landing page.
    - `Dashboard`: List of user's resumes.
    - `Editor`: Main resume builder interface.
    - `Login` / `Register`.
- `components/`:
    - `resume/`:
        - `ResumeForm`: Main container for form sections.
        - `FormSection` (Generic wrapper).
        - `PersonalDetails`, `Education`, `Experience`, `Skills`.
        - `Preview`: Renders the resume based on selected template.
    - `ai/`:
        - `AIInsightsPanel`: Sidebar or modal for AI suggestions.
        - `AIGeneratorButton`: Button to trigger AI generation for a specific field.
    - `common/`: `Button`, `Input`, `Loader`, `Modal`, `Toast`.

### 3.2 State Management
- **Context API + useReducer** (or **Zustand**): For managing the complex state of the active resume being edited.
- **React Query**: For server state (fetching list of resumes, saving data, AI requests). Handles caching and loading states automatically.

### 3.3 Form Handling & Validation
- **React Hook Form**: For performant, uncontrolled form inputs.
- **Zod**: Schema validation for form data. Ensures data integrity before sending to backend.

### 3.4 UI/UX Considerations
- **Live Preview**: Split-screen view (Form on left, Preview on right) for desktop. Tabs for mobile.
- **Drag & Drop**: Use `dnd-kit` or `react-beautiful-dnd` to reorder customized lists (e.g., experience items).
- **Loading States**: Skeleton loaders and specific spinners for AI operations ("Genie is thinking...").
- **Theme**: Tailwind CSS for rapid, responsive styling. Dark/Light mode support.

---

## 4. Backend (Node.js + Express)

### 4.1 RESTful API Design

**Auth Routes** (`/api/auth`)
- `POST /register`: Register new user.
- `POST /login`: Authenticate user (JWT).
- `GET /me`: Get current user profile.

**Resume Routes** (`/api/resumes`)
- `POST /`: Create a new resume.
- `GET /`: Get all resumes for the logged-in user.
- `GET /:id`: Get specific resume details.
- `PUT /:id`: Update a resume.
- `DELETE /:id`: Delete a resume.

**AI Routes** (`/api/ai`)
- `POST /generate-summary`: Generate a professional summary based on experience/job title.
- `POST /improve-content`: Rewrite a specific bullet point or text block.
- `POST /suggest-skills`: Suggest skills based on role/industry.

### 4.2 Middleware
- **`authMiddleware`**: Verifies JWT token attached to requests.
- **`validationMiddleware`**: Uses Joi or Zod schemas to validate request body.
- **`errorMiddleware`**: Centralized error handling to return consistent JSON error responses.

### 4.3 Integration with Google Gemini
- Use `@google/generative-ai` SDK.
- Create a service layer (`services/aiService.js`) to encapsulate Gemini interaction logic.

### 4.4 Security Best Practices
- **Rate Limiting**: Use `express-rate-limit` to prevent abuse, especially on AI endpoints.
- **Input Sanitization**: Sanitize user inputs to prevent XSS (though React handles most of this).
- **Helmet**: Set secure HTTP headers.
- **CORS**: Restrict access to the frontend domain.
- **Env Variables**: Store API keys (GEMINI_API_KEY, JWT_SECRET, MONGO_URI) in `.env`, never in code.

---

## 5. Database (MongoDB)

### 5.1 Schema Design

**User Schema**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String,
  firstName: String,
  lastName: String,
  createdAt: Date
}
```

**Resume Schema**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', indexed),
  title: String, // e.g., "Software Engineer Resume"
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    linkedin: String,
    portfolio: String
  },
  summary: String,
  education: [
    {
      institution: String,
      degree: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    }
  ],
  experience: [
    {
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String // Rich text or array of bullet points
    }
  ],
  skills: [String],
  projects: [...],
  themeColor: String,
  templateId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 Relationships & Indexing
- **One-to-Many**: User -> Resumes.
- **limitations**: If embedding resumes inside the User document (not recommended for scalability), max size is 16MB. Reference model (as shown above) is better.
- **Indexes**: `userId` on Resume collection for fast retrieval of a user's resumes.

---

## 6. AI Integration

### 6.1 Prompt Structure
**Goal**: Deterministic and high-quality JSON or structured text responses.

**Example: Improving a Bullet Point**
> "You are an expert resume writer. Rewrite the following resume bullet point to be more impactful, using action verbs and quantifying results where possible. 
> Original: 'Worked on the frontend team to build features.'
> Output specific 3 options in JSON format: { 'options': ['Developed...', 'Led...', 'Architected...'] }"

### 6.2 Handling Responses
- Parse JSON responses safely.
- Fallback text if the AI returns malformed data or times out.
- Clean up any markdown syntax if Gemini includes it (e.g., removing ```json ... ``` wrappers).

### 6.3 Error Handling
- **Quotas**: Handle `429 Too Many Requests` from Gemini API gracefully.
- **Content Filtering**: Ensure generated content is professional and safe.

---

## 7. Deployment & DevOps

### 7.1 Environment Configuration
- `.env.development` / `.env.production`.
- **Variables**:
    - `PORT`
    - `MONGO_URI`
    - `JWT_SECRET`
    - `GEMINI_API_KEY`
    - `CLIENT_URL`

### 7.2 CI/CD Suggestions
- **GitHub Actions**:
    - On Push: Run linting (`eslint`), unit tests (`jest`).
    - On Merge to Main: Trigger deployment hook to Render/Vercel.

### 7.3 Hosting Recommendations
- **Frontend**: Vercel or Netlify (Free tier is excellent for React).
- **Backend**: Render (Web Service) or Railway.
- **Database**: MongoDB Atlas (Free tier M0 Sandbox).

---

## 8. Optional Enhancements

- **Resume Scoring**: Analyze resume content against a provided Job Description text and give a match score (0-100%) with missing keywords.
- **PDF Export**: generate PDFs on the client side using `@react-pdf/renderer` or server-side with `puppeteer`.
- **Version History**: Keep track of last 5 edits to undo changes.
- **Cover Letter Generator**: Use the same profile data + JD to write a cover letter.
