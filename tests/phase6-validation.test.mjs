import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Phase 6 Server Actions exist and are exported", async () => {
  const actions = await readFile(path.join(root, "app/(dashboard)/actions.ts"), "utf8");
  
  assert.match(actions, /export async function acknowledgeAlert\(/);
  assert.match(actions, /export async function assignAlert\(/);
  assert.match(actions, /export async function createAlertCase\(/);
  
  assert.match(actions, /export async function acknowledgeCase\(/);
  assert.match(actions, /export async function assignCase\(/);
  assert.match(actions, /export async function addCaseNote\(/);
  assert.match(actions, /export async function requestCaseVerification\(/);
  assert.match(actions, /export async function escalateCase\(/);
  assert.match(actions, /export async function recordCaseDisposition\(/);
  assert.match(actions, /export async function resolveCase\(/);
  assert.match(actions, /export async function closeCase\(/);
  assert.match(actions, /export async function reopenCase\(/);

  assert.match(actions, /export async function startSimulation\(/);
  assert.match(actions, /export async function stepSimulation\(/);
  assert.match(actions, /export async function resetSimulation\(/);
});

test("Phase 6 translation catalogs contain all NestJS alert keys", async () => {
  const en = JSON.parse(await readFile(path.join(root, "messages/en.json"), "utf8"));
  const bn = JSON.parse(await readFile(path.join(root, "messages/bn.json"), "utf8"));

  const requiredKeys = [
    "alerts.provider_emoney_pressure.review",
    "alerts.shared_cash_pressure.review",
    "alerts.unusual_activity_review.review",
    "alerts.data_quality_issue.review",
    "alerts.combined_review.review",
    "alerts.next.alerts.provider_emoney_pressure.review",
    "alerts.next.alerts.shared_cash_pressure.review",
    "alerts.next.alerts.unusual_activity_review.review",
    "alerts.next.alerts.data_quality_issue.review",
    "alerts.next.alerts.combined_review.review"
  ];

  for (const key of requiredKeys) {
    assert.ok(en[key], `Missing English translation for ${key}`);
    assert.ok(bn[key], `Missing Bengali translation for ${key}`);
  }
});
