	function is_dom_node(value) {
		return !!value && typeof value === "object" && typeof value.nodeType === "number";
	}

	function create_dom_id_fragment(value) {
		var normalized_value = window
			.encodeURIComponent(String(value || ""))
			.replace(/%/g, "_")
			.replace(/[^a-zA-Z0-9_-]+/g, "-")
			.replace(/^-+|-+$/g, "");

		return normalized_value || "item";
	}

	function set_rendered_content(
		target_element,
		render_output,
		fallback_text,
		fallback_html,
		allow_html
	) {
		target_element.textContent = "";

		if (is_dom_node(render_output)) {
			target_element.appendChild(render_output);
			return;
		}

		if (
			render_output !== undefined &&
			render_output !== null &&
			render_output !== false
		) {
			if (
				allow_html &&
				(typeof render_output === "string" || render_output instanceof String)
			) {
				target_element.innerHTML = String(render_output);
				return;
			}

			target_element.textContent = String(render_output);
			return;
		}

		if (
			allow_html &&
			fallback_html !== undefined &&
			fallback_html !== null &&
			fallback_html !== ""
		) {
			target_element.innerHTML = String(fallback_html);
			return;
		}

		target_element.textContent = fallback_text || "";
	}

	function create_option_view_data(option_element, instance, is_selected) {
		return {
			id: String(option_element.value),
			value: String(option_element.value),
			text: option_element.text || "",
			html: option_element.getAttribute(option_html_attribute),
			image: option_element.getAttribute(option_image_attribute),
			icon: option_element.getAttribute(option_icon_attribute),
			description: option_element.getAttribute(option_description_attribute),
			disabled: !!option_element.disabled,
			selected: !!option_element.selected,
			is_selected:
				is_selected !== undefined
					? !!is_selected
					: instance
					? is_working_option_selected(instance, option_element)
					: !!option_element.selected
		};
	}

	function create_group_view_data(group_element) {
		var children = [];
		var child_index = 0;

		for (child_index = 0; child_index < group_element.children.length; child_index += 1) {
			if (group_element.children[child_index].tagName.toLowerCase() !== "option") {
				continue;
			}

			if (is_placeholder_option(group_element.children[child_index])) {
				continue;
			}

			children.push(create_option_view_data(group_element.children[child_index], null));
		}

		return {
			text: group_element.label || "",
			label: group_element.label || "",
			html: group_element.getAttribute(group_html_attribute),
			disabled: !!group_element.disabled,
			group_key: group_element.getAttribute(group_key_attribute) || "",
			children: children
		};
	}

	function render_option_content(target_element, option_data, instance) {
		var render_output = null;
		var image_element = null;
		var icon_element = null;
		var text_span = null;

		if (typeof instance.options.render_option === "function") {
			render_output = instance.options.render_option(option_data);
		}

		if (
			render_output === null &&
			(
				(option_data.image !== null && option_data.image !== undefined && option_data.image !== "") ||
				(option_data.icon !== null && option_data.icon !== undefined && option_data.icon !== "") ||
				(option_data.description !== null && option_data.description !== undefined && option_data.description !== "")
			)
		) {
			target_element.textContent = "";

			if (option_data.image) {
				image_element = document.createElement("img");
				image_element.src = option_data.image;
				image_element.className = "mangoselect-option-image";
				target_element.appendChild(image_element);
			} else if (option_data.icon) {
				icon_element = document.createElement("i");
				icon_element.className = option_data.icon + " mangoselect-option-icon";
				target_element.appendChild(icon_element);
			}

			var text_container = document.createElement("div");
			text_container.className = "mangoselect-option-text-group";

			text_span = document.createElement("span");
			text_span.className = "mangoselect-option-label";
			text_span.textContent = option_data.text || "";
			text_container.appendChild(text_span);

			if (option_data.description !== null && option_data.description !== undefined && option_data.description !== "") {
				var desc_span = document.createElement("span");
				desc_span.className = "mangoselect-option-description";
				desc_span.textContent = option_data.description;
				text_container.appendChild(desc_span);
			}

			target_element.appendChild(text_container);
			return;
		}

		set_rendered_content(
			target_element,
			render_output,
			option_data.text || "",
			option_data.html,
			!!instance.options.allow_html
		);
	}

	function render_group_content(target_element, group_data, instance) {
		var render_output = null;

		if (typeof instance.options.render_group === "function") {
			render_output = instance.options.render_group(group_data);
		}

		set_rendered_content(
			target_element,
			render_output,
			group_data.text || "",
			group_data.html,
			!!instance.options.allow_html
		);
	}

	function render_checkbox_content(target_element, option_data, instance) {
		var render_output = null;

		if (typeof instance.options.render_checkbox !== "function") {
			target_element.textContent = "";
			return false;
		}

		render_output = instance.options.render_checkbox(option_data);

		if (
			render_output === undefined ||
			render_output === null ||
			render_output === false
		) {
			target_element.textContent = "";
			return false;
		}

		set_rendered_content(
			target_element,
			render_output,
			"",
			null,
			!!instance.options.allow_html
		);

		return true;
	}

	function sync_custom_checkbox_state(
		option_item,
		checkbox_element,
		option_element,
		instance,
		is_selected
	) {
		var custom_checkbox_element = option_item.querySelector(
			".mangoselect-checkbox-custom"
		);
		var option_data = create_option_view_data(
			option_element,
			instance,
			is_selected
		);
		var has_custom_checkbox = false;

		if (typeof instance.options.render_checkbox !== "function") {
			if (custom_checkbox_element && custom_checkbox_element.parentNode) {
				custom_checkbox_element.parentNode.removeChild(custom_checkbox_element);
			}

			checkbox_element.classList.remove("mangoselect-checkbox-input");
			return;
		}

		if (!custom_checkbox_element) {
			custom_checkbox_element = document.createElement("span");
			custom_checkbox_element.className = "mangoselect-checkbox-custom";
			custom_checkbox_element.setAttribute("aria-hidden", "true");
		}

		has_custom_checkbox = render_checkbox_content(
			custom_checkbox_element,
			option_data,
			instance
		);

		if (!has_custom_checkbox) {
			if (custom_checkbox_element.parentNode) {
				custom_checkbox_element.parentNode.removeChild(custom_checkbox_element);
			}

			checkbox_element.classList.remove("mangoselect-checkbox-input");
			return;
		}

		custom_checkbox_element.classList.toggle("is-selected", !!is_selected);
		custom_checkbox_element.classList.toggle(
			"is-disabled",
			!!checkbox_element.disabled
		);
		checkbox_element.classList.add("mangoselect-checkbox-input");

		if (!custom_checkbox_element.parentNode) {
			option_item.insertBefore(
				custom_checkbox_element,
				checkbox_element.nextSibling
			);
		}
	}

	function is_option_item_visible(option_item) {
		var parent_group = null;

		if (!option_item || option_item.style.display === "none") {
			return false;
		}

		parent_group = find_parent_by_class(option_item, "mangoselect-group");

		if (parent_group && parent_group.style.display === "none") {
			return false;
		}

		return true;
	}

	function get_visible_option_items(instance, include_disabled) {
		var option_items = to_array(
			instance.options_element.querySelectorAll(".mangoselect-option[data-option-value]")
		);
		var visible_items = [];
		var option_index = 0;

		for (option_index = 0; option_index < option_items.length; option_index += 1) {
			if (!is_option_item_visible(option_items[option_index])) {
				continue;
			}

			if (
				!include_disabled &&
				option_items[option_index].classList.contains("is-disabled")
			) {
				continue;
			}

			visible_items.push(option_items[option_index]);
		}

		return visible_items;
	}

	function get_current_active_option_item(instance) {
		var option_items = [];
		var option_index = 0;

		if (!instance.active_option_value) {
			return null;
		}

		option_items = to_array(
			instance.options_element.querySelectorAll(".mangoselect-option[data-option-value]")
		);

		for (option_index = 0; option_index < option_items.length; option_index += 1) {
			if (
				option_items[option_index].getAttribute("data-option-value") ===
				String(instance.active_option_value)
			) {
				return option_items[option_index];
			}
		}

		return null;
	}

	function update_listbox_active_descendant(instance, active_option_id) {
		if (active_option_id) {
			instance.options_element.setAttribute("aria-activedescendant", active_option_id);
		} else {
			instance.options_element.removeAttribute("aria-activedescendant");
		}

		if (instance.search_input_element) {
			if (active_option_id) {
				instance.search_input_element.setAttribute(
					"aria-activedescendant",
					active_option_id
				);
			} else {
				instance.search_input_element.removeAttribute("aria-activedescendant");
			}
		}
	}

	function set_active_option(instance, option_item, should_scroll) {
		var current_active_item = get_current_active_option_item(instance);
		var option_value = "";

		if (current_active_item) {
			current_active_item.classList.remove("is-active");
		}

		if (!option_item) {
			instance.active_option_value = null;
			update_listbox_active_descendant(instance, "");
			return;
		}

		option_value = option_item.getAttribute("data-option-value");
		instance.active_option_value = option_value;
		option_item.classList.add("is-active");
		update_listbox_active_descendant(instance, option_item.id || "");

		if (should_scroll) {
			try {
				option_item.scrollIntoView({
					block: "nearest"
				});
			} catch (error) {
				option_item.scrollIntoView(false);
			}
		}
	}

	function sync_active_option(instance) {
		var active_option_item = get_current_active_option_item(instance);
		var visible_items = [];
		var option_index = 0;

		if (
			active_option_item &&
			is_option_item_visible(active_option_item) &&
			!active_option_item.classList.contains("is-disabled")
		) {
			set_active_option(instance, active_option_item, false);
			return;
		}

		visible_items = get_visible_option_items(instance, false);

		for (option_index = 0; option_index < visible_items.length; option_index += 1) {
			if (visible_items[option_index].classList.contains("is-selected")) {
				set_active_option(instance, visible_items[option_index], false);
				return;
			}
		}

		set_active_option(instance, visible_items.length ? visible_items[0] : null, false);
	}

	function move_active_option(instance, direction, move_to_edge) {
		var visible_items = get_visible_option_items(instance, false);
		var current_active_item = get_current_active_option_item(instance);
		var current_index = -1;
		var next_index = 0;

		if (visible_items.length === 0) {
			set_active_option(instance, null, false);
			return;
		}

		if (move_to_edge) {
			next_index = direction < 0 ? visible_items.length - 1 : 0;
			set_active_option(instance, visible_items[next_index], true);
			return;
		}

		if (current_active_item) {
			current_index = visible_items.indexOf(current_active_item);
		}

		if (current_index === -1) {
			next_index = direction < 0 ? visible_items.length - 1 : 0;
		} else {
			next_index = current_index + direction;

			if (next_index < 0) {
				next_index = visible_items.length - 1;
			} else if (next_index >= visible_items.length) {
				next_index = 0;
			}
		}

		set_active_option(instance, visible_items[next_index], true);
	}

	function activate_active_option(instance) {
		var active_option_item = get_current_active_option_item(instance);
		var checkbox_element = null;

		if (
			!active_option_item ||
			!is_option_item_visible(active_option_item) ||
			active_option_item.classList.contains("is-disabled")
		) {
			return false;
		}

		if (!instance.is_multiple) {
			select_single_value(
				instance,
				active_option_item.getAttribute("data-option-value")
			);
			return true;
		}

		checkbox_element = active_option_item.querySelector(".mangoselect-checkbox");

		if (!checkbox_element || checkbox_element.disabled) {
			return false;
		}

		checkbox_element.checked = !checkbox_element.checked;
		sync_option_input_to_select(instance, checkbox_element);
		return true;
	}

	function focus_dropdown_navigation_target(instance) {
		if (
			!instance ||
			!instance.wrapper_element ||
			!instance.wrapper_element.classList.contains("is-open")
		) {
			return;
		}

		if (instance.search_input_element && !instance.search_input_element.disabled) {
			instance.search_input_element.focus();
			return;
		}

		if (instance.options_element && !instance.select_element.disabled) {
			instance.options_element.focus();
		}
	}

	function handle_dropdown_navigation_keydown(instance, event) {
		if (event.key === "ArrowDown" || event.keyCode === 40) {
			event.preventDefault();
			event.stopPropagation();
			move_active_option(instance, 1, false);
			return true;
		}

		if (event.key === "ArrowUp" || event.keyCode === 38) {
			event.preventDefault();
			event.stopPropagation();
			move_active_option(instance, -1, false);
			return true;
		}

		if (event.key === "Home" || event.keyCode === 36) {
			event.preventDefault();
			event.stopPropagation();
			move_active_option(instance, 1, true);
			return true;
		}

		if (event.key === "End" || event.keyCode === 35) {
			event.preventDefault();
			event.stopPropagation();
			move_active_option(instance, -1, true);
			return true;
		}

		if (event.key === "Escape" || event.keyCode === 27) {
			event.preventDefault();
			event.stopPropagation();
			close_dropdown(instance, "escape");
			instance.trigger_element.focus();
			return true;
		}

		if (event.key === "Enter" || event.keyCode === 13) {
			event.preventDefault();
			event.stopPropagation();

			if (activate_active_option(instance)) {
				return true;
			}

			if (instance.options.tags) {
				add_tag_from_search(instance);
				return true;
			}
		}

		return false;
	}

	function build_option_item(option_element, instance) {
		var option_item = document.createElement(
			instance.is_multiple ? "label" : "div"
		);
		var checkbox_element = null;
		var option_content = document.createElement("div");
		var is_selected = is_working_option_selected(instance, option_element);
		var option_data = create_option_view_data(
			option_element,
			instance,
			is_selected
		);

		option_item.className = "mangoselect-option";
		option_item.id =
			instance.listbox_id +
			"-option-" +
			create_dom_id_fragment(option_element.value) +
			"-" +
			String(option_element.index);
		var keywords = option_element.getAttribute(option_keywords_attribute) || "";
		option_item.setAttribute(
			"data-search-text",
			normalize_search_text(option_element.text + " " + option_element.value + " " + keywords)
		);
		option_item.setAttribute("data-option-value", String(option_element.value));
		option_item.setAttribute("role", "option");
		option_item.setAttribute("aria-label", option_data.text);

		if (option_element.disabled) {
			option_item.classList.add("is-disabled");
		}

		if (is_selected) {
			option_item.classList.add("is-selected");
		}

		if (instance.is_multiple) {
			checkbox_element = document.createElement("input");
			checkbox_element.type = "checkbox";
			checkbox_element.className = "mangoselect-checkbox";
			checkbox_element.setAttribute(
				"data-option-value",
				String(option_element.value)
			);
			checkbox_element.tabIndex = -1;
			checkbox_element.checked = !!is_selected;
			checkbox_element.disabled = !!option_element.disabled;

			checkbox_element.addEventListener("change", function () {
				sync_option_input_to_select(instance, checkbox_element);
			});

			option_item.appendChild(checkbox_element);
			sync_custom_checkbox_state(
				option_item,
				checkbox_element,
				option_element,
				instance,
				is_selected
			);
		} else {
			option_item.addEventListener("click", function () {
				select_single_value(instance, option_element.value);
			});
		}

		option_item.addEventListener("mouseenter", function () {
			if (option_item.classList.contains("is-disabled")) {
				return;
			}

			set_active_option(instance, option_item, false);
		});

		option_content.className = "mangoselect-option-text";
		render_option_content(option_content, option_data, instance);

		option_item.appendChild(option_content);

		return option_item;
	}

	function create_group_title_element(group_element, instance) {
		var option_group_title = document.createElement("div");
		var group_data = create_group_view_data(group_element);

		option_group_title.className = "mangoselect-group-title";
		render_group_content(option_group_title, group_data, instance);

		if (
			instance.options.allow_html &&
			group_data.html !== null &&
			group_data.html !== ""
		) {
			option_group_title.classList.add("mangoselect-group-title-html");
		}

		return option_group_title;
	}

	function render_local_options(instance) {
		var select_children = instance.select_element.children;
		var child_index = 0;
		var child_element = null;
		var child_tag_name = "";
		var option_group = null;
		var option_group_title = null;
		var group_option_index = 0;
		var has_option = false;
		var empty_state = null;

		instance.options_element.innerHTML = "";

		for (child_index = 0; child_index < select_children.length; child_index += 1) {
			child_element = select_children[child_index];
			child_tag_name = child_element.tagName.toLowerCase();

			if (child_tag_name === "optgroup") {
				option_group = document.createElement("div");
				option_group.className = "mangoselect-group";
				option_group.setAttribute("role", "group");
				option_group.setAttribute(
					"aria-label",
					child_element.label || html_to_text(child_element.getAttribute(group_html_attribute))
				);

				if (
					child_element.label ||
					child_element.getAttribute(group_html_attribute)
				) {
					option_group_title = create_group_title_element(child_element, instance);
					option_group.appendChild(option_group_title);
				}

				for (
					group_option_index = 0;
					group_option_index < child_element.children.length;
					group_option_index += 1
				) {
					option_group.appendChild(
						build_option_item(child_element.children[group_option_index], instance)
					);
					has_option = true;
				}

				instance.options_element.appendChild(option_group);
				continue;
			}

			if (child_tag_name === "option") {
				if (is_placeholder_option(child_element)) {
					continue;
				}

				instance.options_element.appendChild(
					build_option_item(child_element, instance)
				);
				has_option = true;
			}
		}

		if (!has_option) {
			empty_state = document.createElement("div");
			empty_state.className = "mangoselect-empty";
			empty_state.textContent = translate(instance, "no_option");
			instance.options_element.appendChild(empty_state);
		}
	}

	function render_remote_options(instance) {
		var result_index = 0;
		var option_element = null;
		var empty_state = null;
		var empty_message = translate(instance, "no_option");
		var ajax_options = get_ajax_options(instance);
		var search_length = get_ajax_search_length(ajax_options);
		var result_item = null;
		var option_group = null;
		var option_group_title = null;
		var group_option_index = 0;
		var group_option_element = null;

		instance.options_element.innerHTML = "";

		if (count_remote_results(instance.remote.current_results) === 0) {
			if (
				search_length > 0 &&
				String(instance.remote.current_term || "").length < search_length
			) {
				empty_message = translate(instance, "search_length_notice", {
					count: search_length
				});
			} else if (instance.remote.current_term !== "") {
				empty_message = translate(instance, "no_search_result");
			}

			empty_state = document.createElement("div");
			empty_state.className = "mangoselect-empty";
			empty_state.textContent = empty_message;
			instance.options_element.appendChild(empty_state);
			return;
		}

		for (
			result_index = 0;
			result_index < instance.remote.current_results.length;
			result_index += 1
		) {
			result_item = instance.remote.current_results[result_index];

			if (is_remote_group_item(result_item)) {
				option_element = get_optgroup_by_key(
					instance.select_element,
					result_item.group_key || ""
				);

				if (!option_element) {
					continue;
				}

				option_group = document.createElement("div");
				option_group.className = "mangoselect-group";
				option_group.setAttribute("role", "group");
				option_group.setAttribute(
					"aria-label",
					option_element.label ||
						html_to_text(option_element.getAttribute(group_html_attribute))
				);

				if (
					option_element.label ||
					option_element.getAttribute(group_html_attribute)
				) {
					option_group_title = create_group_title_element(option_element, instance);
					option_group.appendChild(option_group_title);
				}

				for (
					group_option_index = 0;
					group_option_index < result_item.children.length;
					group_option_index += 1
				) {
					group_option_element = get_option_by_value(
						instance.select_element,
						result_item.children[group_option_index].id
					);

					if (!group_option_element) {
						continue;
					}

					option_group.appendChild(
						build_option_item(group_option_element, instance)
					);
				}

				instance.options_element.appendChild(option_group);
				continue;
			}

			option_element = get_option_by_value(
				instance.select_element,
				result_item.id
			);

			if (!option_element) {
				continue;
			}

			instance.options_element.appendChild(build_option_item(option_element, instance));
		}
	}

	function render_options(instance) {
		update_search_placeholder(instance);
		update_action_labels(instance);

		if (instance.remote.enabled) {
			render_remote_options(instance);
			sync_option_elements_state(instance);
			schedule_dropdown_position_update(instance);
			return;
		}

		render_local_options(instance);
		sync_option_elements_state(instance);
		apply_search_filter(instance);
		schedule_dropdown_position_update(instance);
	}

	function refresh_instance(instance) {
		var was_remote_enabled = false;

		if (!is_instance_active(instance)) {
			return instance;
		}

		was_remote_enabled = !!instance.remote.enabled;
		instance.options = resolve_instance_options(
			instance.select_element,
			instance.base_options || instance.options
		);
		instance.remote.enabled = is_remote_enabled(instance);

		if (was_remote_enabled !== instance.remote.enabled) {
			abort_remote_request(instance);
			instance.remote.loaded = false;
			instance.remote.loading = false;
			instance.remote.has_more = false;
			instance.remote.totals = 0;
			instance.remote.page_num = 0;
			instance.remote.current_term = "";
			instance.remote.current_results = [];
			instance.remote.error_message = "";
			reset_remote_loading_status(instance);
		}

		render_options(instance);
		return instance;
	}

	function should_rebuild_instance(instance, next_options, is_multiple) {
		return (
			!!instance.search_input_element !== !!next_options.search ||
			!!instance.tag_button !== !!next_options.tags ||
			!!instance.select_all_button !== !!(next_options.select_all && is_multiple) ||
			!!instance.clear_all_button !== !!next_options.clear_all ||
			!!instance.close_button !== !!next_options.close ||
			!!instance.ok_button !== !!(next_options.ok_cancel_in_multi && is_multiple) ||
			!!instance.cancel_button !== !!(next_options.ok_cancel_in_multi && is_multiple)
		);
	}

