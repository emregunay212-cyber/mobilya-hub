import { NextResponse } from "next/server";
import { requireAdmin, authError } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (auth) return authError(auth);

  const { id } = await params;
  const supabase = getAdminClient();

  const { data: deployment, error } = await supabase
    .from("deployments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !deployment) {
    return NextResponse.json({ error: "Deployment bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(deployment);
}
