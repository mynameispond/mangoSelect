	function get_prefixed_data_attributes(select_element, prefix) {
		var attribute_list = select_element.attributes || [];
		var prefixed_attributes = {};
		var attribute_index = 0;
		var attribute_name = "";
		var parameter_name = "";

		for (
			attribute_index = 0;
			attribute_index < attribute_list.length;
			attribute_index += 1
		) {
			attribute_name = String(attribute_list[attribute_index].name || "").toLowerCase();

			if (attribute_name.indexOf(prefix) !== 0 || attribute_name === prefix) {
				continue;
			}

			parameter_name = attribute_name.substring(prefix.length);

			if (!parameter_name) {
				continue;
			}

			prefixed_attributes[parameter_name] = String(
				attribute_list[attribute_index].value || ""
			);
		}

		return prefixed_attributes;
	}

	function get_remote_attribute_params(select_element) {
		return get_prefixed_data_attributes(select_element, param_attribute_prefix);
	}

	function normalize_ajax_options(configured_ajax) {
		var normalized_ajax_options = {};
		var allowed_option_lookup = {
			url: true,
			method: true,
			headers: true,
			data: true,
			process_results: true,
			delay: true,
			per_page: true,
			search_length: true
		};
		var option_name = "";

		if (
			!configured_ajax ||
			Object.prototype.toString.call(configured_ajax) !== "[object Object]"
		) {
			return normalized_ajax_options;
		}

		for (option_name in configured_ajax) {
			if (
				Object.prototype.hasOwnProperty.call(configured_ajax, option_name) &&
				Object.prototype.hasOwnProperty.call(allowed_option_lookup, option_name)
			) {
				normalized_ajax_options[option_name] = configured_ajax[option_name];
			}
		}

		return normalized_ajax_options;
	}

	function normalize_remote_request_params(params, canonical_values) {
		var normalized_params = params || {};

		delete normalized_params.term;
		delete normalized_params.q;
		delete normalized_params.page;
		delete normalized_params["page-num"];
		delete normalized_params.pagenum;
		delete normalized_params.perpage;
		delete normalized_params["per-page"];

		normalized_params.search = canonical_values.search;
		normalized_params.page_num = canonical_values.page_num;
		normalized_params.per_page = canonical_values.per_page;

		return normalized_params;
	}

	function get_ajax_per_page(ajax_options) {
		var per_page = 50;

		if (
			ajax_options &&
			ajax_options.per_page !== undefined &&
			ajax_options.per_page !== null
		) {
			per_page = parseInt(ajax_options.per_page, 10);
		}

		if (isNaN(per_page) || per_page < 1) {
			per_page = 50;
		}

		return per_page;
	}

	function get_ajax_delay(ajax_options) {
		var delay = 250;

		if (ajax_options && ajax_options.delay !== undefined && ajax_options.delay !== null) {
			delay = parseInt(ajax_options.delay, 10);
		}

		if (isNaN(delay) || delay < 0) {
			delay = 250;
		}

		return delay;
	}

	function get_ajax_search_length(ajax_options) {
		var search_length = 0;

		if (
			ajax_options &&
			ajax_options.search_length !== undefined &&
			ajax_options.search_length !== null
		) {
			search_length = parseInt(ajax_options.search_length, 10);
		}

		if (isNaN(search_length) || search_length < 0) {
			search_length = 0;
		}

		return search_length;
	}

	function get_ajax_options(instance) {
		var ajax_options = {};
		var configured_ajax = instance.options.ajax;
		var explicit_ajax =
			instance.base_options &&
			Object.prototype.hasOwnProperty.call(instance.base_options, "ajax");
		var explicit_configured_ajax = explicit_ajax ? instance.base_options.ajax : null;
		var data_mangoselect_attributes = get_prefixed_data_attributes(
			instance.select_element,
			data_attribute_prefix
		);
		var data_url = data_mangoselect_attributes.url;
		var data_per_page = data_mangoselect_attributes.per_page;
		var data_delay = data_mangoselect_attributes.delay;

		if (
			instance.options.search_length !== undefined &&
			instance.options.search_length !== null
		) {
			ajax_options.search_length = instance.options.search_length;
		}

		if (data_url) {
			ajax_options.url = data_url;
		}

		if (data_per_page !== undefined && data_per_page !== null) {
			ajax_options.per_page = data_per_page;
		}

		if (data_delay !== undefined && data_delay !== null) {
			ajax_options.delay = data_delay;
		}

		if (typeof configured_ajax === "string") {
			ajax_options.url = configured_ajax;
		} else if (configured_ajax === true) {
			/* noop */
		} else {
			merge_object(ajax_options, normalize_ajax_options(configured_ajax));
		}

		if (explicit_ajax) {
			if (typeof explicit_configured_ajax === "string") {
				ajax_options.url = explicit_configured_ajax;
			} else if (explicit_configured_ajax === true) {
				/* noop */
			} else {
				merge_object(
					ajax_options,
					normalize_ajax_options(explicit_configured_ajax)
				);
			}
		}

		if (
			instance.base_options &&
			Object.prototype.hasOwnProperty.call(
				instance.base_options,
				"search_length"
			)
		) {
			ajax_options.search_length = instance.base_options.search_length;
		}

		if (!ajax_options.url) {
			return null;
		}

		if (!Object.prototype.hasOwnProperty.call(ajax_options, "per_page")) {
			ajax_options.per_page = 50;
		}

		ajax_options.attribute_params = get_remote_attribute_params(
			instance.select_element
		);

		return ajax_options;
	}

	function is_remote_enabled(instance) {
		var ajax_options = get_ajax_options(instance);
		return !!(ajax_options && ajax_options.url);
	}

	function create_option_element(option_data) {
		var option_element = document.createElement("option");
		option_element.value = option_data.id;
		option_element.text = option_data.text;
		option_element.disabled = !!option_data.disabled;

		if (option_data.html !== null && option_data.html !== undefined) {
			option_element.setAttribute(option_html_attribute, option_data.html);
		}

		if (option_data.image !== null && option_data.image !== undefined) {
			option_element.setAttribute(option_image_attribute, option_data.image);
		}

		if (option_data.icon !== null && option_data.icon !== undefined) {
			option_element.setAttribute(option_icon_attribute, option_data.icon);
		}

		if (option_data.selected) {
			option_element.selected = true;
		}

		return option_element;
	}

	function get_optgroup_by_key(select_element, group_key) {
		var group_elements = to_array(select_element.getElementsByTagName("optgroup"));
		var normalized_group_key =
			group_key !== undefined && group_key !== null ? String(group_key) : "";
		var group_index = 0;

		if (normalized_group_key === "") {
			return null;
		}

		for (group_index = 0; group_index < group_elements.length; group_index += 1) {
			if (
				group_elements[group_index].getAttribute(group_key_attribute) ===
				normalized_group_key
			) {
				return group_elements[group_index];
			}
		}

		return null;
	}

	function upsert_optgroup_from_data(select_element, group_data) {
		var group_element = get_optgroup_by_key(
			select_element,
			group_data.group_key || ""
		);

		if (!group_element) {
			group_element = document.createElement("optgroup");
			select_element.appendChild(group_element);
		}

		group_element.label = group_data.text || "";
		group_element.disabled = !!group_data.disabled;

		if (group_data.group_key) {
			group_element.setAttribute(group_key_attribute, group_data.group_key);
		} else {
			group_element.removeAttribute(group_key_attribute);
		}

		if (group_data.html !== null && group_data.html !== undefined) {
			group_element.setAttribute(group_html_attribute, group_data.html);
		} else {
			group_element.removeAttribute(group_html_attribute);
		}

		return group_element;
	}

	function is_remote_group_item(item) {
		return !!(
			item &&
			Object.prototype.toString.call(item.children) === "[object Array]"
		);
	}

	function upsert_option_from_data(select_element, option_data, parent_element) {
		var option_element = get_option_by_value(select_element, option_data.id);
		var option_parent = parent_element || select_element;

		if (!option_element) {
			option_element = create_option_element(option_data);
			option_parent.appendChild(option_element);
			return option_element;
		}

		if (option_element.parentNode !== option_parent) {
			option_parent.appendChild(option_element);
		}

		option_element.text = option_data.text;
		option_element.disabled = !!option_data.disabled;

		if (option_data.html !== null && option_data.html !== undefined) {
			option_element.setAttribute(option_html_attribute, option_data.html);
		} else {
			option_element.removeAttribute(option_html_attribute);
		}

		if (option_data.image !== null && option_data.image !== undefined) {
			option_element.setAttribute(option_image_attribute, option_data.image);
		} else {
			option_element.removeAttribute(option_image_attribute);
		}

		if (option_data.icon !== null && option_data.icon !== undefined) {
			option_element.setAttribute(option_icon_attribute, option_data.icon);
		} else {
			option_element.removeAttribute(option_icon_attribute);
		}

		if (option_data.selected) {
			option_element.selected = true;
		}

		return option_element;
	}

	function upsert_remote_result_to_select(select_element, result_data) {
		var group_element = null;
		var child_index = 0;
		var child_data = null;

		if (is_remote_group_item(result_data)) {
			group_element = upsert_optgroup_from_data(select_element, result_data);

			for (
				child_index = 0;
				child_index < result_data.children.length;
				child_index += 1
			) {
				child_data = merge_object({}, result_data.children[child_index]);

				if (result_data.disabled) {
					child_data.disabled = true;
				}

				upsert_option_from_data(select_element, child_data, group_element);
			}

			return group_element;
		}

		return upsert_option_from_data(select_element, result_data);
	}

