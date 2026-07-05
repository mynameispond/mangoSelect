(function (window, document) {
	"use strict";

	var version = "0.3.3";
	var instance_key = "__mangoselect_instance__";
	var listeners_bound = false;
	var global_click_handler = null;
	var global_keydown_handler = null;
	var global_scroll_handler = null;
	var global_resize_handler = null;
	var active_instance_count = 0;
	var instance_counter = 0;
	var language_registry = {};
	var data_attribute_prefix = "data-mangoselect-";
	var param_attribute_prefix = data_attribute_prefix + "param-";
	var internal_placeholder_attribute =
		data_attribute_prefix + "internal-placeholder";
	var ready_attribute = data_attribute_prefix + "ready";
	var option_html_attribute = data_attribute_prefix + "option-html";
	var group_html_attribute = data_attribute_prefix + "group-html";
	var group_key_attribute = data_attribute_prefix + "group-key";
	var option_image_attribute = data_attribute_prefix + "image";
	var option_icon_attribute = data_attribute_prefix + "icon";
	var request_animation_frame =
		window.requestAnimationFrame ||
		function (callback) {
			return window.setTimeout(callback, 1000 / 60);
		};
	var cancel_animation_frame =
		window.cancelAnimationFrame ||
		function (id) {
			window.clearTimeout(id);
		};
	var default_options = {
		selector: "",
		placeholder: "",
		summary_limit: 2,
		language: "en",
		search: false,
		search_length: null,
		select_all: false,
		clear_all: false,
		close: false,
		close_after_select_all: false,
		close_after_clear_all: false,
		ok_cancel_in_multi: false,
		tags: false,
		allow_html: false,
		min_selected: 0,
		max_selected: null,
		render_option: null,
		render_group: null,
		render_checkbox: null,
		on_open: null,
		on_close: null,
		on_change: null,
		on_change_all: null,
		on_loading_start: null,
		on_loading_end: null,
		on_error: null,
		ajax: null
	};

	function register_language(language_name, messages) {
		if (!language_name) {
			return;
		}

		language_registry[String(language_name).toLowerCase()] = messages || {};
	}

	register_language("en", {
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

	function merge_options(base_options, extra_options) {
		var merged_options = {};
		var option_name = "";

		for (option_name in base_options) {
			if (Object.prototype.hasOwnProperty.call(base_options, option_name)) {
				merged_options[option_name] = base_options[option_name];
			}
		}

		if (!extra_options) {
			extra_options = {};
		}

		for (option_name in extra_options) {
			if (
				Object.prototype.hasOwnProperty.call(extra_options, option_name) &&
				Object.prototype.hasOwnProperty.call(base_options, option_name)
			) {
				merged_options[option_name] = extra_options[option_name];
			}
		}

		if (merged_options.tags) {
			merged_options.search = true;
		}

		return merged_options;
	}

	function normalize_explicit_options(options) {
		var explicit_options = {};
		var option_name = "";

		if (!options) {
			return explicit_options;
		}

		for (option_name in options) {
			if (
				Object.prototype.hasOwnProperty.call(options, option_name) &&
				Object.prototype.hasOwnProperty.call(default_options, option_name)
			) {
				explicit_options[option_name] = options[option_name];
			}
		}

		return explicit_options;
	}

	function merge_explicit_options(base_options, extra_options) {
		var merged_options = normalize_explicit_options(base_options);
		var explicit_options = normalize_explicit_options(extra_options);
		var option_name = "";

		for (option_name in explicit_options) {
			if (Object.prototype.hasOwnProperty.call(explicit_options, option_name)) {
				merged_options[option_name] = explicit_options[option_name];
			}
		}

		return merged_options;
	}

	function get_option_attribute_names(option_name) {
		return [String(option_name || "").toLowerCase()];
	}

	function get_first_attribute_value(attribute_map, attribute_names) {
		var attribute_index = 0;
		var attribute_name = "";

		for (attribute_index = 0; attribute_index < attribute_names.length; attribute_index += 1) {
			attribute_name = attribute_names[attribute_index];

			if (Object.prototype.hasOwnProperty.call(attribute_map, attribute_name)) {
				return attribute_map[attribute_name];
			}
		}

		return undefined;
	}

	function resolve_global_reference(reference_name) {
		var path_parts = String(reference_name || "").split(".");
		var current_value = window;
		var part_index = 0;
		var part_name = "";

		for (part_index = 0; part_index < path_parts.length; part_index += 1) {
			part_name = String(path_parts[part_index] || "").trim();

			if (!part_name || current_value === null || current_value === undefined) {
				return null;
			}

			current_value = current_value[part_name];
		}

		return current_value === undefined ? null : current_value;
	}

	function parse_boolean_option_value(raw_value) {
		var normalized_value = String(raw_value || "")
			.trim()
			.toLowerCase();

		if (normalized_value === "") {
			return true;
		}

		if (
			normalized_value === "true" ||
			normalized_value === "1" ||
			normalized_value === "yes" ||
			normalized_value === "on"
		) {
			return true;
		}

		if (
			normalized_value === "false" ||
			normalized_value === "0" ||
			normalized_value === "no" ||
			normalized_value === "off"
		) {
			return false;
		}

		return true;
	}

	function parse_number_option_value(raw_value, allow_null) {
		var normalized_value = String(raw_value || "").trim();
		var parsed_value = NaN;

		if (normalized_value === "") {
			return undefined;
		}

		if (allow_null && normalized_value.toLowerCase() === "null") {
			return null;
		}

		parsed_value = parseInt(normalized_value, 10);
		return isNaN(parsed_value) ? undefined : parsed_value;
	}

	function parse_json_option_value(raw_value) {
		var normalized_value = String(raw_value || "").trim();

		if (normalized_value === "") {
			return undefined;
		}

		if (
			normalized_value.charAt(0) !== "{" &&
			normalized_value.charAt(0) !== "[" &&
			normalized_value.charAt(0) !== "\""
		) {
			return undefined;
		}

		try {
			return JSON.parse(normalized_value);
		} catch (error) {
			return undefined;
		}
	}

	function parse_callback_option_value(raw_value) {
		var normalized_value = String(raw_value || "").trim();
		var resolved_callback = null;

		if (normalized_value === "" || normalized_value.toLowerCase() === "null") {
			return null;
		}

		resolved_callback = resolve_global_reference(normalized_value);
		return typeof resolved_callback === "function" ? resolved_callback : undefined;
	}

	function parse_attribute_option_value(option_name, raw_value) {
		var normalized_option_name = String(option_name || "").toLowerCase();
		var parsed_value = undefined;
		var normalized_value = String(raw_value || "").trim();

		switch (normalized_option_name) {
			case "search":
			case "select_all":
			case "clear_all":
			case "close":
			case "close_after_select_all":
			case "close_after_clear_all":
			case "ok_cancel_in_multi":
			case "tags":
			case "allow_html":
				return parse_boolean_option_value(raw_value);
			case "summary_limit":
			case "min_selected":
				return parse_number_option_value(raw_value, false);
			case "search_length":
			case "max_selected":
				return parse_number_option_value(raw_value, true);
			case "on_open":
			case "on_close":
			case "on_change":
			case "on_change_all":
			case "on_loading_start":
			case "on_loading_end":
			case "on_error":
			case "render_option":
			case "render_group":
			case "render_checkbox":
				return parse_callback_option_value(raw_value);
			case "ajax":
			case "language":
				parsed_value = parse_json_option_value(raw_value);

				if (parsed_value !== undefined) {
					return parsed_value;
				}

				if (normalized_value.toLowerCase() === "true") {
					return true;
				}

				if (normalized_value.toLowerCase() === "false") {
					return false;
				}

				if (normalized_value.toLowerCase() === "null") {
					return null;
				}

				return normalized_value;
			default:
				return raw_value;
		}
	}

	function get_attribute_options(select_element) {
		var attribute_map = get_prefixed_data_attributes(
			select_element,
			data_attribute_prefix
		);
		var attribute_options = {};
		var option_name = "";
		var raw_value = undefined;
		var parsed_value = undefined;

		for (option_name in default_options) {
			if (!Object.prototype.hasOwnProperty.call(default_options, option_name)) {
				continue;
			}

			raw_value = get_first_attribute_value(
				attribute_map,
				get_option_attribute_names(option_name)
			);

			if (raw_value === undefined) {
				continue;
			}

			parsed_value = parse_attribute_option_value(option_name, raw_value);

			if (parsed_value === undefined) {
				continue;
			}

			attribute_options[option_name] = parsed_value;
		}

		return attribute_options;
	}

	function resolve_instance_options(select_element, options) {
		return merge_options(
			merge_options(default_options, get_attribute_options(select_element)),
			normalize_explicit_options(options)
		);
	}

