(function (window) {
	"use strict";

	if (!window.mangoSelect || typeof window.mangoSelect.register_language !== "function") {
		return;
	}

	window.mangoSelect.register_language("en", {
		placeholder: "Select option",
		no_option: "No option",
		search_placeholder: "Search",
		no_search_result: "No matching result",
		search_length_notice: function (args) {
			return "Type at least " + args.count + " characters";
		},
		add_tag: "+",
		select_all: "Select all",
		clear: "Clear",
		clear_all: "Clear all",
		close: "Close",
		ok: "OK",
		cancel: "Cancel",
		loading: "Loading...",
		error_loading: "Unable to load options",
		selected_count: function (args) {
			return args.count + " selected";
		}
	});
})(window);
