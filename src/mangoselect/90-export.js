	function bind_global_listeners() {
		if (listeners_bound) {
			return;
		}

		global_click_handler = function (event) {
			if (find_parent_by_class(event.target, "mangoselect")) {
				return;
			}

			close_all_dropdowns(null, "outside_click");
		};

		global_keydown_handler = function (event) {
			if (event.key === "Escape" || event.keyCode === 27) {
				close_all_dropdowns(null, "escape");
			}
		};

		document.addEventListener("click", global_click_handler);
		document.addEventListener("keydown", global_keydown_handler);
		listeners_bound = true;
	}

	function unbind_global_listeners_if_idle() {
		if (
			!listeners_bound ||
			active_instance_count > 0 ||
			document.querySelectorAll(".mangoselect").length > 0
		) {
			return;
		}

		if (global_click_handler) {
			document.removeEventListener("click", global_click_handler);
			global_click_handler = null;
		}

		if (global_keydown_handler) {
			document.removeEventListener("keydown", global_keydown_handler);
			global_keydown_handler = null;
		}

		listeners_bound = false;
	}

	window.mangoSelect = {
		version: version,
		init: init,
		refresh: refresh,
		get_instance: get_instance,
		register_language: register_language,
		languages: language_registry
	};
})(window, document);
