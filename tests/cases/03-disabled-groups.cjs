module.exports = async function ({ page, assert }) {
  await page.evaluate(() => {
    document.body.innerHTML = '<select id="s"><optgroup label="Locked" disabled><option value="a">A</option></optgroup><option value="b">B</option></select>';
    window.api = mangoSelect.init({ selector: "#s" });
    api.open();
  });
  const box = await page.locator('[data-option-value="a"]').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const clicked = await page.evaluate(() => api.get_selected_values());
  const states = await page.evaluate(() => {
    api.destroy();
    document.body.innerHTML = '<select id="m" multiple><optgroup label="Locked" disabled><option value="locked" selected>Locked</option><option value="a">A</option></optgroup><option value="b">B</option></select>';
    window.api = mangoSelect.init({ selector: "#m", ok_cancel_in_multi: true });
    api.disable_option("a");
    api.enable_option("a");
    api.select_all();
    const all = api.get_selected_values();
    api.clear_all();
    const cleared = api.get_selected_values();
    api.set_selected_values(["a"]);
    const replaced = api.get_selected_values();
    api.open();
    const disabled = document.querySelector('.mangoselect-option[data-option-value="a"]').getAttribute("aria-disabled");
    document.querySelector('.mangoselect-option[data-option-value="b"] input').click();
    document.querySelector('.mangoselect-action-ok').click();
    const draft = api.get_selected_values();
    document.querySelector("optgroup").disabled = false;
    api.refresh();
    api.select_value("a");
    const enabled = api.get_selected_values();
    return { all, cleared, replaced, disabled, draft, enabled };
  });
  assert.deepEqual({ clicked, ...states }, {
    clicked: [], all: ["locked", "b"], cleared: ["locked"], replaced: ["locked"], disabled: "true", draft: ["locked", "b"], enabled: ["locked", "a", "b"]
  });
};
