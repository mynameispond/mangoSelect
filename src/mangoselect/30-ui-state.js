	function build_query_string(data) {
		var part_list = [];
		var key_name = "";
		var value = null;
		var value_index = 0;

		if (!data) {
			return "";
		}

		for (key_name in data) {
			if (!Object.prototype.hasOwnProperty.call(data, key_name)) {
				continue;
			}

			value = data[key_name];

			if (value === undefined || value === null) {
				continue;
			}

			if (Object.prototype.toString.call(value) === "[object Array]") {
				for (value_index = 0; value_index < value.length; value_index += 1) {
					part_list.push(
						encodeURIComponent(key_name) +
							"=" +
							encodeURIComponent(String(value[value_index]))
					);
				}
				continue;
			}

			part_list.push(
				encodeURIComponent(key_name) +
					"=" +
					encodeURIComponent(String(value))
			);
		}

		return part_list.join("&");
	}

	function append_query_string(url, query_string) {
		if (!query_string) {
			return url;
		}

		return url + (url.indexOf("?") === -1 ? "?" : "&") + query_string;
	}

	function get_summary_text(instance) {
		var selected_texts = get_working_selected_texts(instance);
		var selected_count = selected_texts.length;

		if (selected_count === 0) {
			return get_placeholder(instance);
		}

		if (!instance.is_multiple) {
			return selected_texts[0];
		}

		if (selected_count <= instance.options.summary_limit) {
			return selected_texts.join(", ");
		}

		return translate(instance, "selected_count", {
			count: selected_count
		});
	}

	function update_summary(instance) {
		var selected_options = get_selected_options(instance.select_element);
		var option_element = selected_options.length === 1 ? selected_options[0] : null;
		var image_url = "";
		var icon_class = "";
		var image_element = null;
		var icon_element = null;
		var text_span = null;

		if (!instance.is_multiple && option_element) {
			image_url = option_element.getAttribute(option_image_attribute);
			icon_class = option_element.getAttribute(option_icon_attribute);

			if (
				(image_url !== null && image_url !== undefined && image_url !== "") ||
				(icon_class !== null && icon_class !== undefined && icon_class !== "")
			) {
				instance.label_element.textContent = "";

				if (image_url) {
					image_element = document.createElement("img");
					image_element.src = image_url;
					image_element.className = "mangoselect-selected-image";
					instance.label_element.appendChild(image_element);
				} else if (icon_class) {
					icon_element = document.createElement("i");
					icon_element.className = icon_class + " mangoselect-selected-icon";
					instance.label_element.appendChild(icon_element);
				}

				text_span = document.createElement("span");
				text_span.className = "mangoselect-selected-label";
				text_span.textContent = option_element.text || "";
				instance.label_element.appendChild(text_span);
				return;
			}
		}

		instance.label_element.textContent = get_summary_text(instance);
	}

	function set_status_message(instance, message, is_error) {
		if (!instance.search_empty_element) {
			return;
		}

		if (!message) {
			instance.search_empty_element.textContent = "";
			instance.search_empty_element.style.display = "none";
			instance.search_empty_element.classList.remove("is-error");
			schedule_dropdown_position_update(instance);
			return;
		}

		instance.search_empty_element.textContent = message;
		instance.search_empty_element.style.display = "block";

		if (is_error) {
			instance.search_empty_element.classList.add("is-error");
			schedule_dropdown_position_update(instance);
			return;
		}

		instance.search_empty_element.classList.remove("is-error");
		schedule_dropdown_position_update(instance);
	}

	function clear_remote_loading_timer(instance) {
		if (!instance || !instance.remote || !instance.remote.loading_status_timer) {
			return;
		}

		window.clearTimeout(instance.remote.loading_status_timer);
		instance.remote.loading_status_timer = null;
	}

	function reset_remote_loading_status(instance) {
		clear_remote_loading_timer(instance);

		if (!instance || !instance.remote) {
			return;
		}

		instance.remote.loading_status_visible = false;
	}

	function schedule_remote_loading_status(instance) {
		if (
			!instance ||
			!instance.remote ||
			!instance.remote.loading ||
			instance.remote.loading_status_visible ||
			instance.remote.loading_status_timer
		) {
			return;
		}

		instance.remote.loading_status_timer = window.setTimeout(function () {
			instance.remote.loading_status_timer = null;

			if (
				!instance.remote.enabled ||
				!instance.remote.loading ||
				instance.remote.error_message
			) {
				return;
			}

			instance.remote.loading_status_visible = true;
			set_status_message(instance, translate(instance, "loading"), false);
		}, 1000);
	}

	function clear_search(instance) {
		if (!instance.search_input_element) {
			return;
		}

		if (instance.search_input_element.value === "") {
			if (!instance.remote.enabled) {
				apply_search_filter(instance);
			}
			return;
		}

		instance.search_input_element.value = "";
		update_tag_action_state(instance);

		if (!instance.remote.enabled) {
			apply_search_filter(instance);
		}
	}

	function get_tag_value(instance) {
		if (!instance || !instance.search_input_element) {
			return "";
		}

		return String(instance.search_input_element.value || "").replace(/^\s+|\s+$/g, "");
	}

	function update_tag_action_state(instance) {
		var tag_value = "";
		var is_disabled = false;
		var option_element = null;
		var is_option_selected = false;
		var can_add = true;

		if (!instance || !instance.tag_button) {
			return;
		}

		tag_value = get_tag_value(instance);
		option_element = get_option_by_value(instance.select_element, tag_value);
		is_option_selected = option_element ? is_working_option_selected(instance, option_element) : false;
		can_add = !instance.is_multiple || can_add_more_selection(instance);

		is_disabled =
			!!instance.select_element.disabled ||
			tag_value === "" ||
			(!is_option_selected && !can_add);

		instance.tag_button.disabled = is_disabled;
		instance.tag_button.style.display = tag_value === "" ? "none" : "";
	}

	function is_dropdown_open(instance) {
		return !!(
			instance &&
			instance.wrapper_element &&
			instance.wrapper_element.classList &&
			instance.wrapper_element.classList.contains("is-open")
		);
	}

	function update_dropdown_position(instance) {
		var trigger_rect = null;
		var viewport_width = 0;
		var viewport_height = 0;
		var viewport_padding = 8;
		var dropdown_gap = 4;
		var next_left = 0;
		var next_top = 0;
		var dropdown_height = 0;
		var available_below = 0;
		var available_above = 0;
		var trigger_width = 0;

		if (
			!is_instance_active(instance) ||
			!instance.dropdown_element ||
			!instance.trigger_element ||
			!is_dropdown_open(instance)
		) {
			return;
		}

		trigger_rect = instance.trigger_element.getBoundingClientRect();
		trigger_width = Math.round(trigger_rect.width || 0);

		if (trigger_width <= 0) {
			return;
		}

		viewport_width =
			window.innerWidth ||
			document.documentElement.clientWidth ||
			document.body.clientWidth ||
			0;
		viewport_height =
			window.innerHeight ||
			document.documentElement.clientHeight ||
			document.body.clientHeight ||
			0;

		instance.dropdown_element.style.width = trigger_width + "px";
		instance.dropdown_element.style.minWidth = trigger_width + "px";

		next_left = trigger_rect.left;

		if (viewport_width > 0) {
			if (next_left + trigger_width > viewport_width - viewport_padding) {
				next_left = viewport_width - viewport_padding - trigger_width;
			}

			if (next_left < viewport_padding) {
				next_left = viewport_padding;
			}
		}

		var search_height = instance.search_element ? Math.round(instance.search_element.offsetHeight || 0) : 0;
		var actions_height = instance.actions_element ? Math.round(instance.actions_element.offsetHeight || 0) : 0;
		var chrome_height = search_height + actions_height;

		dropdown_height = Math.round(instance.dropdown_element.offsetHeight || 0);
		available_below =
			viewport_height - trigger_rect.bottom - dropdown_gap - viewport_padding;
		available_above = trigger_rect.top - dropdown_gap - viewport_padding;

		var position_above = false;
		var target_available_space = available_below;

		if (dropdown_height > available_below && available_above > available_below) {
			position_above = true;
			target_available_space = available_above;
		}

		var max_options_height = Math.max(80, target_available_space - chrome_height);
		instance.options_element.style.maxHeight = Math.min(260, max_options_height) + "px";

		dropdown_height = Math.round(instance.dropdown_element.offsetHeight || 0);

		if (position_above) {
			next_top = trigger_rect.top - dropdown_height - dropdown_gap;
			instance.dropdown_element.classList.add("is-positioned-above");
		} else {
			next_top = trigger_rect.bottom + dropdown_gap;
			instance.dropdown_element.classList.remove("is-positioned-above");
		}

		if (viewport_height > 0) {
			if (next_top < viewport_padding) {
				next_top = viewport_padding;
			}

			if (
				dropdown_height > 0 &&
				next_top + dropdown_height > viewport_height - viewport_padding
			) {
				next_top = Math.max(
					viewport_padding,
					viewport_height - viewport_padding - dropdown_height
				);
			}
		}

		instance.dropdown_element.style.left = Math.round(next_left) + "px";
		instance.dropdown_element.style.top = Math.round(next_top) + "px";
	}

	function schedule_dropdown_position_update(instance) {
		if (!is_instance_active(instance) || !is_dropdown_open(instance)) {
			return;
		}

		if (instance.dropdown_position_timer) {
			return;
		}

		instance.dropdown_position_timer = request_animation_frame(function () {
			instance.dropdown_position_timer = null;
			update_dropdown_position(instance);
		});
	}

	function update_open_dropdown_positions() {
		var wrapper_elements = document.querySelectorAll(".mangoselect.is-open");
		var wrapper_index = 0;
		var current_instance = null;

		for (
			wrapper_index = 0;
			wrapper_index < wrapper_elements.length;
			wrapper_index += 1
		) {
			current_instance = wrapper_elements[wrapper_index][instance_key];

			if (current_instance) {
				schedule_dropdown_position_update(current_instance);
			}
		}
	}

	function close_dropdown(instance, close_reason) {
		var was_open = instance.wrapper_element.classList.contains("is-open");

		if (!was_open) {
			return;
		}

		if (is_draft_selection_active(instance)) {
			reset_draft_selection(instance);
			sync_option_elements_state(instance);
		}

		instance.wrapper_element.classList.remove("is-open");
		instance.dropdown_element.classList.remove("is-open");
		instance.dropdown_element.classList.remove("is-positioned-above");
		instance.trigger_element.setAttribute("aria-expanded", "false");

		if (instance.dropdown_position_timer) {
			cancel_animation_frame(instance.dropdown_position_timer);
			instance.dropdown_position_timer = null;
		}

		clear_search(instance);
		set_active_option(instance, null, false);
		dispatch_close_change(instance, close_reason || "close");
	}

	function close_all_dropdowns(instance_to_keep, close_reason) {
		var wrapper_elements = document.querySelectorAll(".mangoselect.is-open");
		var wrapper_index = 0;
		var current_instance = null;

		for (
			wrapper_index = 0;
			wrapper_index < wrapper_elements.length;
			wrapper_index += 1
		) {
			current_instance = wrapper_elements[wrapper_index][instance_key];

			if (current_instance && current_instance !== instance_to_keep) {
				close_dropdown(current_instance, close_reason || "close_all");
			}
		}
	}

	function open_dropdown(instance, open_reason) {
		if (
			instance.destroyed ||
			instance.destroying ||
			instance.wrapper_element.classList.contains("is-open")
		) {
			return;
		}

		if (instance.select_element.disabled) {
			return;
		}

		close_all_dropdowns(instance, "switch");
		instance.wrapper_element.classList.add("is-open");
		instance.dropdown_element.classList.add("is-open");
		instance.trigger_element.setAttribute("aria-expanded", "true");
		instance.opened_selected_values = get_selected_values(
			instance.select_element
		);
		instance.opened_selected_texts = get_selected_texts(
			instance.select_element
		);
		start_draft_selection(instance);
		sync_option_elements_state(instance);
		sync_active_option(instance);
		update_dropdown_position(instance);
		schedule_dropdown_position_update(instance);
		dispatch_open_callback(instance, open_reason || "open");

		if (instance.search_input_element && !instance.search_input_element.disabled) {
			window.setTimeout(function () {
				if (
					is_instance_active(instance) &&
					instance.search_input_element &&
					!instance.search_input_element.disabled
				) {
					instance.search_input_element.focus();
				}
			}, 0);
		} else {
			window.setTimeout(function () {
				if (
					is_instance_active(instance) &&
					instance.options_element &&
					!instance.select_element.disabled
				) {
					instance.options_element.focus();
				}
			}, 0);
		}

		if (instance.remote.enabled) {
			load_remote_options(instance, 1, true);
		}
	}

	function toggle_dropdown(instance) {
		if (instance.wrapper_element.classList.contains("is-open")) {
			close_dropdown(instance, "trigger");
			return;
		}

		open_dropdown(instance, "trigger");
	}

	function update_disabled_state(instance) {
		var is_disabled = !!instance.select_element.disabled;

		instance.trigger_element.disabled = is_disabled;

		if (instance.search_input_element) {
			instance.search_input_element.disabled = is_disabled;
		}

		if (instance.tag_button) {
			instance.tag_button.disabled = true;
		}

		if (is_disabled) {
			instance.wrapper_element.classList.add("is-disabled");

			if (instance.select_all_button) {
				instance.select_all_button.disabled = true;
			}

			if (instance.clear_all_button) {
				instance.clear_all_button.disabled = true;
			}

			if (instance.close_button) {
				instance.close_button.disabled = true;
			}

			if (instance.ok_button) {
				instance.ok_button.disabled = true;
			}

			if (instance.cancel_button) {
				instance.cancel_button.disabled = true;
			}

			close_dropdown(instance, "disabled");
			return;
		}

		instance.wrapper_element.classList.remove("is-disabled");
		update_tag_action_state(instance);
	}

	function update_action_labels(instance) {
		if (instance.select_all_button) {
			instance.select_all_button.textContent = translate(instance, "select_all");
		}

		if (instance.clear_all_button) {
			instance.clear_all_button.textContent = translate(
				instance,
				instance.is_multiple ? "clear_all" : "clear"
			);
		}

		if (instance.close_button) {
			instance.close_button.textContent = translate(instance, "close");
		}

		if (instance.ok_button) {
			instance.ok_button.textContent = translate(instance, "ok");
		}

		if (instance.cancel_button) {
			instance.cancel_button.textContent = translate(instance, "cancel");
		}

		if (instance.tag_button) {
			instance.tag_button.textContent = translate(instance, "add_tag");
		}
	}

	function update_action_state(instance) {
		var selectable_count = 0;
		var selectable_selected_count = 0;
		var min_selected = get_min_selected(instance);
		var max_selected = get_max_selected(instance);

		if (!instance.is_multiple) {
			if (instance.clear_all_button) {
				instance.clear_all_button.disabled =
					!!instance.select_element.disabled || get_selected_count(instance) === 0;
			}

			if (instance.close_button) {
				instance.close_button.disabled = !!instance.select_element.disabled;
			}

			if (instance.ok_button) {
				instance.ok_button.disabled = true;
			}

			if (instance.cancel_button) {
				instance.cancel_button.disabled = !!instance.select_element.disabled;
			}

			update_tag_action_state(instance);
			return;
		}

		selectable_count = get_selectable_options(instance.select_element).length;
		selectable_selected_count = get_working_selectable_selected_count(instance);

		if (instance.select_all_button) {
			instance.select_all_button.disabled =
				!!instance.select_element.disabled ||
				selectable_count === 0 ||
				selectable_selected_count === selectable_count ||
				(max_selected !== null && selectable_selected_count >= max_selected);
		}

		if (instance.clear_all_button) {
			instance.clear_all_button.disabled =
				!!instance.select_element.disabled ||
				selectable_selected_count === 0 ||
				selectable_selected_count <= min_selected;
		}

		if (instance.close_button) {
			instance.close_button.disabled = !!instance.select_element.disabled;
		}

		if (instance.ok_button) {
			instance.ok_button.disabled =
				!!instance.select_element.disabled || !has_draft_selection_changes(instance);
		}

		if (instance.cancel_button) {
			instance.cancel_button.disabled = !!instance.select_element.disabled;
		}

		update_tag_action_state(instance);
	}

	function update_search_placeholder(instance) {
		var placeholder_text = "";

		if (!instance.search_input_element) {
			return;
		}

		placeholder_text = translate(instance, "search_placeholder");
		instance.search_input_element.setAttribute("placeholder", placeholder_text);
		instance.search_input_element.setAttribute("aria-label", placeholder_text);
	}

	function apply_search_filter(instance) {
		var search_term = "";
		var option_elements = [];
		var option_index = 0;
		var visible_option_count = 0;
		var option_element = null;
		var group_elements = [];
		var group_index = 0;
		var group_options = [];
		var group_option_index = 0;
		var group_has_visible_option = false;

		if (!instance.search_input_element || instance.remote.enabled) {
			return;
		}

		search_term = normalize_search_text(instance.search_input_element.value);
		option_elements = to_array(
			instance.options_element.querySelectorAll(".mangoselect-option")
		);

		for (option_index = 0; option_index < option_elements.length; option_index += 1) {
			option_element = option_elements[option_index];

			if (
				search_term === "" ||
				option_element.getAttribute("data-search-text").indexOf(search_term) !== -1
			) {
				option_element.style.display = "";
				visible_option_count += 1;
				continue;
			}

			option_element.style.display = "none";
		}

		group_elements = to_array(
			instance.options_element.querySelectorAll(".mangoselect-group")
		);

		for (group_index = 0; group_index < group_elements.length; group_index += 1) {
			group_options = to_array(
				group_elements[group_index].querySelectorAll(".mangoselect-option")
			);
			group_has_visible_option = false;

			for (
				group_option_index = 0;
				group_option_index < group_options.length;
				group_option_index += 1
			) {
				if (group_options[group_option_index].style.display !== "none") {
					group_has_visible_option = true;
					break;
				}
			}

			group_elements[group_index].style.display = group_has_visible_option
				? ""
				: "none";
		}

		if (search_term !== "" && visible_option_count === 0) {
			set_status_message(instance, translate(instance, "no_search_result"), false);
			sync_active_option(instance);
			schedule_dropdown_position_update(instance);
			return;
		}

		set_status_message(instance, "", false);
		sync_active_option(instance);
		schedule_dropdown_position_update(instance);
	}

