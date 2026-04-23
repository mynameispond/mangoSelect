	function create_instance_detail(instance, extra_detail) {
		var detail = extra_detail || {};

		return {
			action: detail.action || "",
			selected_values: get_selected_values(instance.select_element),
			selected_texts: get_selected_texts(instance.select_element),
			select_element: instance.select_element,
			instance: instance.api,
			raw_instance: instance,
			is_open: !!(
				instance.wrapper_element &&
				instance.wrapper_element.classList &&
				instance.wrapper_element.classList.contains("is-open")
			),
			is_remote: !!(instance.remote && instance.remote.enabled)
		};
	}

	function create_change_detail(instance, extra_detail) {
		var detail = extra_detail || {};
		var change_detail = create_instance_detail(instance, detail);

		change_detail.action = detail.action || "change";
		change_detail.changed_value = Object.prototype.hasOwnProperty.call(
			detail,
			"changed_value"
		)
			? detail.changed_value
			: null;
		change_detail.changed_values = detail.changed_values
			? detail.changed_values.slice(0)
			: [];
		change_detail.changed_text = Object.prototype.hasOwnProperty.call(
			detail,
			"changed_text"
		)
			? detail.changed_text
			: null;
		change_detail.changed_texts = detail.changed_texts
			? detail.changed_texts.slice(0)
			: [];
		change_detail.is_selected = Object.prototype.hasOwnProperty.call(
			detail,
			"is_selected"
		)
			? detail.is_selected
			: null;
		change_detail.last_changed_value = instance.last_changed_value;
		change_detail.last_changed_values = instance.last_changed_values.slice(0);

		return change_detail;
	}

	function create_open_detail(instance, extra_detail) {
		var detail = create_instance_detail(instance, extra_detail);

		detail.action = "open";
		detail.open_reason =
			extra_detail &&
			Object.prototype.hasOwnProperty.call(extra_detail, "open_reason")
				? extra_detail.open_reason
				: null;
		detail.opened_selected_values = detail.selected_values.slice(0);
		detail.opened_selected_texts = detail.selected_texts.slice(0);

		return detail;
	}

	function create_remote_callback_detail(instance, request_context, extra_detail) {
		var detail = create_instance_detail(instance, extra_detail);
		var context = request_context || {};
		var request_params = {};

		if (context.request_params) {
			request_params = merge_object({}, context.request_params);
		}

		detail.action =
			extra_detail && extra_detail.action ? extra_detail.action : "loading";
		detail.request_params = request_params;
		detail.request_url = context.request_url || "";
		detail.request_method = context.request_method || "";
		detail.page_num = Object.prototype.hasOwnProperty.call(context, "page_num")
			? context.page_num
			: null;
		detail.should_reset = Object.prototype.hasOwnProperty.call(
			context,
			"should_reset"
		)
			? !!context.should_reset
			: null;
		detail.status =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "status")
				? extra_detail.status
				: null;
		detail.success =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "success")
				? !!extra_detail.success
				: null;
		detail.aborted =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "aborted")
				? !!extra_detail.aborted
				: false;
		detail.error_message =
			extra_detail &&
			Object.prototype.hasOwnProperty.call(extra_detail, "error_message")
				? extra_detail.error_message
				: "";
		detail.error_type =
			extra_detail &&
			Object.prototype.hasOwnProperty.call(extra_detail, "error_type")
				? extra_detail.error_type
				: "";
		detail.response =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "response")
				? extra_detail.response
				: null;
		detail.response_text =
			extra_detail &&
			Object.prototype.hasOwnProperty.call(extra_detail, "response_text")
				? extra_detail.response_text
				: "";
		detail.payload =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "payload")
				? extra_detail.payload
				: null;
		detail.results =
			extra_detail && extra_detail.results ? extra_detail.results.slice(0) : [];
		detail.totals =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "totals")
				? extra_detail.totals
				: instance.remote.totals;
		detail.has_more =
			extra_detail && Object.prototype.hasOwnProperty.call(extra_detail, "has_more")
				? !!extra_detail.has_more
				: !!instance.remote.has_more;

		return detail;
	}

	function dispatch_instance_callback(instance, callback_name, detail) {
		if (typeof instance.options[callback_name] !== "function") {
			return;
		}

		instance.options[callback_name](detail);
	}

	function is_instance_active(instance) {
		return !!instance && !instance.destroyed && !instance.destroying;
	}

	function dispatch_open_callback(instance, open_reason) {
		var open_detail = null;

		if (typeof instance.options.on_open !== "function") {
			return;
		}

		open_detail = create_open_detail(instance, {
			open_reason: open_reason
		});
		instance.last_open_detail = open_detail;
		dispatch_instance_callback(instance, "on_open", open_detail);
	}

	function is_same_value_list(left_values, right_values) {
		var left_list = left_values || [];
		var right_list = right_values || [];
		var value_index = 0;

		if (left_list.length !== right_list.length) {
			return false;
		}

		for (value_index = 0; value_index < left_list.length; value_index += 1) {
			if (String(left_list[value_index]) !== String(right_list[value_index])) {
				return false;
			}
		}

		return true;
	}

	function create_close_detail(instance, extra_detail) {
		var detail = create_change_detail(instance, extra_detail);
		var opened_selected_values = instance.opened_selected_values || [];
		var opened_selected_texts = instance.opened_selected_texts || [];

		detail.action = "close";
		detail.close_reason =
			extra_detail &&
			Object.prototype.hasOwnProperty.call(extra_detail, "close_reason")
				? extra_detail.close_reason
				: null;
		detail.opened_selected_values = opened_selected_values.slice(0);
		detail.opened_selected_texts = opened_selected_texts.slice(0);
		detail.has_changed = !is_same_value_list(
			detail.opened_selected_values,
			detail.selected_values
		);
		detail.last_change_detail = instance.last_change_detail;

		return detail;
	}

	function dispatch_close_change(instance, close_reason) {
		var close_detail = null;

		if (
			typeof instance.options.on_close !== "function" &&
			typeof instance.options.on_change_all !== "function"
		) {
			return;
		}

		close_detail = create_close_detail(instance, {
			close_reason: close_reason
		});
		instance.last_close_detail = close_detail;

		if (typeof instance.options.on_close === "function") {
			dispatch_instance_callback(instance, "on_close", close_detail);
		}

		if (typeof instance.options.on_change_all === "function") {
			dispatch_instance_callback(instance, "on_change_all", close_detail);
		}
	}

	function dispatch_loading_start(instance, request_context) {
		var loading_detail = null;

		if (typeof instance.options.on_loading_start !== "function") {
			return;
		}

		loading_detail = create_remote_callback_detail(instance, request_context, {
			action: "loading_start"
		});
		instance.last_loading_start_detail = loading_detail;
		dispatch_instance_callback(instance, "on_loading_start", loading_detail);
	}

	function dispatch_loading_end(instance, request_context, extra_detail) {
		var loading_detail = null;
		var merged_detail = merge_object(
			{
				action: "loading_end"
			},
			extra_detail || {}
		);

		if (typeof instance.options.on_loading_end !== "function") {
			return;
		}

		loading_detail = create_remote_callback_detail(
			instance,
			request_context,
			merged_detail
		);
		instance.last_loading_end_detail = loading_detail;
		dispatch_instance_callback(instance, "on_loading_end", loading_detail);
	}

	function dispatch_error(instance, request_context, extra_detail) {
		var error_detail = null;
		var merged_detail = merge_object(
			{
				action: "error"
			},
			extra_detail || {}
		);

		if (typeof instance.options.on_error !== "function") {
			return;
		}

		error_detail = create_remote_callback_detail(
			instance,
			request_context,
			merged_detail
		);
		instance.last_error_detail = error_detail;
		dispatch_instance_callback(instance, "on_error", error_detail);
	}

	function dispatch_select_change(instance, change_detail) {
		instance.pending_change_detail = create_change_detail(instance, change_detail);
		instance.select_element.dispatchEvent(create_change_event());
	}

