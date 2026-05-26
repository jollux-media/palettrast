import { Router, type IRouter } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { savedSchemesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { Request, Response } from "express";
import { CreateSchemeBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.use(requireAuth());

router.get("/schemes", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  try {
    const rows = await db
      .select()
      .from(savedSchemesTable)
      .where(eq(savedSchemesTable.clerkUserId, userId!));
    const result = rows
      .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
      .map((s) => ({ ...s, savedAt: s.savedAt.toISOString() }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch schemes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schemes", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const parsed = CreateSchemeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }
  const { name, colours, maps } = parsed.data;
  try {
    const [created] = await db
      .insert(savedSchemesTable)
      .values({ clerkUserId: userId!, name, colours, maps })
      .returning();
    res.status(201).json({ ...created, savedAt: created.savedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create scheme");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schemes/:id", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const id = String(req.params.id);
  try {
    const deleted = await db
      .delete(savedSchemesTable)
      .where(and(eq(savedSchemesTable.id, id), eq(savedSchemesTable.clerkUserId, userId!)))
      .returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete scheme");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
