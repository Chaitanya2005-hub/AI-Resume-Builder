"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Basic list of ATS-friendly keywords – can be expanded as needed
const KEYWORDS = [
  "lead",
  "manage",
  "develop",
  "project",
  "team",
  "design",
  "implement",
  "optimize",
  "strategic",
  "analysis",
];

function calculateScore(text: string): number {
  const lower = text.toLowerCase();
  let matchCount = 0;
  for (const kw of KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`, "g");
    const matches = lower.match(regex);
    if (matches) matchCount += matches.length;
  }
  const possible = KEYWORDS.length;
  // Simple density: matched distinct keywords / total keywords
  const distinctMatched = KEYWORDS.filter((kw) => lower.includes(kw)).length;
  return Math.round((distinctMatched / possible) * 100);
}

export default function ATSChecker() {
  const [resumeText, setResumeText] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const handleCheck = () => {
    const s = calculateScore(resumeText);
    setScore(s);
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-12 bg-background">
      <h1 className="text-3xl font-bold mb-6 text-primary">ATS Compatibility Checker</h1>
      <textarea
        className="w-full max-w-2xl h-64 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Paste your resume text here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <Button className="mt-4" onClick={handleCheck} disabled={!resumeText.trim()}>
        Check Compatibility
      </Button>
      {score !== null && (
        <div className="mt-6 text-xl font-medium">
          <span>Keyword Match Score: </span>
          <span className={score >= 70 ? "text-green-600" : "text-red-600"}>{score}%</span>
        </div>
      )}
      <Link href="/builder"><Button className="mt-4">Back to Builder</Button></Link>
    </div>
  );
}
