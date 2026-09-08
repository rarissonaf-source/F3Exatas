import type { MetadataRoute } from "next";
import { INSTITUTIONS } from "@/lib/institutions";
import { getTopicsWithCounts } from "@/lib/data";
import { BASE_PATH } from "@/lib/base-path";

const SITE_URL = "https://www.f3exatas.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}${BASE_PATH}`, priority: 0.9 },
  ];

  for (const institution of INSTITUTIONS) {
    if (institution.comingSoon) continue;

    entries.push({
      url: `${SITE_URL}${BASE_PATH}/${institution.slug}`,
      priority: 0.8,
    });

    for (const discipline of institution.disciplines) {
      entries.push({
        url: `${SITE_URL}${BASE_PATH}/${institution.slug}/${discipline.slug}`,
        priority: 0.7,
      });

      const topics = getTopicsWithCounts(institution.slug, discipline.slug);
      for (const topic of topics) {
        if (topic.count === 0) continue;
        entries.push({
          url: `${SITE_URL}${BASE_PATH}/${institution.slug}/${discipline.slug}/${topic.slug}`,
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}
