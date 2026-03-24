import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-in-production"
);

export async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "customer") return null;
    return { id: payload.sub as string, email: payload.email as string, store_id: payload.store_id as string };
  } catch {
    return null;
  }
}
