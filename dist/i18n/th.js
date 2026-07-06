/*! mangoSelect v1.0.0 | https://github.com/mynameispond/mangoSelect | MIT License */
(() => {
  // src/i18n/th.js
  (function(window2) {
    "use strict";
    if (!window2.mangoSelect || typeof window2.mangoSelect.register_language !== "function") {
      return;
    }
    window2.mangoSelect.register_language("th", {
      placeholder: "เลือกข้อมูล",
      no_option: "ไม่มีตัวเลือก",
      search_placeholder: "ค้นหา",
      no_search_result: "ไม่พบข้อมูลที่ค้นหา",
      search_length_notice: function(args) {
        return "พิมพ์อย่างน้อย " + args.count + " ตัวอักษร";
      },
      add_tag: "+",
      select_all: "เลือกทั้งหมด",
      clear: "ล้างค่า",
      clear_all: "ล้างทั้งหมด",
      close: "ปิด",
      ok: "ตกลง",
      cancel: "ยกเลิก",
      loading: "กำลังโหลด...",
      error_loading: "ไม่สามารถโหลดข้อมูลได้",
      selected_count: function(args) {
        return "เลือกแล้ว " + args.count + " รายการ";
      },
      selected_count_limit: function(args) {
        return "เลือกแล้ว " + args.count + "/" + args.max + " รายการ";
      }
    });
  })(window);
})();
