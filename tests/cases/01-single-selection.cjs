module.exports = async function ({ page, assert }) {
  const result = await page.evaluate(async () => {
    document.body.innerHTML = '<form><select id="s"><option value="a">A</option><option value="b">B</option></select></form>';
    let api = mangoSelect.init({ selector: "#s" });
    const select = document.querySelector("select");
    const initial = api.get_selected_values();
    api.select_value("b");
    api = mangoSelect.init({ selector: "#s" });
    const reinit = api.get_selected_values();
    api = mangoSelect.init({ selector: "#s", search: true });
    const rebuild = api.get_selected_values();
    api.clear_all();
    api = mangoSelect.init({ selector: "#s", search: false });
    const empty_rebuild = api.get_selected_values();
    select.value = "b";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    const native_change = api.get_selected_values();
    document.querySelector("form").reset();
    await new Promise((resolve) => { setTimeout(resolve, 10); });
    const reset = api.get_selected_values();
    api.destroy();
    return { initial, reinit, rebuild, empty_rebuild, native_change, reset };
  });
  assert.deepEqual(result, { initial: [], reinit: ["b"], rebuild: ["b"], empty_rebuild: [], native_change: ["b"], reset: [] });
};
