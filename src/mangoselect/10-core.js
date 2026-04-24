	function create_change_event() {
		if (typeof Event === "function") {
			return new Event("change", { bubbles: true });
		}

		var change_event = document.createEvent("Event");
		change_event.initEvent("change", true, true);
		return change_event;
	}

	function to_array(target) {
		return Array.prototype.slice.call(target || []);
	}

	function get_target_elements(target) {
		if (!target) {
			return [];
		}

		if (typeof target === "string") {
			return to_array(document.querySelectorAll(target));
		}

		if (target.tagName) {
			return [target];
		}

		if (typeof target.length === "number") {
			return to_array(target);
		}

		return [];
	}

	function normalize_value_list(values) {
		var normalized_values = [];
		var value_index = 0;

		if (values === undefined || values === null) {
			return normalized_values;
		}

		if (Object.prototype.toString.call(values) !== "[object Array]") {
			return [String(values)];
		}

		for (value_index = 0; value_index < values.length; value_index += 1) {
			if (values[value_index] === undefined || values[value_index] === null) {
				continue;
			}

			normalized_values.push(String(values[value_index]));
		}

		return normalized_values;
	}

	function normalize_search_text(value) {
		if (value === undefined || value === null) {
			return "";
		}

		return String(value).toLowerCase();
	}

	function html_to_text(value) {
		if (value === undefined || value === null || value === "") {
			return "";
		}

		return String(value)
			.replace(/<[^>]*>/g, " ")
			.replace(/&nbsp;/gi, " ")
			.replace(/&amp;/gi, "&")
			.replace(/&lt;/gi, "<")
			.replace(/&gt;/gi, ">")
			.replace(/&quot;/gi, "\"")
			.replace(/&#39;/gi, "'")
			.replace(/\s+/g, " ")
			.trim();
	}

	function find_parent_by_class(element, class_token) {
		var current_element = element;

		while (current_element && current_element !== document.body) {
			if (
				current_element.classList &&
				current_element.classList.contains(class_token)
			) {
				return current_element;
			}

			current_element = current_element.parentNode;
		}

		return null;
	}

	function find_parent_instance(element) {
		var current_element = element;

		while (current_element && current_element !== document) {
			if (current_element[instance_key]) {
				return current_element[instance_key];
			}

			current_element = current_element.parentNode;
		}

		return null;
	}

	function get_language_name(select_element, options) {
		var language_name = "";

		if (
			options &&
			typeof options.language === "string" &&
			options.language
		) {
			language_name = options.language;
		}

		if (!language_name) {
			language_name = "en";
		}

		return String(language_name).toLowerCase();
	}

	function get_translation_pack(instance) {
		var default_pack = language_registry.en || {};
		var language_name = get_language_name(
			instance.select_element,
			instance.options
		);
		var custom_language = null;
		var language_pack = language_registry[language_name] || {};
		var merged_pack = {};
		var key_name = "";

		for (key_name in default_pack) {
			if (Object.prototype.hasOwnProperty.call(default_pack, key_name)) {
				merged_pack[key_name] = default_pack[key_name];
			}
		}

		for (key_name in language_pack) {
			if (Object.prototype.hasOwnProperty.call(language_pack, key_name)) {
				merged_pack[key_name] = language_pack[key_name];
			}
		}

		if (
			instance.options.language &&
			typeof instance.options.language === "object" &&
			!instance.options.language.tagName
		) {
			custom_language = instance.options.language;

			for (key_name in custom_language) {
				if (Object.prototype.hasOwnProperty.call(custom_language, key_name)) {
					merged_pack[key_name] = custom_language[key_name];
				}
			}
		}

		return merged_pack;
	}

	function translate(instance, key_name, args) {
		var translation_pack = get_translation_pack(instance);
		var message = translation_pack[key_name];

		if (typeof message === "function") {
			return message(args || {});
		}

		return message || "";
	}

	function get_placeholder(instance) {
		if (instance.options.placeholder !== "") {
			return instance.options.placeholder;
		}

		return translate(instance, "placeholder");
	}

	function get_all_options(select_element) {
		return to_array(select_element.options);
	}

	function is_placeholder_option(option_element) {
		return !!(
			option_element &&
			option_element.getAttribute &&
			option_element.getAttribute(internal_placeholder_attribute) === "1"
		);
	}

	function has_default_selected_option(select_element) {
		var option_list = get_all_options(select_element);
		var option_index = 0;

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				!is_placeholder_option(option_list[option_index]) &&
				option_list[option_index].defaultSelected
			) {
				return true;
			}
		}

		return false;
	}

	function get_selected_options(select_element) {
		var option_list = get_all_options(select_element);
		var selected_options = [];
		var option_index = 0;

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				option_list[option_index].selected &&
				!is_placeholder_option(option_list[option_index])
			) {
				selected_options.push(option_list[option_index]);
			}
		}

		return selected_options;
	}

	function get_selected_values(select_element) {
		var selected_options = get_selected_options(select_element);
		var values = [];
		var option_index = 0;

		for (
			option_index = 0;
			option_index < selected_options.length;
			option_index += 1
		) {
			values.push(selected_options[option_index].value);
		}

		return values;
	}

	function get_selected_texts(select_element) {
		var selected_options = get_selected_options(select_element);
		var texts = [];
		var option_index = 0;

		for (
			option_index = 0;
			option_index < selected_options.length;
			option_index += 1
		) {
			texts.push(selected_options[option_index].text);
		}

		return texts;
	}

	function get_selectable_options(select_element) {
		var option_list = get_all_options(select_element);
		var selectable_options = [];
		var option_index = 0;

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				!option_list[option_index].disabled &&
				!is_placeholder_option(option_list[option_index])
			) {
				selectable_options.push(option_list[option_index]);
			}
		}

		return selectable_options;
	}

	function get_selectable_selected_count(select_element) {
		var selectable_options = get_selectable_options(select_element);
		var selected_count = 0;
		var option_index = 0;

		for (
			option_index = 0;
			option_index < selectable_options.length;
			option_index += 1
		) {
			if (selectable_options[option_index].selected) {
				selected_count += 1;
			}
		}

		return selected_count;
	}

	function get_selected_count(instance) {
		return get_selected_options(instance.select_element).length;
	}

	function is_ok_cancel_mode(instance) {
		return !!(
			instance &&
			instance.is_multiple &&
			instance.options &&
			instance.options.ok_cancel_in_multi
		);
	}

	function is_draft_selection_active(instance) {
		return !!(
			is_ok_cancel_mode(instance) &&
			instance.draft_selection &&
			instance.draft_selection.active
		);
	}

	function get_draft_selected_values(instance) {
		if (!instance || !instance.draft_selection) {
			return [];
		}

		return normalize_value_list(instance.draft_selection.values);
	}

	function build_selected_values_from_lookup(instance, selected_lookup) {
		var option_list = get_all_options(instance.select_element);
		var values = [];
		var option_index = 0;
		var option_value = "";

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				option_list[option_index].disabled ||
				is_placeholder_option(option_list[option_index])
			) {
				continue;
			}

			option_value = String(option_list[option_index].value);

			if (!selected_lookup[option_value]) {
				continue;
			}

			values.push(option_value);
		}

		return values;
	}

	function get_working_selected_values(instance) {
		if (is_draft_selection_active(instance)) {
			return get_draft_selected_values(instance);
		}

		return get_selected_values(instance.select_element);
	}

	function get_working_selected_texts(instance) {
		var option_list = get_all_options(instance.select_element);
		var selected_lookup = {};
		var selected_values = get_working_selected_values(instance);
		var texts = [];
		var value_index = 0;
		var option_index = 0;
		var option_value = "";

		for (value_index = 0; value_index < selected_values.length; value_index += 1) {
			selected_lookup[String(selected_values[value_index])] = true;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (is_placeholder_option(option_list[option_index])) {
				continue;
			}

			option_value = String(option_list[option_index].value);

			if (!selected_lookup[option_value]) {
				continue;
			}

			texts.push(option_list[option_index].text);
		}

		return texts;
	}

	function get_working_selected_count(instance) {
		return get_working_selected_values(instance).length;
	}

	function get_working_selectable_selected_count(instance) {
		var selectable_options = get_selectable_options(instance.select_element);
		var selected_lookup = {};
		var selected_values = get_working_selected_values(instance);
		var selected_count = 0;
		var value_index = 0;
		var option_index = 0;

		for (value_index = 0; value_index < selected_values.length; value_index += 1) {
			selected_lookup[String(selected_values[value_index])] = true;
		}

		for (
			option_index = 0;
			option_index < selectable_options.length;
			option_index += 1
		) {
			if (!selected_lookup[String(selectable_options[option_index].value)]) {
				continue;
			}

			selected_count += 1;
		}

		return selected_count;
	}

	function is_working_option_selected(instance, option_element) {
		var selected_lookup = {};
		var selected_values = [];
		var value_index = 0;

		if (!is_draft_selection_active(instance)) {
			return !!option_element.selected;
		}

		selected_values = get_draft_selected_values(instance);

		for (value_index = 0; value_index < selected_values.length; value_index += 1) {
			selected_lookup[String(selected_values[value_index])] = true;
		}

		return !!selected_lookup[String(option_element.value)];
	}

	function start_draft_selection(instance) {
		if (!is_ok_cancel_mode(instance)) {
			return;
		}

		instance.draft_selection.active = true;
		instance.draft_selection.values = get_selected_values(instance.select_element);
	}

	function reset_draft_selection(instance) {
		if (!instance || !instance.draft_selection) {
			return;
		}

		instance.draft_selection.active = false;
		instance.draft_selection.values = get_selected_values(instance.select_element);
	}

	function sync_draft_selection_with_select(instance) {
		if (!instance || !instance.draft_selection) {
			return;
		}

		instance.draft_selection.values = get_selected_values(instance.select_element);
	}

	function has_draft_selection_changes(instance) {
		if (!is_ok_cancel_mode(instance) || !instance.draft_selection) {
			return false;
		}

		return !is_same_value_list(
			instance.opened_selected_values || [],
			get_draft_selected_values(instance)
		);
	}

	function get_option_by_value(select_element, value) {
		var option_list = get_all_options(select_element);
		var option_index = 0;
		var normalized_value = String(value);

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (String(option_list[option_index].value) === normalized_value) {
				return option_list[option_index];
			}
		}

		return null;
	}

	function merge_object(target_object, source_object) {
		var key_name = "";

		if (!source_object) {
			return target_object;
		}

		for (key_name in source_object) {
			if (Object.prototype.hasOwnProperty.call(source_object, key_name)) {
				target_object[key_name] = source_object[key_name];
			}
		}

		return target_object;
	}

	function get_select_data_attribute(select_element, attribute_name) {
		var attribute_value = select_element.getAttribute(attribute_name);

		if (attribute_value === null || attribute_value === "") {
			return null;
		}

		return attribute_value;
	}

	function get_mangoselect_data_attribute(select_element, key_name) {
		return get_select_data_attribute(
			select_element,
			data_attribute_prefix + key_name
		);
	}

	function get_min_selected(instance) {
		var min_selected = instance.options.min_selected;

		min_selected = parseInt(min_selected, 10);

		if (isNaN(min_selected) || min_selected < 0 || !instance.is_multiple) {
			return 0;
		}

		return min_selected;
	}

	function get_max_selected(instance) {
		var max_selected = instance.options.max_selected;

		max_selected = parseInt(max_selected, 10);

		if (isNaN(max_selected) || max_selected < 1 || !instance.is_multiple) {
			return null;
		}

		if (max_selected < get_min_selected(instance)) {
			return get_min_selected(instance);
		}

		return max_selected;
	}

	function ensure_single_placeholder_option(instance) {
		var option_list = get_all_options(instance.select_element);
		var option_index = 0;
		var placeholder_option = null;
		var has_real_selected = false;

		if (instance.is_multiple) {
			for (option_index = option_list.length - 1; option_index >= 0; option_index -= 1) {
				if (!is_placeholder_option(option_list[option_index])) {
					continue;
				}

				instance.select_element.removeChild(option_list[option_index]);
			}

			return;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (is_placeholder_option(option_list[option_index])) {
				placeholder_option = option_list[option_index];
				continue;
			}

			if (option_list[option_index].selected) {
				has_real_selected = true;
			}
		}

		if (!placeholder_option) {
			placeholder_option = document.createElement("option");
			placeholder_option.value = "";
			placeholder_option.text = get_placeholder(instance);
			placeholder_option.setAttribute(internal_placeholder_attribute, "1");
			placeholder_option.hidden = true;
			instance.select_element.insertBefore(
				placeholder_option,
				instance.select_element.firstChild
			);
		}

		placeholder_option.text = get_placeholder(instance);

		if (!instance.single_selection_committed) {
			for (option_index = 0; option_index < option_list.length; option_index += 1) {
				if (is_placeholder_option(option_list[option_index])) {
					continue;
				}

				option_list[option_index].selected = false;
			}

			has_real_selected = false;
		}

		placeholder_option.selected = !has_real_selected;
	}

	function remove_internal_placeholder_options(select_element) {
		var option_list = get_all_options(select_element);
		var option_index = 0;

		for (option_index = option_list.length - 1; option_index >= 0; option_index -= 1) {
			if (!is_placeholder_option(option_list[option_index])) {
				continue;
			}

			select_element.removeChild(option_list[option_index]);
		}
	}

