module.exports = async function ({ page, assert, requests }) {
  await page.evaluate(() => {
    document.body.innerHTML = '<select id="s"></select>';
    window.starts = 0;
    window.ends = 0;
    window.api = mangoSelect.init({ selector: "#s", inline: true, ajax: "/api", on_loading_start: () => { starts += 1; }, on_loading_end: () => { ends += 1; } });
  });
  assert.equal(await page.evaluate(() => starts), 1, "Inline initialization must start its first request");
  await page.waitForFunction(() => ends === 1);
  assert.equal(await page.locator('.mangoselect-option').textContent(), "Remote A");
  await page.evaluate(() => { api.refresh(); api.open(); });
  assert.equal(requests.length, 1);
  await page.evaluate(() => {
    api.destroy();
    document.body.innerHTML = '<select id="s" disabled></select>';
    window.starts = 0;
    window.ends = 0;
    window.api = mangoSelect.init({ selector: "#s", inline: true, ajax: "/api", on_loading_start: () => { starts += 1; }, on_loading_end: () => { ends += 1; } });
  });
  assert.equal(await page.evaluate(() => starts), 0);
  await page.evaluate(() => api.set_disabled(false));
  await page.waitForFunction(() => ends === 1);
  assert.equal(await page.evaluate(() => starts), 1);
  await page.evaluate(() => {
    api.destroy();
    document.body.innerHTML = '<select id="s"></select>';
    window.starts = 0;
    window.ends = 0;
    window.api = mangoSelect.init({ selector: "#s", inline: true, search: true, search_length: 2, ajax: { url: "/api", delay: 0 }, on_loading_start: () => { starts += 1; }, on_loading_end: () => { ends += 1; } });
  });
  assert.equal(await page.evaluate(() => starts), 0);
  await page.locator('.mangoselect-search-input').fill("ab");
  await page.waitForFunction(() => ends === 1);
  assert.equal(new URL(requests[requests.length - 1].url, "http://localhost").searchParams.get("search"), "ab");
};
