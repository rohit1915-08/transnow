import { NextResponse } from "next/server";
import { translate } from "@vitalets/google-translate-api";

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json(
        { error: "Missing text or language" },
        { status: 400 }
      );
    }

    const targetLang = language.split("-")[0]; // pt-BR → pt

    const result = await translate(text, { to: targetLang });

    return NextResponse.json({
      text: result.text,
    });
  } catch (error) {
    console.error("GOOGLE TRANSLATE ERROR:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
