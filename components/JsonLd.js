export function LocalBusinessJsonLd({ store }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const hours = store.working_hours || {};

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: store.name,
    url: `${baseUrl}/${store.slug}`,
    telephone: store.phone || undefined,
    email: store.email || undefined,
    address: store.address
      ? {
          "@type": "PostalAddress",
          streetAddress: store.address,
          addressLocality: store.city || undefined,
          addressCountry: "TR",
        }
      : undefined,
    image: store.logo_url || undefined,
    openingHours: hours.weekdays
      ? [`Mo-Fr ${hours.weekdays}`, hours.saturday ? `Sa ${hours.saturday}` : null, hours.sunday ? `Su ${hours.sunday}` : null].filter(Boolean)
      : undefined,
  };

  // Remove undefined values
  const clean = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}

export function ProductJsonLd({ product, store }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images?.[0] || undefined,
    url: `${baseUrl}/${store.slug}/urun/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: store.name,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "TRY",
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: store.name,
      },
    },
  };

  const clean = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url || undefined,
    })),
  };

  const clean = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}
