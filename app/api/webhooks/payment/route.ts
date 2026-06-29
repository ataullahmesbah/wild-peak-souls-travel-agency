import { NextRequest, NextResponse } from "next/server";
import { paymentManager } from "@/lib/payment/payment-manager";
import type { PaymentProvider } from "@/lib/payment/payment-provider";

/**
 * Payment Webhook Handler
 *
 * Receives webhooks from payment providers (Stripe, SSLCommerz, etc.)
 * and processes them to update booking/payment status.
 *
 * Stripe: POST /api/webhooks/payment?provider=STRIPE
 * SSLCommerz: POST /api/webhooks/payment?provider=SSLCOMMERZ
 */

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider = (searchParams.get("provider") || "STRIPE") as PaymentProvider;

    const signature = request.headers.get("stripe-signature") ||
                     request.headers.get("x-sslcommerz-signature") ||
                     "";

    const rawBody = await request.text();
    let payload: unknown;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const result = await paymentManager.processWebhook(provider, {
      provider,
      payload,
      signature,
      rawBody,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Invalid webhook result" },
        { status: 400 }
      );
    }

    // Update booking/payment status in database
    const webhookResult = result.data;

    // TODO: Update database based on webhook result
    // - If payment succeeded: update booking status to CONFIRMED, payment status to PAID
    // - If payment failed: update payment status to FAILED
    // - If refunded: update booking status to REFUNDED

    return NextResponse.json({
      received: true,
      event: webhookResult.event,
      bookingRef: webhookResult.bookingRef,
      status: webhookResult.status,
    });
  } catch (error) {
    console.error("[Webhook] Error processing payment webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
