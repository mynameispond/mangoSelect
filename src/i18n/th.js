(function (window) {
	"use strict";

	if (!window.mangoSelect || typeof window.mangoSelect.register_language !== "function") {
		return;
	}

	window.mangoSelect.register_language("th", {
		placeholder: "\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25",
		no_option: "\u0e44\u0e21\u0e48\u0e21\u0e35\u0e15\u0e31\u0e27\u0e40\u0e25\u0e37\u0e2d\u0e01",
		search_placeholder: "\u0e04\u0e49\u0e19\u0e2b\u0e32",
		no_search_result: "\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e17\u0e35\u0e48\u0e04\u0e49\u0e19\u0e2b\u0e32",
		search_length_notice: function (args) {
			return (
				"\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e19\u0e49\u0e2d\u0e22 " +
				args.count +
				" \u0e15\u0e31\u0e27\u0e2d\u0e31\u0e01\u0e29\u0e23"
			);
		},
		add_tag: "+",
		select_all: "\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
		clear: "\u0e25\u0e49\u0e32\u0e07\u0e04\u0e48\u0e32",
		clear_all: "\u0e25\u0e49\u0e32\u0e07\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14",
		close: "\u0e1b\u0e34\u0e14",
		ok: "\u0e15\u0e01\u0e25\u0e07",
		cancel: "\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01",
		loading: "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14...",
		error_loading: "\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e42\u0e2b\u0e25\u0e14\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e44\u0e14\u0e49",
		selected_count: function (args) {
			return (
				"\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e41\u0e25\u0e49\u0e27 " +
				args.count +
				" \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23"
			);
		},
		selected_count_limit: function (args) {
			return (
				"\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e41\u0e25\u0e49\u0e27 " +
				args.count +
				"/" +
				args.max +
				" \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23"
			);
		}
	});
})(window);
