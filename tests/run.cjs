const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");
const http = require("node:http");

async function run() {
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
  const root = path.resolve(__dirname, "..");
  const source_dir = path.join(root, "src", "mangoselect");
  const source = (await Promise.all((await fs.readdir(source_dir)).sort().map(async (name) => {
    return (await fs.readFile(path.join(source_dir, name), "utf8")).replace(/^\uFEFF/, "").trimEnd();
  }))).join("\n\n");
  const target = process.env.TEST_TARGET || "source";
  const script = target === "source" ? source : await fs.readFile(path.join(root, "dist", target), "utf8");
  const css = await fs.readFile(path.join(root, "src", "styles", "mangoselect.css"), "utf8");
  const requests = [];
  const server = http.createServer((request, response) => {
    if (request.url.startsWith("/api")) {
      let body = "";
      request.on("data", (chunk) => { body += chunk; });
      request.on("end", () => {
        requests.push({ url: request.url, method: request.method, headers: request.headers, body });
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ results: [{ id: "remote-a", text: "Remote A" }], totals: 1 }));
      });
      return;
    }
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end("<!doctype html><html><body></body></html>");
  });
  await new Promise((resolve) => { server.listen(0, "127.0.0.1", resolve); });
  let browser;
  let failures = 0;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
    const names = (await fs.readdir(path.join(__dirname, "cases"))).filter((name) => {
      return name.endsWith(".cjs") && (!process.env.TEST_CASE || name.startsWith(process.env.TEST_CASE + "-"));
    }).sort();
    assert.ok(names.length > 0, "No matching test cases");
    for (const name of names) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => { errors.push(error.message); });
      requests.length = 0;
      await page.goto("http://127.0.0.1:" + server.address().port);
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: script });
      try {
        await require(path.join(__dirname, "cases", name))({ page, assert, requests });
        assert.deepEqual(errors, [], "Unexpected browser errors");
        console.log("PASS " + target + " " + name);
      } catch (error) {
        failures += 1;
        console.error("FAIL " + target + " " + name + "\n" + error.stack);
      } finally {
        await page.close();
      }
    }
    console.log(names.length + " case files, " + failures + " failures");
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve) => { server.close(resolve); });
  }
  process.exitCode = failures ? 1 : 0;
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
