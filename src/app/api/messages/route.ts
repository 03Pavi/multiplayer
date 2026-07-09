import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/server/repository";
import { Message } from "@/types";

// GET /api/messages?code=XXXX
export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }
    const messages = await repository.getMessages(code);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[API] GET /messages failed:", err);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

// POST /api/messages  { code, sender:{id,name,avatar}, content, isSystem? }
export async function POST(req: NextRequest) {
  try {
    const { code, sender, content, isSystem } = (await req.json()) as {
      code: string;
      sender: { id: string; name: string; avatar: string };
      content: string;
      isSystem?: boolean;
    };

    if (!code || !content?.trim()) {
      return NextResponse.json({ error: "Missing code or content" }, { status: 400 });
    }

    const msg: Message = {
      id: `msg-${Date.now()}`,
      roomId: code,
      senderId: sender?.id || "system",
      senderName: sender?.name || "System",
      senderAvatar: sender?.avatar || "",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      isSystem: Boolean(isSystem),
    };

    const stored = await repository.addMessage(code, msg);
    return NextResponse.json({ message: stored });
  } catch (err) {
    console.error("[API] POST /messages failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
