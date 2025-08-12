// Update this base URL to your Marketplace API. Do not include a trailing slash.
const MARKETPLACE_API_BASE = "https://your-marketplace-api.com";

type Price = { type: "free" | "one_time" | "subscription"; amount: number };

type ListingPayload = {
  agentId: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatarUrl: string;
  price: Price;
  ownerId: string;
};

export async function createListing(payload: ListingPayload): Promise<{ listingId: string; status: string }> {
  const res = await fetch(`${MARKETPLACE_API_BASE}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create listing failed (${res.status})`);
  return res.json();
}

export async function updateListing(listingId: string, payload: Partial<ListingPayload>): Promise<{ listingId: string; status: string }> {
  const res = await fetch(`${MARKETPLACE_API_BASE}/listings/${listingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update listing failed (${res.status})`);
  return res.json();
}

export async function unpublishListing(listingId: string): Promise<{ listingId: string; status: string }> {
  const res = await fetch(`${MARKETPLACE_API_BASE}/listings/${listingId}/unpublish`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Unpublish failed (${res.status})`);
  return res.json();
}

export async function checkLicense(agentId: string, userId: string): Promise<{ licensed: boolean }> {
  const url = `${MARKETPLACE_API_BASE}/licenses?agentId=${encodeURIComponent(agentId)}&userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`License check failed (${res.status})`);
  return res.json();
}

// Optional helper in case a deep link provides listingId and you want to clone data locally
export async function fetchListing(listingId: string): Promise<any> {
  const res = await fetch(`${MARKETPLACE_API_BASE}/listings/${listingId}`);
  if (!res.ok) throw new Error(`Fetch listing failed (${res.status})`);
  return res.json();
}
