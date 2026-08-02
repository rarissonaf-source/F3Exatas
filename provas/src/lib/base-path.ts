// Must match `basePath` in next.config.ts. Next.js auto-prefixes next/link, next/image
// and route handlers with basePath, but hand-written absolute paths (raw <img src>,
// raw <a href>) don't get that treatment — prefix them manually with this constant.
export const BASE_PATH = "/provas";
