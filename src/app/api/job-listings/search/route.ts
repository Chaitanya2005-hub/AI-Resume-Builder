import { NextResponse } from 'next/server';

const MOCK_JSEARCH_JOBS = [
  {
    job_id: 'jsearch_demo_1',
    employer_name: 'TechCorp Solutions',
    employer_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
    job_title: 'Senior React / Full Stack Engineer',
    job_publisher: 'LinkedIn',
    job_country: 'US',
    job_city: 'San Francisco',
    job_state: 'CA',
    job_is_remote: true,
    job_apply_link: 'https://www.linkedin.com/jobs',
    job_description: `We are looking for a Senior React / Full Stack Engineer to join our team. 

Key Responsibilities:
- Build high performance web applications using React, Next.js, and TypeScript.
- Design RESTful and GraphQL APIs with Node.js and PostgreSQL.
- Collaborate with product designers and backend engineers.

Requirements:
- 5+ years of experience with React, JavaScript, TypeScript, Node.js.
- Strong knowledge of state management, Next.js App Router, and Tailwind CSS.
- Experience with CI/CD, Docker, and AWS cloud deployment.`,
  },
  {
    job_id: 'jsearch_demo_2',
    employer_name: 'Innovate AI Labs',
    employer_logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100',
    job_title: 'AI Software Engineer',
    job_publisher: 'Indeed',
    job_country: 'US',
    job_city: 'New York',
    job_state: 'NY',
    job_is_remote: true,
    job_apply_link: 'https://www.indeed.com',
    job_description: `Innovate AI Labs is seeking an AI Software Engineer to integrate GenAI solutions into enterprise applications.

Responsibilities:
- Integrate LLM APIs (OpenAI, Gemini, Anthropic) using Genkit / LangChain.
- Develop scalable Python / TypeScript microservices.
- Optimize prompt engineering and RAG pipeline retrieval performance.

Requirements:
- Proficiency in Python, TypeScript, Node.js, and Vector Databases (pgvector, Pinecone).
- Experience with Cloud platforms (GCP / AWS) and Docker.`,
  },
  {
    job_id: 'jsearch_demo_3',
    employer_name: 'Fintech Dynamics',
    employer_logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100',
    job_title: 'Lead Frontend Architect',
    job_publisher: 'Glassdoor',
    job_country: 'US',
    job_city: 'Austin',
    job_state: 'TX',
    job_is_remote: false,
    job_apply_link: 'https://www.glassdoor.com',
    job_description: `Lead Frontend Architect needed to oversee web applications for global financial platform.

Responsibilities:
- Architect micro-frontend architecture using Next.js and React 19.
- Ensure strict web performance, accessibility, and ATS compliance.
- Mentor junior and mid-level software engineers.

Requirements:
- 7+ years of frontend software development experience.
- Deep expertise in Web Vitals optimization, TypeScript, and state architecture.`,
  },
];

export async function POST(req: Request) {
  try {
    const { query = 'Software Engineer', location = '', page = 1 } = await req.json();

    const apiKey = process.env.RAPIDAPI_KEY || process.env.JSEARCH_API_KEY;

    if (apiKey && apiKey !== 'YOUR_RAPIDAPI_KEY') {
      const searchQuery = encodeURIComponent(`${query} ${location}`.trim());
      const url = `https://jsearch.p.rapidapi.com/search?query=${searchQuery}&page=${page}&num_pages=1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          status: 'OK',
          data: data.data || [],
          source: 'jsearch_api',
        });
      }
    }

    // Fallback if key is not configured or query fails
    const filteredMocks = MOCK_JSEARCH_JOBS.filter(
      (job) =>
        job.job_title.toLowerCase().includes(query.toLowerCase()) ||
        job.employer_name.toLowerCase().includes(query.toLowerCase()) ||
        job.job_description.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({
      status: 'OK',
      data: filteredMocks.length ? filteredMocks : MOCK_JSEARCH_JOBS,
      source: 'sample_feed',
      note: !apiKey || apiKey === 'YOUR_RAPIDAPI_KEY' ? 'Set RAPIDAPI_KEY in .env for live JSearch API calls' : undefined,
    });
  } catch (error: any) {
    console.error('JSearch API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search jobs via JSearch' },
      { status: 500 }
    );
  }
}
