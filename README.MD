URL Shortener Project: 22691a05C9
Folder Structure

logging-middleware: Logging middleware implementation for backend and frontend.
backend: Node.js/Express microservice with URL shortening APIs using in-memory Map storage.
frontend: React application with Material UI for URL shortening and stats display.
screenshots: Contains Postman API screenshots and frontend mobile/desktop views.

Setup Instructions

Prerequisites:

Node.js (v16 or higher)
GitHub account for submission


Backend Setup:

Navigate to the backend folder: cd backend
Install dependencies: npm install
Create a .env file in the root directory with:PORT=5000
CLIENT_SECRET=your_client_secret


Start the server: npm run start-backend


Frontend Setup:

Navigate to the frontend folder: cd frontend
Install dependencies: npm install
Create a .env file in the frontend folder with:REACT_APP_CLIENT_SECRET=your_client_secret


Start the app: npm run start-frontend (runs on http://localhost:3000)



Deliverables

Backend:

Microservice with endpoints:
POST /shorturl5: Creates a short URL.
GET /shorturl5/:shortCode: Retrieves stats for a short URL.
GET /:shortCode: Redirects to the original URL.


Features: Unique shortcodes, 30-minute default expiry, custom shortcode support, robust error handling, in-memory Map storage.
Logging: Integrated middleware sends logs to http://20.244.56.144/evaluation-service/logs.


Frontend:

React app with Material UI, running on http://localhost:3000.
Features: URL shortening form, stats display, responsive design.
Logging: Integrated middleware for user actions and errors.


Screenshots:

Backend: Postman screenshots (request body, response, response time) in screenshots/backend.
Frontend: Mobile and desktop views in screenshots/frontend.



Submission Notes

Repository name: 22691A05D2 (your roll number).
Commit regularly at milestones (e.g., after each endpoint, component, or logging integration).
Register with the Test Server using the provided access code (caVvNH) and your university email/roll number.
Submit the GitHub repository link via the Google Form: Form Link.
Ensure no plagiarism and no mention of Affordmed or your name in the repository.

Architecture

Backend: Express with in-memory Map for URL storage. Uses validator for URL/shortcode validation and crypto for unique shortcode generation.
Frontend: React with Material UI for responsive UI. Uses Axios for API calls and state management for user input/results.
Logging: Middleware sends logs to the specified API with appropriate stack, level, and package values.

Testing

Test backend APIs using Postman:
POST http://localhost:5000/shorturl5 with body: {"longUrl": "https://example.com", "customShortCode": "mylink", "validityInMinutes": 60}
GET http://localhost:5000/shorturl5/mylink for stats
GET http://localhost:5000/mylink for redirection


Test frontend by accessing http://localhost:3000 and interacting with the UI.
Verify logs in the Test Server response or local console (if logging API fails).

Notes

Storage: Uses in-memory Map, so data is lost on server restart. Suitable for development/testing.
Logging: Sends logs to Test Server for all requests and actions.
Responsive Design: Frontend tested for mobile and desktop views using Material UI.
