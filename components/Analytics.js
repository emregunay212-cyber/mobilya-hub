"use client";

import Script from "next/script";

export function GoogleAnalytics({ measurementId }) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}

export function FacebookPixel({ pixelId }) {
  if (!pixelId) return null;

  return (
    <Script id="fb-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}

// Event helpers
export function trackEvent(eventName, params = {}) {
  // GA4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
  // Facebook
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
}

export function trackAddToCart(product) {
  trackEvent("add_to_cart", {
    currency: "TRY",
    value: product.price,
    items: [{ item_name: product.name, price: product.price }],
  });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "TRY",
    });
  }
}

export function trackPurchase(order) {
  trackEvent("purchase", {
    transaction_id: order.order_number,
    value: order.total,
    currency: "TRY",
  });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      value: order.total,
      currency: "TRY",
    });
  }
}
