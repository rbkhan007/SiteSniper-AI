import { NextRequest, NextResponse } from "next/server";
import { requireAuth, getAuthToken, getAdminPB } from "@/lib/auth";
import { PBHttp } from "@/lib/pb-http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const adminPb = await getAdminPB();

    const campaign = await pb.collection("campaigns").getOne(id);

    if (!campaign || campaign.user !== user.id) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const leads = await adminPb.collection("leads").getList(1, 1000, {
      filter: "campaign = '" + id + "'",
    });
    leads.items.sort((a: any, b: any) => (b.created > a.created ? 1 : -1));

    return NextResponse.json({
      campaign: { ...campaign, leads: leads.items },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const adminPb = await getAdminPB();

    const campaign = await pb.collection("campaigns").getOne(id);

    if (!campaign || campaign.user !== user.id) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Delete associated leads first (PB cascade-delete edge case)
    const leads = await adminPb.collection("leads").getList(1, 1000, {
      filter: "campaign = '" + id + "'",
    });
    for (const lead of leads.items) {
      try { await adminPb.collection("leads").delete(lead.id); } catch {}
    }

    await pb.collection("campaigns").delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const token = await getAuthToken();
    const pb = new PBHttp(token);
    const body = await request.json();

    const campaign = await pb.collection("campaigns").getOne(id);

    if (!campaign || campaign.user !== user.id) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const updated = await pb.collection("campaigns").update(id, {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isArchived !== undefined && { isArchived: body.isArchived }),
    });

    return NextResponse.json({ campaign: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
