import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'Missing html' }, { status: 400 });
    }

    // For now, return the HTML as-is since PDF generation requires browser APIs
    // In a real implementation, you would use puppeteer or similar server-side PDF generation
    console.warn('PDF generation not fully implemented server-side - returning HTML');
    
    return NextResponse.json({ 
      pdf: '',
      html: html,
      message: 'PDF generation requires client-side rendering. HTML provided for email body.' 
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
