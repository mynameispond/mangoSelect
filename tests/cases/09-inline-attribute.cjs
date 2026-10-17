module.exports = async function ({ page, assert }) {
  const actual = await page.evaluate(() => {
    return ["false", "0", "off", "true", "1", ""].map((value) => {
      document.body.innerHTML = '<select id="s"><option value="a">A</option></select>';
      document.querySelector("select").setAttribute("data-mangoselect-inline", value);
      const api = mangoSelect.init({ selector: "#s" });
      const inline = document.querySelector('.mangoselect').classList.contains("mangoselect-inline");
      api.destroy();
      return inline;
    });
  });
  assert.deepEqual(actual, [false, false, false, true, true, true]);
  const override = await page.evaluate(() => {
    document.body.innerHTML = '<select id="s" data-mangoselect-inline="true"><option value="a">A</option></select>';
    mangoSelect.init({ selector: "#s", inline: false });
    return document.querySelector('.mangoselect').classList.contains("mangoselect-inline");
  });
  assert.equal(override, false);
};
