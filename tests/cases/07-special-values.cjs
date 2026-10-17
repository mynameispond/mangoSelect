module.exports = async function ({ page, assert }) {
  const result = await page.evaluate(() => {
    document.body.innerHTML = '<select id="s" multiple><option value="a">A</option><option value="toString">To string</option><option value="constructor">Constructor</option><option value="__proto__">Prototype</option></select>';
    window.api = mangoSelect.init({ selector: "#s", inline: true, ok_cancel_in_multi: true, select_all: true, clear_all: true });
    api.set_selected_values(["a"]);
    const only_a = api.get_selected_values();
    api.disable_option("a");
    const disabled = Array.from(document.querySelector("select").options).filter((option) => option.disabled).map((option) => option.value);
    api.enable_option("a");
    api.set_selected_values(["__proto__"]);
    const prototype = api.get_selected_values();
    document.querySelector('.mangoselect-option[data-option-value="constructor"] input').click();
    document.querySelector('.mangoselect-action-ok').click();
    const draft = api.get_selected_values();
    document.querySelector('.mangoselect-action-select-all').click();
    document.querySelector('.mangoselect-action-ok').click();
    const all = api.get_selected_values();
    document.querySelector('.mangoselect-action-clear-all').click();
    document.querySelector('.mangoselect-action-ok').click();
    const cleared = api.get_selected_values();
    return { only_a, disabled, prototype, draft, all, cleared };
  });
  assert.deepEqual(result, { only_a: ["a"], disabled: ["a"], prototype: ["__proto__"], draft: ["constructor", "__proto__"], all: ["a", "toString", "constructor", "__proto__"], cleared: [] });
};
