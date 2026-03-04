const JsonLd = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    name: "Raising the Hope of Rural Children Initiative",
    alternateName: "RHRCI",
    url: "https://heart-of-joy-ng.lovable.app",
    logo: "https://heart-of-joy-ng.lovable.app/favicon.png",
    description:
      "From the Village to the World: Bridging Dreams, Unlocking Potentials. RHRCI supports rural children through education, health, and cultural programs.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mazi Robinson Okoli's Compound, Umudim Village, Ndikelionwu",
      addressLocality: "Orumba North",
      addressRegion: "Anambra State",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "Info.rhrci@gmail.com",
      telephone: "+2347030789393",
      contactType: "customer service",
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default JsonLd;
