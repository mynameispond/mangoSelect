	function can_add_more_selection(instance) {
		var max_selected = get_max_selected(instance);

		if (max_selected === null) {
			return true;
		}

		return get_working_selected_count(instance) < max_selected;
	}

	function can_remove_more_selection(instance) {
		return get_working_selected_count(instance) > get_min_selected(instance);
	}

	function sync_option_input_to_select(instance, input_element) {
		var option_value = input_element.getAttribute("data-option-value");
		var option_element = get_option_by_value(instance.select_element, option_value);
		var was_selected = false;
		var draft_lookup = {};
		var draft_values = [];
		var value_index = 0;

		if (!option_element || option_element.disabled) {
			return;
		}

		was_selected = is_working_option_selected(instance, option_element);

		if (input_element.checked && !was_selected && !can_add_more_selection(instance)) {
			input_element.checked = false;
			sync_option_elements_state(instance);
			return;
		}

		if (!input_element.checked && was_selected && !can_remove_more_selection(instance)) {
			input_element.checked = true;
			sync_option_elements_state(instance);
			return;
		}

		if (was_selected === input_element.checked) {
			if (!is_draft_selection_active(instance)) {
				return;
			}
		}

		if (is_draft_selection_active(instance)) {
			draft_values = get_draft_selected_values(instance);

			for (value_index = 0; value_index < draft_values.length; value_index += 1) {
				draft_lookup[String(draft_values[value_index])] = true;
			}

			if (input_element.checked) {
				draft_lookup[String(option_element.value)] = true;
			} else {
				delete draft_lookup[String(option_element.value)];
			}

			instance.draft_selection.values = build_selected_values_from_lookup(
				instance,
				draft_lookup
			);
			instance.last_changed_value = option_element.value;
			instance.last_changed_values = [option_element.value];
			sync_option_elements_state(instance);
			focus_dropdown_navigation_target(instance);
			return;
		}

		option_element.selected = input_element.checked;
		instance.last_changed_value = option_element.value;
		instance.last_changed_values = [option_element.value];

		dispatch_select_change(instance, {
			action: input_element.checked ? "select" : "unselect",
			changed_value: option_element.value,
			changed_values: [option_element.value],
			changed_text: option_element.text,
			changed_texts: [option_element.text],
			is_selected: input_element.checked
		});
		focus_dropdown_navigation_target(instance);
	}

	function sync_option_elements_state(instance) {
		var option_elements = instance.options_element.querySelectorAll(
			".mangoselect-option[data-option-value]"
		);
		var option_index = 0;
		var option_item = null;
		var option_value = "";
		var option_element = null;
		var checkbox_element = null;
		var is_select_disabled = !!instance.select_element.disabled;
		var selected_count = get_working_selected_count(instance);
		var min_selected = get_min_selected(instance);
		var max_selected = get_max_selected(instance);
		var is_at_max = max_selected !== null && selected_count >= max_selected;
		var is_at_min = selected_count <= min_selected;
		var should_disable_for_limit = false;
		var is_selected = false;

		ensure_single_placeholder_option(instance);

		for (
			option_index = 0;
			option_index < option_elements.length;
			option_index += 1
		) {
			option_item = option_elements[option_index];
			option_value = option_item.getAttribute("data-option-value");
			option_element = get_option_by_value(instance.select_element, option_value);
			checkbox_element = option_item.querySelector(".mangoselect-checkbox");

			if (!option_element) {
				continue;
			}

			is_selected = is_working_option_selected(instance, option_element);
			option_item.setAttribute("aria-selected", is_selected ? "true" : "false");

			if (is_selected) {
				option_item.classList.add("is-selected");
			} else {
				option_item.classList.remove("is-selected");
			}

			if (is_select_disabled || option_element.disabled) {
				option_item.classList.add("is-disabled");
				option_item.setAttribute("aria-disabled", "true");
			} else {
				option_item.classList.remove("is-disabled");
				option_item.setAttribute("aria-disabled", "false");
			}

			if (checkbox_element) {
				should_disable_for_limit =
					(!is_selected && is_at_max) ||
					(is_selected && is_at_min);
				checkbox_element.checked = !!is_selected;

				checkbox_element.disabled =
					is_select_disabled ||
					!!option_element.disabled ||
					should_disable_for_limit;

				if (checkbox_element.disabled) {
					option_item.classList.add("is-disabled");
				}

				sync_custom_checkbox_state(
					option_item,
					checkbox_element,
					option_element,
					instance,
					is_selected
				);
			}
		}

		update_summary(instance);
		update_action_state(instance);
		update_disabled_state(instance);
		update_remote_status(instance);
		sync_active_option(instance);
	}

	function handle_select_change(instance) {
		var change_detail = null;

		if (is_draft_selection_active(instance)) {
			sync_draft_selection_with_select(instance);
		}

		sync_option_elements_state(instance);
		change_detail = instance.pending_change_detail || create_change_detail(instance);
		instance.pending_change_detail = null;
		instance.last_change_detail = change_detail;

		if (typeof instance.options.on_change === "function") {
			instance.options.on_change(change_detail);
		}
	}

	function commit_draft_selection(instance) {
		var option_list = get_all_options(instance.select_element);
		var selected_lookup = {};
		var draft_values = get_draft_selected_values(instance);
		var changed_values = [];
		var changed_texts = [];
		var option_index = 0;
		var last_changed_value = null;
		var last_changed_text = null;
		var value_index = 0;
		var should_select = false;

		if (!is_draft_selection_active(instance)) {
			close_dropdown(instance, "ok");
			return false;
		}

		for (value_index = 0; value_index < draft_values.length; value_index += 1) {
			selected_lookup[String(draft_values[value_index])] = true;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				option_list[option_index].disabled ||
				is_placeholder_option(option_list[option_index])
			) {
				continue;
			}

			should_select = !!selected_lookup[String(option_list[option_index].value)];

			if (option_list[option_index].selected === should_select) {
				continue;
			}

			option_list[option_index].selected = should_select;
			changed_values.push(option_list[option_index].value);
			changed_texts.push(option_list[option_index].text);
			last_changed_value = option_list[option_index].value;
			last_changed_text = option_list[option_index].text;
		}

		reset_draft_selection(instance);
		ensure_single_placeholder_option(instance);

		if (changed_values.length === 0) {
			sync_option_elements_state(instance);
			close_dropdown(instance, "ok");
			return false;
		}

		instance.last_changed_value = last_changed_value;
		instance.last_changed_values = changed_values.slice(0);
		dispatch_select_change(instance, {
			action: "ok",
			changed_value: last_changed_value,
			changed_values: changed_values,
			changed_text: last_changed_text,
			changed_texts: changed_texts,
			is_selected: null
		});
		close_dropdown(instance, "ok");
		return true;
	}

	function cancel_draft_selection(instance) {
		if (!is_ok_cancel_mode(instance)) {
			close_dropdown(instance, "cancel");
			return;
		}

		reset_draft_selection(instance);
		sync_option_elements_state(instance);
		close_dropdown(instance, "cancel");
	}

	function create_tag_option(instance, tag_value) {
		var option_element = get_option_by_value(instance.select_element, tag_value);
		var option_data = null;

		if (!option_element) {
			option_data = {
				id: tag_value,
				text: tag_value,
				html: null,
				disabled: false,
				selected: false
			};

			option_element = upsert_option_from_data(instance.select_element, option_data);
		} else {
			option_data = {
				id: String(option_element.value),
				text: option_element.text,
				html: option_element.getAttribute(option_html_attribute),
				disabled: !!option_element.disabled,
				selected: !!option_element.selected
			};
		}

		if (instance.remote.enabled) {
			instance.remote.current_results = merge_remote_results(
				[option_data],
				instance.remote.current_results,
				false
			);
		}

		return option_element;
	}

	function add_tag_from_search(instance) {
		var tag_value = get_tag_value(instance);
		var tag_option = null;
		var draft_lookup = {};
		var draft_values = [];
		var value_index = 0;

		if (!instance.options.tags || !instance.search_input_element || tag_value === "") {
			return;
		}

		if (instance.remote.search_timer) {
			window.clearTimeout(instance.remote.search_timer);
			instance.remote.search_timer = null;
		}

		if (instance.remote.loading) {
			abort_remote_request(instance);
		}

		tag_option = create_tag_option(instance, tag_value);

		if (!tag_option || tag_option.disabled) {
			return;
		}

		if (is_draft_selection_active(instance)) {
			draft_values = get_draft_selected_values(instance);

			for (value_index = 0; value_index < draft_values.length; value_index += 1) {
				draft_lookup[String(draft_values[value_index])] = true;
			}

			draft_lookup[String(tag_option.value)] = true;
			instance.draft_selection.values = build_selected_values_from_lookup(
				instance,
				draft_lookup
			);
			instance.last_changed_value = tag_option.value;
			instance.last_changed_values = [tag_option.value];
			instance.search_input_element.value = "";
			refresh_instance(instance);
			return;
		}

		if (instance.is_multiple) {
			apply_selected_values(instance, [tag_option.value], true, "add_tag");
		} else {
			instance.single_selection_committed = true;
			apply_selected_values(instance, [tag_option.value], false, "add_tag");
			close_dropdown(instance, "select");
		}

		instance.search_input_element.value = "";
		refresh_instance(instance);
	}

	function clear_selected_values(instance, action_name) {
		var option_list = get_all_options(instance.select_element);
		var option_index = 0;
		var changed_values = [];
		var changed_texts = [];
		var last_changed_value = null;
		var last_changed_text = null;
		var min_selected = get_min_selected(instance);
		var selected_count = get_selected_count(instance);

		if (!instance.is_multiple) {
			instance.single_selection_committed = false;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				option_list[option_index].disabled ||
				!option_list[option_index].selected ||
				is_placeholder_option(option_list[option_index])
			) {
				continue;
			}

			if (instance.is_multiple && selected_count <= min_selected) {
				break;
			}

			option_list[option_index].selected = false;
			changed_values.push(option_list[option_index].value);
			changed_texts.push(option_list[option_index].text);
			last_changed_value = option_list[option_index].value;
			last_changed_text = option_list[option_index].text;
			selected_count -= 1;
		}

		ensure_single_placeholder_option(instance);

		if (changed_values.length === 0) {
			sync_option_elements_state(instance);
			return false;
		}

		instance.last_changed_value = last_changed_value;
		instance.last_changed_values = changed_values.slice(0);

		dispatch_select_change(instance, {
			action: action_name || "clear_all",
			changed_value: last_changed_value,
			changed_values: changed_values,
			changed_text: last_changed_text,
			changed_texts: changed_texts,
			is_selected: false
		});

		return true;
	}

	function set_bulk_selection(instance, should_select, use_draft_selection) {
		var option_list = [];
		var option_index = 0;
		var changed_values = [];
		var changed_texts = [];
		var action_name = should_select ? "select_all" : "clear_all";
		var changed_value = null;
		var changed_text = null;
		var available_slots = null;
		var min_selected = get_min_selected(instance);
		var selected_count = get_selected_count(instance);
		var draft_lookup = {};
		var draft_values = [];
		var value_index = 0;
		var option_value = "";

		if (use_draft_selection && is_draft_selection_active(instance)) {
			option_list = get_selectable_options(instance.select_element);
			draft_values = get_draft_selected_values(instance);
			selected_count = draft_values.length;
			available_slots = get_max_selected(instance);

			for (value_index = 0; value_index < draft_values.length; value_index += 1) {
				draft_lookup[String(draft_values[value_index])] = true;
			}

			if (available_slots !== null) {
				available_slots -= selected_count;
			}

			for (
				option_index = 0;
				option_index < option_list.length;
				option_index += 1
			) {
				option_value = String(option_list[option_index].value);

				if (!!draft_lookup[option_value] === should_select) {
					continue;
				}

				if (
					should_select &&
					available_slots !== null &&
					available_slots <= 0
				) {
					break;
				}

				if (!should_select && selected_count <= min_selected) {
					break;
				}

				if (should_select) {
					draft_lookup[option_value] = true;
					selected_count += 1;

					if (available_slots !== null) {
						available_slots -= 1;
					}
				} else {
					delete draft_lookup[option_value];
					selected_count -= 1;
				}

				changed_value = option_list[option_index].value;
			}

			if (changed_value === null) {
				sync_option_elements_state(instance);
				return false;
			}

			instance.draft_selection.values = build_selected_values_from_lookup(
				instance,
				draft_lookup
			);
			sync_option_elements_state(instance);
			return true;
		}

		if (!instance.is_multiple) {
			if (!should_select) {
				return clear_selected_values(instance, action_name);
			}

			option_list = get_selectable_options(instance.select_element);

			if (option_list.length === 0) {
				sync_option_elements_state(instance);
				return false;
			}

			changed_value = get_selected_values(instance.select_element).join("\n");
			apply_selected_values(
				instance,
				[option_list[0].value],
				false,
				"select"
			);
			return changed_value !== get_selected_values(instance.select_element).join("\n");
		}

		option_list = get_selectable_options(instance.select_element);
		available_slots = get_max_selected(instance);

		if (available_slots !== null) {
			available_slots -= selected_count;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (option_list[option_index].selected === should_select) {
				continue;
			}

			if (
				should_select &&
				available_slots !== null &&
				available_slots <= 0
			) {
				break;
			}

			if (!should_select && selected_count <= min_selected) {
				break;
			}

			option_list[option_index].selected = should_select;
			changed_values.push(option_list[option_index].value);
			changed_texts.push(option_list[option_index].text);
			changed_value = option_list[option_index].value;
			changed_text = option_list[option_index].text;

			if (should_select && available_slots !== null) {
				available_slots -= 1;
			}

			if (!should_select) {
				selected_count -= 1;
			}
		}

		if (changed_values.length === 0) {
			sync_option_elements_state(instance);
			return false;
		}

		instance.last_changed_value = changed_value;
		instance.last_changed_values = changed_values.slice(0);

		dispatch_select_change(instance, {
			action: action_name,
			changed_value: changed_value,
			changed_values: changed_values,
			changed_text: changed_text,
			changed_texts: changed_texts,
			is_selected: should_select
		});

		return true;
	}

	function select_all(instance, should_close_after_action, use_draft_selection) {
		var has_changed = set_bulk_selection(
			instance,
			true,
			!!use_draft_selection
		);

		if (
			has_changed &&
			should_close_after_action &&
			instance.options.close_after_select_all &&
			!is_draft_selection_active(instance)
		) {
			close_dropdown(instance, "select_all");
		}
	}

	function clear_all(instance, should_close_after_action, use_draft_selection) {
		var has_changed = set_bulk_selection(
			instance,
			false,
			!!use_draft_selection
		);

		if (
			has_changed &&
			should_close_after_action &&
			instance.options.close_after_clear_all &&
			!is_draft_selection_active(instance)
		) {
			close_dropdown(instance, "clear_all");
		}
	}

	function set_disabled(instance, should_disable) {
		instance.select_element.disabled = !!should_disable;
		sync_option_elements_state(instance);
	}

	function set_option_disabled(instance, values, should_disable) {
		var normalized_values = normalize_value_list(values);
		var option_list = get_all_options(instance.select_element);
		var disabled_lookup = {};
		var option_index = 0;

		if (normalized_values.length === 0) {
			sync_option_elements_state(instance);
			return;
		}

		for (option_index = 0; option_index < normalized_values.length; option_index += 1) {
			disabled_lookup[normalized_values[option_index]] = true;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (!disabled_lookup[String(option_list[option_index].value)]) {
				continue;
			}

			option_list[option_index].disabled = !!should_disable;
		}

		sync_option_elements_state(instance);
	}

	function apply_selected_values(instance, values, should_append, action_name) {
		var normalized_values = normalize_value_list(values);
		var option_list = get_all_options(instance.select_element);
		var selected_lookup = {};
		var option_index = 0;
		var changed_values = [];
		var changed_texts = [];
		var should_select = false;
		var resolved_action_name = action_name || "";
		var last_changed_value = null;
		var last_changed_text = null;
		var is_selected = should_append ? true : null;
		var selected_count = get_selected_count(instance);
		var min_selected = get_min_selected(instance);
		var max_selected = get_max_selected(instance);
		var available_slots = max_selected;

		if (!instance.is_multiple) {
			should_append = false;
			if (normalized_values.length > 1) {
				normalized_values = [normalized_values[0]];
			}

			instance.single_selection_committed = normalized_values.length > 0;
		}

		if (normalized_values.length === 0 && should_append) {
			sync_option_elements_state(instance);
			return;
		}

		if (!resolved_action_name) {
			resolved_action_name = should_append
				? "api_select_value"
				: "api_set_selected_values";
		}

		for (option_index = 0; option_index < normalized_values.length; option_index += 1) {
			selected_lookup[normalized_values[option_index]] = true;
		}

		if (instance.is_multiple && available_slots !== null) {
			available_slots -= selected_count;
		}

		for (option_index = 0; option_index < option_list.length; option_index += 1) {
			if (
				option_list[option_index].disabled ||
				is_placeholder_option(option_list[option_index])
			) {
				continue;
			}

			should_select = should_append
				? option_list[option_index].selected ||
					!!selected_lookup[String(option_list[option_index].value)]
				: !!selected_lookup[String(option_list[option_index].value)];

			if (
				instance.is_multiple &&
				should_select &&
				!option_list[option_index].selected &&
				available_slots !== null &&
				available_slots <= 0
			) {
				should_select = false;
			}

			if (
				instance.is_multiple &&
				!should_select &&
				option_list[option_index].selected &&
				selected_count <= min_selected
			) {
				should_select = true;
			}

			if (option_list[option_index].selected === should_select) {
				continue;
			}

			option_list[option_index].selected = should_select;
			changed_values.push(option_list[option_index].value);
			changed_texts.push(option_list[option_index].text);
			last_changed_value = option_list[option_index].value;
			last_changed_text = option_list[option_index].text;

			if (instance.is_multiple) {
				if (should_select) {
					selected_count += 1;
					if (available_slots !== null) {
						available_slots -= 1;
					}
				} else {
					selected_count -= 1;
				}
			}
		}

		ensure_single_placeholder_option(instance);

		if (changed_values.length === 0) {
			sync_option_elements_state(instance);
			return;
		}

		instance.last_changed_value = last_changed_value;
		instance.last_changed_values = changed_values.slice(0);

		dispatch_select_change(instance, {
			action: resolved_action_name,
			changed_value: last_changed_value,
			changed_values: changed_values,
			changed_text: last_changed_text,
			changed_texts: changed_texts,
			is_selected: is_selected
		});
	}

	function select_single_value(instance, value) {
		var option_element = get_option_by_value(instance.select_element, value);

		if (!option_element || option_element.disabled) {
			return;
		}

		instance.single_selection_committed = true;
		apply_selected_values(instance, [option_element.value], false, "select");
		close_dropdown(instance, "select");
	}

	function select_value(instance, values) {
		if (!instance.is_multiple) {
			apply_selected_values(instance, values, false, "api_select_value");
			return;
		}

		apply_selected_values(instance, values, true, "api_select_value");
	}

	function set_selected_values(instance, values) {
		apply_selected_values(instance, values, false, "api_set_selected_values");
	}

