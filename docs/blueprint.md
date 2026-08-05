# **App Name**: AI Resume Architect

## Core Features:

- Structured Form Input: UI components for users to input personal information, education, skills, experience, and projects.
- AI-Powered Resume Generation: Generates optimized resume content in a structured JSON format based on user input, leveraging the Gemini API. Acts as a tool optimizing for provided job descriptions.
- Resume Preview: Displays a real-time preview of the resume with a clean, professional layout.
- PDF Download: Generates a PDF version of the resume using jsPDF, ensuring a clean and ATS-friendly layout.
- API Endpoint for Resume Generation: An Express.js endpoint that receives resume data, interacts with the Gemini API, and returns structured JSON.
- Error Handling: Gracefully handles errors, especially when interacting with the Gemini API and data validation.

## Style Guidelines:

- Primary color: Deep ocean blue (#29ABE2) for trust and professionalism.
- Background color: Light grey (#F0F2F5) for a clean and modern look.
- Accent color: Soft teal (#70C7BC) for subtle highlights and interactive elements.
- Body and headline font: 'Inter', a sans-serif with a modern, machined look, appropriate for both headlines and body text.
- Responsive design to ensure a mobile-friendly experience.
- Use professional icons to represent different sections of the resume.
- Loading animation to provide user feedback during resume generation.