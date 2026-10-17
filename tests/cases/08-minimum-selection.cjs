module.exports = async function ({ page, assert }) {
  const result = await page.evaluate(() => {
    function setup(html, options) {
      if (window.api) {
        api.destroy();
      }
      document.body.innerHTML = html;
      window.api = mangoSelect.init({ selector: "#s", ...options });
    }
    setup('<select id="s" multiple><option value="a" selected>A</option><option value="b" selected>B</option><option value="c">C</option></select>', { min_selected: 1 });
    api.set_selected_values([]);
    const cleared = api.get_selected_values();
    api.set_selected_values(["missing"]);
    const unknown = api.get_selected_values();
    setup('<select id="s" multiple><option value="a" selected>A</option><option value="b">B</option></select>', { min_selected: 1, max_selected: 1 });
    api.set_selected_values(["b"]);
    const swapped = api.get_selected_values();
    api.set_selected_values([]);
    const retained = api.get_selected_values();
    setup('<select id="s" multiple><option value="locked" selected disabled>Locked</option><option value="a" selected>A</option><option value="b">B</option></select>', { min_selected: 2, max_selected: 2 });
    api.set_selected_values(["b"]);
    const disabled = api.get_selected_values();
    api.set_selected_values([]);
    const disabled_clear = api.get_selected_values();
    setup('<select id="s" multiple><option value="a" selected>A</option><option value="b">B</option></select>', { min_selected: 0 });
    api.set_selected_values([]);
    const no_min = api.get_selected_values();
    return { cleared, unknown, swapped, retained, disabled, disabled_clear, no_min };
  });
  assert.deepEqual(result, { cleared: ["a"], unknown: ["a"], swapped: ["b"], retained: ["b"], disabled: ["locked", "b"], disabled_clear: ["locked", "b"], no_min: [] });
};
