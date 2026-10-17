module.exports = async function ({ page, assert }) {
  await page.evaluate(() => {
    document.body.innerHTML = '<form><select id="s" multiple><option value="a">A</option><option value="b">B</option></select></form>';
    window.changes = 0;
    window.api = mangoSelect.init({ selector: "#s", inline: true, ok_cancel_in_multi: true, select_all: true, clear_all: true, on_change: () => { changes += 1; } });
  });
  const values = () => page.evaluate(() => api.get_selected_values());
  const choose = (value) => page.locator('.mangoselect-option[data-option-value="' + value + '"] input').click();
  await choose("a");
  assert.deepEqual(await values(), [], "Inline changes must remain a draft until OK");
  await page.locator('.mangoselect-action-cancel').click();
  assert.deepEqual(await values(), []);
  await choose("b");
  await page.locator('.mangoselect-action-ok').click();
  assert.deepEqual(await values(), ["b"]);
  await choose("a");
  assert.deepEqual(await values(), ["b"], "A new draft must start after OK");
  await page.locator('.mangoselect-action-cancel').click();
  assert.deepEqual(await values(), ["b"]);
  await page.locator('.mangoselect-action-select-all').click();
  assert.deepEqual(await values(), ["b"]);
  await page.locator('.mangoselect-action-ok').click();
  assert.deepEqual(await values(), ["a", "b"]);
  await page.locator('.mangoselect-action-clear-all').click();
  await page.locator('.mangoselect-action-cancel').click();
  assert.deepEqual(await values(), ["a", "b"]);
  assert.equal(await page.evaluate(() => changes), 2);
  await page.evaluate(async () => {
    document.querySelector("form").reset();
    await new Promise((resolve) => { setTimeout(resolve, 10); });
  });
  await choose("a");
  assert.deepEqual(await values(), [], "Reset must keep inline drafts active");
  await page.evaluate(() => api.set_selected_values(["b"]));
  await choose("a");
  await page.locator('.mangoselect-action-cancel').click();
  assert.deepEqual(await values(), ["b"], "Cancel must retain an external API update");
  assert.equal(await page.locator('.mangoselect-action-ok').isDisabled(), true);
};
