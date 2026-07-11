"use client";

import { use, useEffect, useState } from "react";
import { OutletDetailView } from "@/components/outlets/outlet-detail-view";
import { minimalApiRequest } from "@/lib/api/minimal-client";
import { PageLoading } from "@/components/shared/page-loading";
import { ErrorState } from "@/components/shared/error-state";
import type { OutletDetail } from "@/lib/operations/outlet-detail";

export default function OutletDetailPage({ params }: { params: Promise<{ outletId: string }> }) {
  const { outletId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outlet, setOutlet] = useState<OutletDetail | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        setError(null);

        // Fetch basic info and details in parallel
        const [rawOutlets, rawProviders, health, balances, forecasts, quality, transactions] = await Promise.all([
          minimalApiRequest<any[]>("outlets"),
          minimalApiRequest<any[]>("providers"),
          minimalApiRequest<any>(`outlets/${outletId}/health`),
          minimalApiRequest<any>(`outlets/${outletId}/balances`),
          minimalApiRequest<any>(`outlets/${outletId}/forecasts`),
          minimalApiRequest<any>(`outlets/${outletId}/data-quality`),
          minimalApiRequest<any>(`outlets/${outletId}/transactions`),
        ]);

        const currentOutlet = rawOutlets.find((o) => o.id === outletId);
        if (!currentOutlet) {
          setError("Outlet not found");
          setLoading(false);
          return;
        }

        const providerById = new Map(rawProviders.map((p) => [p.id, p.code]));
        const limiting = health.limitingResource;
        const provider = limiting?.providerId ? providerById.get(limiting.providerId) ?? "SHARED" : "SHARED";
        const resource = forecasts.resources?.find(
          (item: any) => item.resource === limiting?.resource && item.providerId === limiting?.providerId
        ) ?? forecasts.resources?.[0];
        const lastPoint = resource?.points?.at(-1);

        const risk = lastPoint?.riskBand === "high" || lastPoint?.riskBand === "critical"
          ? "high"
          : lastPoint?.riskBand === "moderate"
          ? "medium"
          : "low";

        const freshness = quality.dataQuality === "healthy" ? "fresh" : quality.dataQuality === "degraded" ? "degraded" : "stale";
        const dataQuality = quality.dataQuality === "healthy" ? "good" : quality.dataQuality === "degraded" ? "degraded" : "critical";

        const mappedDetail: OutletDetail = {
          id: currentOutlet.id,
          outletName: currentOutlet.name,
          area: currentOutlet.area?.name || "Unknown",
          agentName: "Not provided by API",
          provider,
          freshness,
          dataQuality,
          updatedAt: forecasts.generatedAt || new Date().toISOString(),
          sharedCashMinor: balances.sharedCash?.amountMinor || "0",
          providerEfloatMinor: balances.providerEMoney?.find((e: any) => e.provider.code === provider)?.amountMinor || null,
          limitingResource: limiting?.resource === "provider_efloat" ? `${provider} e-money` : limiting?.resource === "shared_cash" ? "Shared physical cash" : "Not provided by API",
          risk,
          thresholdEtaMinutes: lastPoint?.reserveEtaMinutes ?? null,
          confidence: health.modelConfidence || 0.9,
          safeNextStep: quality.dataQuality === "critical"
            ? "Verify data before relying on any forecast or escalating the case."
            : risk === "high"
            ? "Verify demand context and contact authorized operations."
            : risk === "medium"
            ? "Monitor outlet and verify if pressure persists."
            : "No immediate action required. Continue routine monitoring.",
          forecast: resource?.points?.map((point: any) => ({
            label: point.horizonMinutes === 30 ? "30 min" : point.horizonMinutes === 60 ? "1 hour" : point.horizonMinutes === 120 ? "2 hours" : "4 hours",
            lowMinor: point.projectedLowMinor,
            expectedMinor: point.projectedMidMinor,
            highMinor: point.projectedHighMinor,
          })) || null,
          transactions: transactions.items?.map((txn: any) => ({
            id: txn.id,
            occurredAt: txn.occurredAt,
            type: txn.type,
            provider: txn.provider?.code || "PROVIDER_A",
            amountMinor: txn.amountMinor,
            status: txn.lifecycle,
          })) || [],
        };

        setOutlet(mappedDetail);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to load outlet details", err);
        setError(err.message || "Failed to load outlet details.");
        setLoading(false);
      }
    }

    loadDetail();
  }, [outletId]);

  if (loading) return <PageLoading />;
  if (error || !outlet) return <ErrorState description={error || "Outlet not found"} correlationId="outlet-detail-error" />;

  return <OutletDetailView backHref="/outlets" outlet={outlet} />;
}
