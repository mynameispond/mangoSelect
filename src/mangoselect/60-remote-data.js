	function normalize_remote_item(item) {
		var normalized_item = null;
		var option_value = "";
		var option_text = "";
		var option_html = null;
		var group_text = "";
		var group_key = "";
		var normalized_children = [];
		var normalized_child = null;
		var child_index = 0;

		if (item === undefined || item === null) {
			return null;
		}

		if (
			typeof item === "string" ||
			typeof item === "number" ||
			typeof item === "boolean"
		) {
			option_value = String(item);
			return {
				id: option_value,
				text: option_value,
				disabled: false,
				selected: false
			};
		}

		if (typeof item !== "object") {
			return null;
		}

		if (is_remote_group_item(item)) {
			if (item.html !== undefined && item.html !== null) {
				option_html = String(item.html);
			}

			group_text =
				item.text !== undefined && item.text !== null
					? String(item.text)
					: item.label !== undefined && item.label !== null
					? String(item.label)
					: item.name !== undefined && item.name !== null
					? String(item.name)
					: html_to_text(option_html);
			group_key =
				item.group_key !== undefined && item.group_key !== null
					? String(item.group_key)
					: item.group_id !== undefined && item.group_id !== null
					? String(item.group_id)
					: group_text || option_html || "";

			for (child_index = 0; child_index < item.children.length; child_index += 1) {
				normalized_child = normalize_remote_item(item.children[child_index]);

				if (!normalized_child || is_remote_group_item(normalized_child)) {
					continue;
				}

				if (item.disabled) {
					normalized_child.disabled = true;
				}

				normalized_children.push(normalized_child);
			}

			if (normalized_children.length === 0) {
				return null;
			}

			return {
				text: group_text,
				html: option_html,
				disabled: !!item.disabled,
				group_key: group_key,
				children: normalized_children
			};
		}

		option_value =
			item.id !== undefined && item.id !== null
				? String(item.id)
				: item.value !== undefined && item.value !== null
				? String(item.value)
				: "";

		if (option_value === "") {
			return null;
		}

		option_text =
			item.text !== undefined && item.text !== null
				? String(item.text)
				: item.label !== undefined && item.label !== null
				? String(item.label)
				: item.name !== undefined && item.name !== null
				? String(item.name)
				: item.html !== undefined && item.html !== null
				? html_to_text(item.html)
				: option_value;

		if (item.html !== undefined && item.html !== null) {
			option_html = String(item.html);
		}

		normalized_item = {
			id: option_value,
			text: option_text,
			html: option_html,
			image: item.image !== undefined && item.image !== null ? String(item.image) : null,
			icon: item.icon !== undefined && item.icon !== null ? String(item.icon) : null,
			disabled: !!item.disabled,
			selected: !!item.selected
		};

		return normalized_item;
	}

	function normalize_remote_payload(instance, payload, params) {
		var ajax_options = get_ajax_options(instance);
		var processed_payload = payload;
		var normalized_results = [];
		var result_list = [];
		var result_index = 0;
		var has_more = false;
		var normalized_item = null;
		var totals = 0;
		var has_totals = false;
		var page_num = 1;
		var per_page = 0;
		var visible_count = 0;
		var visible_results_count = 0;

		if (ajax_options && typeof ajax_options.process_results === "function") {
			processed_payload = ajax_options.process_results(payload, params || {}) || {};
		}

		if (Object.prototype.toString.call(processed_payload) === "[object Array]") {
			result_list = processed_payload;
		} else if (
			processed_payload &&
			Object.prototype.toString.call(processed_payload.results) === "[object Array]"
		) {
			result_list = processed_payload.results;
			has_more = !!(
				processed_payload.pagination && processed_payload.pagination.more
			);
		} else if (
			processed_payload &&
			Object.prototype.toString.call(processed_payload.data) === "[object Array]"
		) {
			result_list = processed_payload.data;
			has_more = !!(
				processed_payload.pagination && processed_payload.pagination.more
			);
		} else {
			result_list = [];
		}

		if (processed_payload && processed_payload.totals !== undefined) {
			totals = parseInt(processed_payload.totals, 10);
			has_totals = !isNaN(totals);
		} else if (processed_payload && processed_payload.total !== undefined) {
			totals = parseInt(processed_payload.total, 10);
			has_totals = !isNaN(totals);
		}

		if (!has_more && processed_payload) {
			if (processed_payload.more !== undefined) {
				has_more = !!processed_payload.more;
			} else if (processed_payload.has_more !== undefined) {
				has_more = !!processed_payload.has_more;
			} else if (processed_payload.next_page !== undefined) {
				has_more = !!processed_payload.next_page;
			} else if (processed_payload.next_page_url !== undefined) {
				has_more = !!processed_payload.next_page_url;
			}
		}

		for (result_index = 0; result_index < result_list.length; result_index += 1) {
			normalized_item = normalize_remote_item(result_list[result_index]);

			if (!normalized_item) {
				continue;
			}

			normalized_results.push(normalized_item);
		}

		visible_results_count = count_remote_results(normalized_results);

		if (has_totals) {
			page_num = parseInt(params && params.page_num, 10);
			per_page = parseInt(
				(params && params.per_page) || get_ajax_per_page(ajax_options),
				10
			);

			if (isNaN(page_num) || page_num < 1) {
				page_num = 1;
			}

			if (isNaN(per_page) || per_page < 1) {
				per_page = get_ajax_per_page(ajax_options);
			}

			visible_count = (page_num - 1) * per_page + visible_results_count;
			has_more = visible_count < totals;
		}

		return {
			results: normalized_results,
			has_more: has_more,
			totals: has_totals ? totals : null
		};
	}

	function merge_remote_results(current_results, incoming_results, should_reset) {
		var merged_results = [];
		var result_lookup = {};
		var result_index = 0;
		var incoming_index = 0;
		var result_key = "";
		var incoming_item = null;
		var existing_item = null;

		if (!should_reset) {
			for (result_index = 0; result_index < current_results.length; result_index += 1) {
				merged_results.push(clone_remote_item(current_results[result_index]));
			}
		}

		for (result_index = 0; result_index < merged_results.length; result_index += 1) {
			result_key = get_remote_result_key(merged_results[result_index]);

			if (result_key === "") {
				continue;
			}

			result_lookup[result_key] = result_index;
		}

		for (incoming_index = 0; incoming_index < incoming_results.length; incoming_index += 1) {
			incoming_item = clone_remote_item(incoming_results[incoming_index]);
			result_key = get_remote_result_key(incoming_item);

			if (
				result_key !== "" &&
				Object.prototype.hasOwnProperty.call(result_lookup, result_key)
			) {
				existing_item = merged_results[result_lookup[result_key]];

				if (is_remote_group_item(existing_item) && is_remote_group_item(incoming_item)) {
					existing_item.text = incoming_item.text;
					existing_item.html = incoming_item.html;
					existing_item.disabled = incoming_item.disabled;
					existing_item.group_key = incoming_item.group_key;
					existing_item.children = merge_remote_results(
						existing_item.children,
						incoming_item.children,
						false
					);
					merged_results[result_lookup[result_key]] = existing_item;
					continue;
				}

				merged_results[result_lookup[result_key]] = incoming_item;
				continue;
			}

			if (result_key !== "") {
				result_lookup[result_key] = merged_results.length;
			}

			merged_results.push(incoming_item);
		}

		return merged_results;
	}

	function clone_remote_item(item) {
		var child_results = [];
		var child_index = 0;

		if (!item) {
			return null;
		}

		if (is_remote_group_item(item)) {
			for (child_index = 0; child_index < item.children.length; child_index += 1) {
				child_results.push(clone_remote_item(item.children[child_index]));
			}

			return {
				text: item.text,
				html: item.html,
				disabled: !!item.disabled,
				group_key: item.group_key || "",
				children: child_results
			};
		}

		return {
			id: item.id,
			text: item.text,
			html: item.html,
			disabled: !!item.disabled,
			selected: !!item.selected
		};
	}

	function get_remote_result_key(item) {
		if (!item) {
			return "";
		}

		if (is_remote_group_item(item)) {
			return item.group_key ? "group:" + String(item.group_key) : "";
		}

		return item.id !== undefined && item.id !== null && String(item.id) !== ""
			? "option:" + String(item.id)
			: "";
	}

	function count_remote_results(result_list) {
		var result_count = 0;
		var result_index = 0;

		if (!result_list || typeof result_list.length !== "number") {
			return 0;
		}

		for (result_index = 0; result_index < result_list.length; result_index += 1) {
			if (is_remote_group_item(result_list[result_index])) {
				result_count += count_remote_results(result_list[result_index].children || []);
				continue;
			}

			result_count += 1;
		}

		return result_count;
	}

	function build_remote_params(instance, page_num) {
		var ajax_options = get_ajax_options(instance);
		var per_page = get_ajax_per_page(ajax_options);
		var attribute_params =
			ajax_options && ajax_options.attribute_params
				? ajax_options.attribute_params
				: {};
		var base_params = {
			search: instance.search_input_element
				? instance.search_input_element.value
				: "",
			page_num: page_num,
			per_page: per_page
		};
		var custom_params = null;
		var key_name = "";

		if (!ajax_options) {
			return base_params;
		}

		for (key_name in attribute_params) {
			if (!Object.prototype.hasOwnProperty.call(attribute_params, key_name)) {
				continue;
			}

			if (key_name === "url") {
				continue;
			}

			base_params[key_name] = attribute_params[key_name];
		}

		if (typeof ajax_options.data === "function") {
			custom_params = ajax_options.data(base_params) || {};
			merge_object(base_params, custom_params);
			return normalize_remote_request_params(base_params, {
				search: instance.search_input_element
					? instance.search_input_element.value
					: "",
				page_num: page_num,
				per_page: per_page
			});
		}

		if (
			ajax_options.data &&
			Object.prototype.toString.call(ajax_options.data) === "[object Object]"
		) {
			for (key_name in ajax_options.data) {
				if (Object.prototype.hasOwnProperty.call(ajax_options.data, key_name)) {
					base_params[key_name] = ajax_options.data[key_name];
				}
			}
		}

		return normalize_remote_request_params(base_params, {
			search: instance.search_input_element
				? instance.search_input_element.value
				: "",
			page_num: page_num,
			per_page: per_page
		});
	}

	function get_remote_url(instance, request_params) {
		var ajax_options = get_ajax_options(instance);
		var resolved_url = "";

		if (!ajax_options) {
			return "";
		}

		if (typeof ajax_options.url === "function") {
			resolved_url = ajax_options.url(request_params || {});
			return resolved_url === undefined || resolved_url === null
				? ""
				: String(resolved_url);
		}

		return String(ajax_options.url || "");
	}

	function update_remote_status(instance) {
		if (!instance.remote.enabled) {
			return;
		}

		if (instance.remote.error_message) {
			reset_remote_loading_status(instance);
			set_status_message(instance, instance.remote.error_message, true);
			return;
		}

		if (instance.remote.loading) {
			schedule_remote_loading_status(instance);

			if (!instance.remote.loading_status_visible) {
				set_status_message(instance, "", false);
				return;
			}

			set_status_message(instance, translate(instance, "loading"), false);
			return;
		}

		reset_remote_loading_status(instance);
		set_status_message(instance, "", false);
	}

	function abort_remote_request(instance) {
		if (!instance || !instance.remote || !instance.remote.xhr) {
			return;
		}

		instance.remote.request_id += 1;

		try {
			instance.remote.xhr.onreadystatechange = null;
		} catch (error) {
			/* noop */
		}

		instance.remote.xhr.abort();
		instance.remote.xhr = null;
		instance.remote.loading = false;
	}

	function load_remote_options(instance, page_num, should_reset) {
		var ajax_options = get_ajax_options(instance);
		var request_id = 0;
		var request_params = null;
		var request_method = "GET";
		var request_headers = {};
		var request_body = "";
		var request_url = "";
		var xhr = null;
		var header_name = "";
		var search_length = 0;
		var request_context = null;
		var error_detail = null;

		if (!instance.remote.enabled || !ajax_options) {
			return;
		}

		request_params = build_remote_params(instance, page_num);
		request_url = get_remote_url(instance, request_params);
		request_method = String(ajax_options.method || "GET").toUpperCase();
		search_length = get_ajax_search_length(ajax_options);
		instance.remote.current_term = String(request_params.search || "");

		if (instance.remote.xhr && instance.remote.loading) {
			abort_remote_request(instance);
		}

		if (
			search_length > 0 &&
			String(request_params.search || "").length < search_length
		) {
			instance.remote.page_num = 0;
			instance.remote.has_more = false;
			instance.remote.totals = 0;
			instance.remote.current_results = [];
			instance.remote.loading = false;
			instance.remote.error_message = "";
			reset_remote_loading_status(instance);
			render_options(instance);
			return;
		}

		if (!request_url) {
			return;
		}

		if (request_method === "GET") {
			request_url = append_query_string(request_url, build_query_string(request_params));
		} else {
			request_body = build_query_string(request_params);
		}

		instance.remote.loading = true;
		instance.remote.error_message = "";
		reset_remote_loading_status(instance);
		request_context = {
			request_params: merge_object({}, request_params),
			request_url: request_url,
			request_method: request_method,
			page_num: page_num,
			should_reset: should_reset
		};

		if (should_reset) {
			instance.remote.page_num = 0;
			instance.remote.has_more = false;
			instance.remote.totals = 0;
			instance.remote.current_results = [];
			render_options(instance);
		} else {
			update_remote_status(instance);
		}

		request_id = instance.remote.request_id + 1;
		instance.remote.request_id = request_id;
		xhr = new XMLHttpRequest();
		instance.remote.xhr = xhr;
		dispatch_loading_start(instance, request_context);

		if (!is_instance_active(instance) || instance.remote.xhr !== xhr) {
			return;
		}

		xhr.open(request_method, request_url, true);
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

		if (request_method !== "GET") {
			xhr.setRequestHeader(
				"Content-Type",
				"application/x-www-form-urlencoded; charset=UTF-8"
			);
		}

		if (
			ajax_options.headers &&
			Object.prototype.toString.call(ajax_options.headers) === "[object Object]"
		) {
			request_headers = ajax_options.headers;

			for (header_name in request_headers) {
				if (Object.prototype.hasOwnProperty.call(request_headers, header_name)) {
					xhr.setRequestHeader(header_name, request_headers[header_name]);
				}
			}
		}

		xhr.onreadystatechange = function () {
			var response_json = null;
			var normalized_payload = null;
			var payload_index = 0;

			if (xhr.readyState !== 4) {
				return;
			}

			if (request_id !== instance.remote.request_id) {
				return;
			}

			instance.remote.loading = false;
			instance.remote.xhr = null;

			if (xhr.status === 0) {
				instance.remote.error_message = translate(instance, "error_loading");
				update_remote_status(instance);
				error_detail = {
					status: 0,
					success: false,
					error_message: instance.remote.error_message,
					error_type: "network",
					response_text: xhr.responseText || ""
				};
				dispatch_error(instance, request_context, error_detail);
				dispatch_loading_end(instance, request_context, error_detail);
				return;
			}

			if (xhr.status < 200 || xhr.status >= 300) {
				instance.remote.error_message = translate(instance, "error_loading");
				update_remote_status(instance);
				error_detail = {
					status: xhr.status,
					success: false,
					error_message: instance.remote.error_message,
					error_type: "http",
					response_text: xhr.responseText || ""
				};
				dispatch_error(instance, request_context, error_detail);
				dispatch_loading_end(instance, request_context, error_detail);
				return;
			}

			try {
				response_json = xhr.responseText ? JSON.parse(xhr.responseText) : {};
			} catch (error) {
				instance.remote.error_message = translate(instance, "error_loading");
				update_remote_status(instance);
				error_detail = {
					status: xhr.status,
					success: false,
					error_message: instance.remote.error_message,
					error_type: "parse",
					response_text: xhr.responseText || ""
				};
				dispatch_error(instance, request_context, error_detail);
				dispatch_loading_end(instance, request_context, error_detail);
				return;
			}

			normalized_payload = normalize_remote_payload(instance, response_json, {
				page_num: page_num,
				search: request_params.search || "",
				per_page: request_params.per_page
			});

			for (
				payload_index = 0;
				payload_index < normalized_payload.results.length;
				payload_index += 1
			) {
				upsert_remote_result_to_select(
					instance.select_element,
					normalized_payload.results[payload_index]
				);
			}

			instance.remote.current_results = merge_remote_results(
				instance.remote.current_results,
				normalized_payload.results,
				should_reset
			);
			instance.remote.page_num = page_num;
			instance.remote.has_more = !!normalized_payload.has_more;
			instance.remote.totals = normalized_payload.totals;
			instance.remote.loaded = true;
			instance.remote.error_message = "";
			render_options(instance);
			dispatch_loading_end(instance, request_context, {
				status: xhr.status,
				success: true,
				response: response_json,
				payload: normalized_payload,
				results: normalized_payload.results,
				totals: normalized_payload.totals,
				has_more: !!normalized_payload.has_more
			});
		};

		xhr.send(request_method === "GET" ? null : request_body);
	}

	function sync_remote_search_threshold_state(instance) {
		var ajax_options = get_ajax_options(instance);
		var search_length = get_ajax_search_length(ajax_options);
		var current_search = instance.search_input_element
			? String(instance.search_input_element.value || "")
			: "";

		if (
			!instance.remote.enabled ||
			!ajax_options ||
			search_length < 1 ||
			current_search.length >= search_length
		) {
			return false;
		}

		if (instance.remote.search_timer) {
			window.clearTimeout(instance.remote.search_timer);
			instance.remote.search_timer = null;
		}

		if (instance.remote.loading) {
			abort_remote_request(instance);
		}

		instance.remote.current_term = current_search;
		instance.remote.page_num = 0;
		instance.remote.has_more = false;
		instance.remote.totals = 0;
		instance.remote.current_results = [];
		instance.remote.loading = false;
		instance.remote.error_message = "";
		reset_remote_loading_status(instance);
		render_options(instance);
		return true;
	}

	function schedule_remote_search(instance) {
		var ajax_options = get_ajax_options(instance);
		var delay_time = 250;

		if (!instance.remote.enabled || !ajax_options) {
			return;
		}

		if (instance.remote.search_timer) {
			window.clearTimeout(instance.remote.search_timer);
		}

		delay_time = get_ajax_delay(ajax_options);

		instance.remote.search_timer = window.setTimeout(function () {
			instance.remote.search_timer = null;
			load_remote_options(instance, 1, true);
		}, delay_time);
	}

	function maybe_load_next_remote_page(instance) {
		var remaining_scroll = 0;

		if (!instance.remote.enabled || !instance.wrapper_element.classList.contains("is-open")) {
			return;
		}

		if (instance.remote.loading || !instance.remote.has_more) {
			return;
		}

		remaining_scroll =
			instance.options_element.scrollHeight -
			instance.options_element.scrollTop -
			instance.options_element.clientHeight;

		if (remaining_scroll > 24) {
			return;
		}

		load_remote_options(instance, instance.remote.page_num + 1, false);
	}

