import { NextRequest, NextResponse } from "next/server";
import { fetchLeads, BusinessLead } from "@/lib/places";

function templateSummary(business: Omit<BusinessLead, "summary">): string {
  const ratingPart =
    business.rating && business.reviewCount
      ? `They already have a ${business.rating}-star rating with ${business.reviewCount} Google reviews, so customers love them.`
      : business.rating
      ? `They have a ${business.rating}-star rating on Google.`
      : `They have a solid local reputation but no online presence yet.`;

  return `${ratingPart} Since ${business.name} has no website, a simple site could help them show up on Google searches and turn more ${business.city} locals into paying customers.`;
}

async function generateSummaryWithAI(business: Omit<BusinessLead, "summary">): Promise<string> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const ratingNote =
    business.rating && business.reviewCount
      ? `They have a ${business.rating}-star rating with ${business.reviewCount} reviews.`
      : business.rating
      ? `They have a ${business.rating}-star rating.`
      : "They have no online rating yet.";

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [
      {
        role: "user",
        content: `Write exactly 2 short sentences (total under 60 words) for a cold call script about ${business.name}, a ${business.category} business in ${business.city}, ${business.state}. ${ratingNote} They have NO website. Mention something positive about their business and naturally lead into why a website would help them get more customers. Be conversational, not salesy.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return text.trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY is not configured. See setup instructions." },
      { status: 500 }
    );
  }

  const useAI = !!process.env.ANTHROPIC_API_KEY;
  const serperKey = process.env.SERPER_API_KEY || null;

  const generateSummary = useAI
    ? generateSummaryWithAI
    : (b: Omit<BusinessLead, "summary">) => Promise.resolve(templateSummary(b));

  const body = await req.json().catch(() => ({}));
  const seenIds: string[] = Array.isArray(body.seenIds) ? body.seenIds : [];
  const openNowOnly: boolean = body.openNowOnly === true;
  const selectedCategories: string[] = Array.isArray(body.selectedCategories) ? body.selectedCategories : [];

  try {
    const leads = await fetchLeads(seenIds, apiKey, serperKey, openNowOnly, selectedCategories, generateSummary);
    return NextResponse.json({ leads, aiSummaries: useAI });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch leads. Check server logs." }, { status: 500 });
  }
}
