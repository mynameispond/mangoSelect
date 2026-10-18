module.exports = async function ({ page, assert }) {
  await page.evaluate(() => {
    document.body.innerHTML = '<select id="s" multiple><option value="a">A</option><option value="b">B</option></select>';
    window.api = mangoSelect.init({ selector: "#s", max_selected: 2, inline: true, ok_cancel_in_multi: true });
  });
  assert.equal(await page.locator('.mangoselect-progress-bar-fill').count(), 1);
  const percent = () => page.locator('.mangoselect-progress-bar-fill').evaluate((node) => node.style.width);
  assert.equal(await percent(), "0%");
  await page.locator('[data-option-value="a"] input').click();
  assert.equal(await percent(), "50%");
  assert.deepEqual(await page.evaluate(() => api.get_selected_values()), []);
  await page.locator('.mangoselect-action-cancel').click();
  assert.equal(await percent(), "0%");
  await page.evaluate(() => api.select_all());
  assert.equal(await percent(), "100%");
  assert.equal(await page.locator('.mangoselect-progress-bar-fill').evaluate((node) => node.classList.contains("is-full")), true);
  await page.evaluate(() => { window.api = mangoSelect.init({ selector: "#s", max_selected: null }); });
  assert.equal(await page.locator('.mangoselect-progress-bar').count(), 0);
  await page.evaluate(() => { window.api = mangoSelect.init({ selector: "#s", max_selected: 4 }); });
  assert.equal(await percent(), "50%");
  const single = await page.evaluate(() => {
    api.destroy();
    document.body.innerHTML = '<select id="s"><option value="a">A</option></select>';
    mangoSelect.init({ selector: "#s", max_selected: 2 });
    return document.querySelectorAll('.mangoselect-progress-bar').length;
  });
  assert.equal(single, 0);
};
