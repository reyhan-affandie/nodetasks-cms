import { createServer } from "http";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT, () => {
    if (process.env.NODE_ENV === "development" || "localhost") {
      console.log(`🚀 Next.js CMS running at ${process.env.NEXT_PUBLIC_CMS_ORIGIN} on port ${process.env.PORT} (${dev ? "Development" : "Production"})`);
    }
  });
});
