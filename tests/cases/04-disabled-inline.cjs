module.exports = async function ({ page, assert }) {
  await page.evaluate(() => {
    document.body.innerHTML = '<select id="s"><option value="a">A</option><option value="b">B</option></select>';
    window.changes = 0;
    window.api = mangoSelect.init({ selector: "#s", inline: true, on_change: () => { changes += 1; } });
    api.set_disabled(true);
  });
  const box = await page.locator('[data-option-value="a"]').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.locator('[role="listbox"]').focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  assert.deepEqual(await page.evaluate(() => ({ values: api.get_selected_values(), changes })), { values: [], changes: 0 });
  await page.evaluate(() => { api.set_disabled(false); });
  await page.locator('[data-option-value="b"]').click();
  assert.deepEqual(await page.evaluate(() => api.get_selected_values()), ["b"]);
};
