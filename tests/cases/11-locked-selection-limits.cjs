module.exports = async function ({ page, assert }) {
  for (const draft of [false, true]) {
    await page.evaluate((draft) => {
      if (window.api) {
        api.destroy();
      }
      document.body.innerHTML = '<select id="s" multiple><optgroup label="Locked" disabled><option value="locked" selected>Locked</option></optgroup><option value="a" selected>A</option><option value="b">B</option></select>';
      window.api = mangoSelect.init({ selector: "#s", inline: true, ok_cancel_in_multi: draft, clear_all: true, select_all: true, min_selected: 1, max_selected: 2 });
    }, draft);
    const state = () => page.evaluate(() => ({
      clear_disabled: document.querySelector('.mangoselect-action-clear-all').disabled,
      all_disabled: document.querySelector('.mangoselect-action-select-all').disabled
    }));
    assert.deepEqual(await state(), { clear_disabled: false, all_disabled: true }, "Limits must include locked selections");
    await page.locator('.mangoselect-action-clear-all').click();
    assert.deepEqual(await state(), { clear_disabled: true, all_disabled: false });
    if (draft) {
      assert.deepEqual(await page.evaluate(() => api.get_selected_values()), ["locked", "a"]);
      await page.locator('.mangoselect-action-ok').click();
    }
    assert.deepEqual(await page.evaluate(() => api.get_selected_values()), ["locked"]);
    await page.locator('.mangoselect-action-select-all').click();
    assert.deepEqual(await state(), { clear_disabled: false, all_disabled: true });
    if (draft) {
      await page.locator('.mangoselect-action-ok').click();
    }
    assert.deepEqual(await page.evaluate(() => api.get_selected_values()), ["locked", "a"]);
  }
};
