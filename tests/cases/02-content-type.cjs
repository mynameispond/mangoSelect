module.exports = async function ({ page, assert, requests }) {
  for (const header_name of ["Content-Type", "content-type", null]) {
    await page.evaluate(async (header_name) => {
      document.body.innerHTML = '<select id="s"></select>';
      await new Promise((resolve) => {
        window.api = mangoSelect.init({
          selector: "#s",
          ajax: {
            url: "/api",
            method: "POST",
            headers: header_name ? { [header_name]: "application/json" } : {},
            transform_request: header_name ? (params) => JSON.stringify(params) : null
          },
          on_loading_end: resolve
        });
        window.api.open();
      });
      window.api.destroy();
    }, header_name);
    const request = requests[requests.length - 1];
    assert.equal(request.headers["content-type"], header_name ? "application/json" : "application/x-www-form-urlencoded; charset=UTF-8");
    if (header_name) {
      assert.deepEqual(JSON.parse(request.body), { search: "", page_num: 1, per_page: 50 });
    } else {
      assert.equal(new URLSearchParams(request.body).get("page_num"), "1");
    }
  }
};
