	function destroy_instance(instance) {
		if (!instance || instance.destroyed || instance.destroying) {
			return instance ? instance.api : null;
		}

		instance.destroying = true;
		close_dropdown(instance, "destroy");

		if (instance.remote.search_timer) {
			window.clearTimeout(instance.remote.search_timer);
			instance.remote.search_timer = null;
		}

		if (instance.form_reset_timer) {
			window.clearTimeout(instance.form_reset_timer);
			instance.form_reset_timer = null;
		}

		if (instance.dropdown_position_timer) {
			cancel_animation_frame(instance.dropdown_position_timer);
			instance.dropdown_position_timer = null;
		}

		clear_remote_loading_timer(instance);
		abort_remote_request(instance);
		instance.remote.enabled = false;
		instance.remote.loaded = false;
		instance.remote.loading = false;
		instance.remote.has_more = false;
		instance.remote.totals = 0;
		instance.remote.page_num = 0;
		instance.remote.current_term = "";
		instance.remote.current_results = [];
		instance.remote.error_message = "";

		if (instance.select_element && instance.select_change_handler) {
			instance.select_element.removeEventListener(
				"change",
				instance.select_change_handler
			);
			instance.select_change_handler = null;
		}

		if (instance.form_element && instance.form_reset_handler) {
			instance.form_element.removeEventListener(
				"reset",
				instance.form_reset_handler
			);
			instance.form_reset_handler = null;
		}

		if (instance.wrapper_element) {
			delete instance.wrapper_element[instance_key];

			if (instance.wrapper_element.parentNode) {
				instance.wrapper_element.parentNode.removeChild(instance.wrapper_element);
			}
		}

		if (instance.dropdown_element) {
			delete instance.dropdown_element[instance_key];

			if (instance.dropdown_element.parentNode) {
				instance.dropdown_element.parentNode.removeChild(instance.dropdown_element);
			}
		}

		if (instance.select_element) {
			delete instance.select_element[instance_key];
			instance.select_element.classList.remove("mangoselect-native");
			instance.select_element.removeAttribute(ready_attribute);
			remove_internal_placeholder_options(instance.select_element);
		}

		if (active_instance_count > 0) {
			active_instance_count -= 1;
		}

		unbind_global_listeners_if_idle();

		instance.destroyed = true;
		instance.destroying = false;
		instance.wrapper_element = null;
		instance.trigger_element = null;
		instance.label_element = null;
		instance.dropdown_element = null;
		instance.search_element = null;
		instance.search_input_element = null;
		instance.tag_button = null;
		instance.actions_element = null;
		instance.select_all_button = null;
		instance.clear_all_button = null;
		instance.close_button = null;
		instance.ok_button = null;
		instance.cancel_button = null;
		instance.options_element = null;
		instance.search_empty_element = null;
		instance.form_element = null;
		instance.form_reset_timer = null;
		instance.dropdown_position_timer = null;
		instance.instance_id = null;
		instance.listbox_id = null;
		instance.active_option_value = null;

		return instance.api;
	}

	function create_instance_api(instance) {
		instance.api = {
			open: function () {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				open_dropdown(instance, "api");
				return instance.api;
			},
			close: function () {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				close_dropdown(instance, "api");
				return instance.api;
			},
			refresh: function () {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				refresh_instance(instance);
				return instance.api;
			},
			reload: function () {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				if (instance.remote.enabled) {
					load_remote_options(instance, 1, true);
					return instance.api;
				}

				refresh_instance(instance);
				return instance.api;
			},
			set_disabled: function (should_disable) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				set_disabled(instance, should_disable);
				return instance.api;
			},
			set_option_disabled: function (values, should_disable) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				set_option_disabled(instance, values, should_disable);
				return instance.api;
			},
			disable_option: function (values) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				set_option_disabled(instance, values, true);
				return instance.api;
			},
			enable_option: function (values) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				set_option_disabled(instance, values, false);
				return instance.api;
			},
			select_all: function () {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				select_all(instance);
				return instance.api;
			},
			clear_all: function () {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				clear_all(instance);
				return instance.api;
			},
			select_value: function (values) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				select_value(instance, values);
				return instance.api;
			},
			set_selected_values: function (values) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				set_selected_values(instance, values);
				return instance.api;
			},
			get_selected_values: function () {
				return get_selected_values(instance.select_element);
			},
			get_selected_texts: function () {
				return get_selected_texts(instance.select_element);
			},
			get_last_changed_value: function () {
				return instance.last_changed_value;
			},
			get_last_change_detail: function () {
				return instance.last_change_detail;
			},
			get_select_element: function () {
				return instance.select_element;
			},
			is_disabled: function () {
				return !!instance.select_element.disabled;
			},
			is_remote: function () {
				return !!instance.remote.enabled;
			},
			set_language: function (language_name) {
				if (!is_instance_active(instance)) {
					return instance.api;
				}

				instance.base_options.language = language_name;
				refresh_instance(instance);
				return instance.api;
			},
			destroy: function () {
				destroy_instance(instance);
				return instance.api;
			}
		};

		return instance.api;
	}

	function create_instance(select_element, options) {
		var wrapper_element = null;
		var trigger_element = null;
		var label_element = null;
		var arrow_element = null;
		var dropdown_element = null;
		var search_element = null;
		var search_input_element = null;
		var tag_button = null;
		var actions_element = null;
		var select_all_button = null;
		var clear_all_button = null;
		var close_button = null;
		var ok_button = null;
		var cancel_button = null;
		var options_element = null;
		var search_empty_element = null;
		var form_element = select_element.form;
		var existing_instance = select_element[instance_key];
		var base_options = normalize_explicit_options(options);
		var instance_options = resolve_instance_options(select_element, base_options);
		var instance_id = "mangoselect-" + String((instance_counter += 1));
		var next_instance_options = null;
		var instance = null;

		bind_global_listeners();

		if (existing_instance) {
			existing_instance.base_options = merge_explicit_options(
				existing_instance.base_options,
				options
			);
			next_instance_options = resolve_instance_options(
				select_element,
				existing_instance.base_options
			);

			if (
				should_rebuild_instance(
					existing_instance,
					next_instance_options,
					!!select_element.multiple
				)
			) {
				destroy_instance(existing_instance);
				return create_instance(select_element, existing_instance.base_options);
			}

			existing_instance.options = next_instance_options;
			existing_instance.is_multiple = !!select_element.multiple;
			existing_instance.single_selection_committed = select_element.multiple
				? true
				: has_default_selected_option(select_element);
			existing_instance.remote.enabled = is_remote_enabled(existing_instance);
			sync_draft_selection_with_select(existing_instance);
			ensure_single_placeholder_option(existing_instance);
			refresh_instance(existing_instance);
			return existing_instance.api;
		}

		wrapper_element = document.createElement("div");
		wrapper_element.className = "mangoselect";

		trigger_element = document.createElement("button");
		trigger_element.type = "button";
		trigger_element.className = "mangoselect-trigger";
		trigger_element.setAttribute("aria-haspopup", "listbox");
		trigger_element.setAttribute("aria-expanded", "false");

		label_element = document.createElement("span");
		label_element.id = instance_id + "-label";
		label_element.className = "mangoselect-label";

		arrow_element = document.createElement("span");
		arrow_element.className = "mangoselect-arrow";
		arrow_element.setAttribute("aria-hidden", "true");

		dropdown_element = document.createElement("div");
		dropdown_element.className = "mangoselect-dropdown";

		if (instance_options.animation) {
			dropdown_element.classList.add("mangoselect-animation-" + instance_options.animation);
		}

		if (instance_options.search) {
			search_element = document.createElement("div");
			search_element.className = "mangoselect-search";

			search_input_element = document.createElement("input");
			search_input_element.type = "text";
			search_input_element.className = "mangoselect-search-input";
			search_input_element.setAttribute("autocomplete", "off");
			search_input_element.setAttribute("aria-controls", instance_id + "-listbox");

			search_element.appendChild(search_input_element);

			if (instance_options.tags) {
				tag_button = document.createElement("button");
				tag_button.type = "button";
				tag_button.className =
					"mangoselect-search-action mangoselect-search-action-add-tag";
				tag_button.style.display = "none";
				search_element.appendChild(tag_button);
			}
		}

		actions_element = document.createElement("div");
		actions_element.className = "mangoselect-actions";

		if (instance_options.select_all && select_element.multiple) {
			select_all_button = document.createElement("button");
			select_all_button.type = "button";
			select_all_button.className =
				"mangoselect-action mangoselect-action-select-all";
			actions_element.appendChild(select_all_button);
		}

		if (instance_options.clear_all) {
			clear_all_button = document.createElement("button");
			clear_all_button.type = "button";
			clear_all_button.className =
				"mangoselect-action mangoselect-action-clear-all";
			actions_element.appendChild(clear_all_button);
		}

		if (instance_options.close) {
			close_button = document.createElement("button");
			close_button.type = "button";
			close_button.className =
				"mangoselect-action mangoselect-action-close mangoselect-action-secondary";
			actions_element.appendChild(close_button);
		}

		if (instance_options.ok_cancel_in_multi && select_element.multiple) {
			cancel_button = document.createElement("button");
			cancel_button.type = "button";
			cancel_button.className =
				"mangoselect-action mangoselect-action-cancel mangoselect-action-secondary";
			actions_element.appendChild(cancel_button);

			ok_button = document.createElement("button");
			ok_button.type = "button";
			ok_button.className =
				"mangoselect-action mangoselect-action-ok mangoselect-action-primary";
			actions_element.appendChild(ok_button);
		}

		options_element = document.createElement("div");
		options_element.id = instance_id + "-listbox";
		options_element.className = "mangoselect-options";
		options_element.tabIndex = 0;
		options_element.setAttribute("role", "listbox");
		options_element.setAttribute("aria-labelledby", label_element.id);

		if (select_element.multiple) {
			options_element.setAttribute("aria-multiselectable", "true");
		}

		search_empty_element = document.createElement("div");
		search_empty_element.className = "mangoselect-empty mangoselect-search-empty";
		search_empty_element.setAttribute("role", "status");
		search_empty_element.setAttribute("aria-live", "polite");
		search_empty_element.style.display = "none";

		trigger_element.setAttribute("aria-controls", options_element.id);

		trigger_element.appendChild(label_element);
		trigger_element.appendChild(arrow_element);

		if (search_element) {
			dropdown_element.appendChild(search_element);
		}

		dropdown_element.appendChild(options_element);
		dropdown_element.appendChild(search_empty_element);
		dropdown_element.appendChild(actions_element);
		if (instance_options.inline) {
			wrapper_element.classList.add("mangoselect-inline");
			dropdown_element.classList.add("mangoselect-dropdown-inline");
			wrapper_element.classList.add("is-open");
			dropdown_element.classList.add("is-open");
			trigger_element.setAttribute("aria-expanded", "true");

			wrapper_element.appendChild(dropdown_element);
		} else {
			wrapper_element.appendChild(trigger_element);
		}

		select_element.classList.add("mangoselect-native");
		select_element.setAttribute(ready_attribute, "1");
		select_element.parentNode.insertBefore(wrapper_element, select_element.nextSibling);

		if (!instance_options.inline) {
			(document.body || document.documentElement).appendChild(dropdown_element);
		}

		instance = {
			select_element: select_element,
			form_element: form_element,
			wrapper_element: wrapper_element,
			trigger_element: trigger_element,
			label_element: label_element,
			dropdown_element: dropdown_element,
			search_element: search_element,
			search_input_element: search_input_element,
			tag_button: tag_button,
			actions_element: actions_element,
			select_all_button: select_all_button,
			clear_all_button: clear_all_button,
			close_button: close_button,
			ok_button: ok_button,
			cancel_button: cancel_button,
			options_element: options_element,
			search_empty_element: search_empty_element,
			instance_id: instance_id,
			listbox_id: options_element.id,
			base_options: base_options,
			options: instance_options,
			is_multiple: !!select_element.multiple,
			single_selection_committed: select_element.multiple
				? true
				: has_default_selected_option(select_element),
			last_changed_value: null,
			last_changed_values: [],
			last_change_detail: null,
			last_open_detail: null,
			last_close_detail: null,
			last_loading_start_detail: null,
			last_loading_end_detail: null,
			last_error_detail: null,
			pending_change_detail: null,
			opened_selected_values: get_selected_values(select_element),
			opened_selected_texts: get_selected_texts(select_element),
			draft_selection: {
				active: false,
				values: get_selected_values(select_element)
			},
			select_change_handler: null,
			form_reset_handler: null,
			form_reset_timer: null,
			dropdown_position_timer: null,
			destroyed: false,
			destroying: false,
			active_option_value: null,
			api: null,
			remote: {
				enabled: false,
				loaded: false,
				loading: false,
				has_more: false,
				totals: 0,
				page_num: 0,
				current_term: "",
				current_results: [],
				request_id: 0,
				search_timer: null,
				loading_status_timer: null,
				loading_status_visible: false,
				xhr: null,
				error_message: ""
			}
		};

		instance.remote.enabled = is_remote_enabled(instance);
		ensure_single_placeholder_option(instance);

		select_element[instance_key] = instance;
		wrapper_element[instance_key] = instance;
		dropdown_element[instance_key] = instance;
		active_instance_count += 1;
		create_instance_api(instance);

		trigger_element.addEventListener("click", function () {
			toggle_dropdown(instance);
		});

		trigger_element.addEventListener("keydown", function (event) {
			if (event.key === "ArrowDown" || event.keyCode === 40) {
				event.preventDefault();
				open_dropdown(instance, "trigger");
				window.setTimeout(function () {
					if (is_instance_active(instance)) {
						move_active_option(instance, 1, true);
					}
				}, 0);
				return;
			}

			if (event.key === "ArrowUp" || event.keyCode === 38) {
				event.preventDefault();
				open_dropdown(instance, "trigger");
				window.setTimeout(function () {
					if (is_instance_active(instance)) {
						move_active_option(instance, -1, true);
					}
				}, 0);
			}
		});

		if (search_input_element) {
			search_input_element.addEventListener("click", function (event) {
				event.stopPropagation();
			});

			search_input_element.addEventListener("input", function () {
				if (instance.remote.enabled) {
					if (sync_remote_search_threshold_state(instance)) {
						update_tag_action_state(instance);
						return;
					}

					schedule_remote_search(instance);
				} else {
					apply_search_filter(instance);
				}

				update_tag_action_state(instance);
			});

			search_input_element.addEventListener("keydown", function (event) {
				if (handle_dropdown_navigation_keydown(instance, event)) {
					return;
				}
			});
		}

		if (tag_button) {
			tag_button.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				add_tag_from_search(instance);
			});
		}

		options_element.addEventListener("scroll", function () {
			maybe_load_next_remote_page(instance);
		});

		options_element.addEventListener("keydown", function (event) {
			handle_dropdown_navigation_keydown(instance, event);
		});

		if (select_all_button) {
			select_all_button.addEventListener("click", function (event) {
				event.preventDefault();
				select_all(instance, true, true);
			});
		}

		if (clear_all_button) {
			clear_all_button.addEventListener("click", function (event) {
				event.preventDefault();
				clear_all(instance, true, true);
			});
		}

		if (close_button) {
			close_button.addEventListener("click", function (event) {
				event.preventDefault();
				event.stopPropagation();
				close_dropdown(instance, "close");
				instance.trigger_element.focus();
			});
		}

		if (ok_button) {
			ok_button.addEventListener("click", function (event) {
				event.preventDefault();
				commit_draft_selection(instance);
			});
		}

		if (cancel_button) {
			cancel_button.addEventListener("click", function (event) {
				event.preventDefault();
				cancel_draft_selection(instance);
			});
		}

		instance.select_change_handler = function () {
			handle_select_change(instance);
		};
		select_element.addEventListener("change", instance.select_change_handler);

		if (form_element) {
			instance.form_reset_handler = function () {
				instance.form_reset_timer = window.setTimeout(function () {
					instance.form_reset_timer = null;

					if (!is_instance_active(instance)) {
						return;
					}

					instance.last_changed_value = null;
					instance.last_changed_values = [];
					instance.pending_change_detail = null;
					instance.single_selection_committed = instance.is_multiple
						? true
						: has_default_selected_option(instance.select_element);
					instance.remote.current_term = "";
					instance.remote.error_message = "";
					reset_remote_loading_status(instance);

					if (instance.search_input_element) {
						instance.search_input_element.value = "";
					}

					reset_draft_selection(instance);
					sync_option_elements_state(instance);
				}, 0);
			};
			form_element.addEventListener("reset", instance.form_reset_handler);
		}

		refresh_instance(instance);
		return instance.api;
	}

	function init(options) {
		var explicit_options = normalize_explicit_options(options || {});
		var selector = explicit_options.selector;
		var select_elements = get_target_elements(selector);
		var select_index = 0;
		var created_instances = [];

		if (!selector) {
			return created_instances;
		}

		for (
			select_index = 0;
			select_index < select_elements.length;
			select_index += 1
		) {
			if (
				!select_elements[select_index] ||
				select_elements[select_index].tagName.toLowerCase() !== "select"
			) {
				continue;
			}

			created_instances.push(
				create_instance(select_elements[select_index], explicit_options)
			);
		}

		return created_instances.length === 1 ? created_instances[0] : created_instances;
	}

	function refresh(target) {
		var target_selector = target || ".mangoselect-native";
		var select_elements = get_target_elements(target_selector);
		var select_index = 0;
		var instance = null;

		for (
			select_index = 0;
			select_index < select_elements.length;
			select_index += 1
		) {
			instance = select_elements[select_index][instance_key];

			if (!instance) {
				continue;
			}

			refresh_instance(instance);
		}
	}

	function get_instance(target) {
		var select_elements = get_target_elements(target);

		if (select_elements.length === 0) {
			return null;
		}

		if (!select_elements[0][instance_key]) {
			return null;
		}

		return select_elements[0][instance_key].api;
	}

