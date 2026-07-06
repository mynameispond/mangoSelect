# mangoSelect

mangoSelect คือ JavaScript select component แบบไม่ต้องพึ่ง build step เพิ่ม ใช้กับ `<select>` เดิมในหน้าได้ทันที รองรับทั้ง:

- Local options จาก `<option>` ใน HTML
- Multiple select checkbox
- Search ใน dropdown
- Ajax / remote data
- ภาษาไทยผ่าน `dist/i18n/th.js`
- Safe rendering ผ่าน `allow_html`, `render_option()` และ `render_group()`
- Keyboard navigation และ ARIA ที่พร้อมใช้
- ควบคุมค่าผ่าน JavaScript API

ไฟล์เดโมที่อธิบายแบบละเอียดอยู่ที่ [`demo/index.html`](./demo/index.html), endpoint ตัวอย่างสำหรับ Ajax อยู่ที่ [`demo/demo-api.php`](./demo/demo-api.php) และ repository อยู่ที่ [GitHub](https://github.com/mynameispond/mangoSelect)

## ไฟล์ในโปรเจกต์

```text
myselect/
|- LICENSE
|- package.json
|- package-lock.json
|- dist/
|  |- mangoselect.css
|  |- mangoselect.min.css
|  |- mangoselect.js
|  |- mangoselect.min.js
|  \- i18n/
|     |- en.js
|     \- th.js
|- demo/
|  |- index.html
|  \- demo-api.php
|- scripts/
|  \- build.mjs
|- src/
|  |- i18n/
|  |  |- en.js
|  |  \- th.js
|  |- styles/
|  |  \- mangoselect.css
|  \- mangoselect/
|     |- 00-bootstrap.js
|     |- 10-core.js
|     |- 20-remote-config.js
|     |- 30-ui-state.js
|     |- 40-callbacks.js
|     |- 50-selection.js
|     |- 60-remote-data.js
|     |- 70-render.js
|     |- 80-instance.js
|     \- 90-export.js
\- node_modules/
```

## การติดตั้ง

โหลดไฟล์ที่จำเป็นก่อนใช้งาน:

```html
<link rel="stylesheet" href="./dist/mangoselect.css">
<script src="./dist/mangoselect.js"></script>
<script src="./dist/i18n/th.js"></script>
```

ถ้าใช้งาน production และต้องการไฟล์ขนาดเล็กกว่า สามารถเปลี่ยนเป็น `mangoselect.min.css` และ `mangoselect.min.js` ได้:

```html
<link rel="stylesheet" href="./dist/mangoselect.min.css">
<script src="./dist/mangoselect.min.js"></script>
```

จากนั้นสร้าง `<select>` ตามปกติ แล้วเรียก `mangoSelect.init()`

```html
<select id="province-select" name="province" data-mangoselect-language="th">
	<option value="bkk">กรุงเทพมหานคร</option>
	<option value="cnx">เชียงใหม่</option>
	<option value="kkc">ขอนแก่น</option>
</select>

<script>
var provinceSelect = window.mangoSelect.init({
	selector: "#province-select",
	language: "th"
});
</script>
```

หมายเหตุสำหรับการพัฒนา:

- ไฟล์ที่หน้าเว็บใช้งานจริงอยู่ใน `dist/` เช่น `dist/mangoselect.css` + `dist/mangoselect.js` หรือไฟล์ minified คู่กัน
- source ภายในถูกแยกไว้ใน `src/mangoselect/`, `src/styles/` และ `src/i18n/`
- ถ้าแก้ source modules, CSS หรือ i18n แล้วให้ build กลับด้วย `npm run build` เพื่อสร้างไฟล์ใหม่ใน `dist/`

หมายเหตุ:

- ตัวอย่างในเอกสารนี้ใช้การ init ผ่าน `id` เท่านั้น เช่น `selector: "#province-select"`
- ถ้าไม่ส่ง `selector` ตอน `mangoSelect.init()` ไลบรารีจะไม่เริ่มทำงานและจะคืนค่าเป็น array ว่าง
- `mangoSelect.init()` จะคืน instance โดยตรงเมื่อ selector เจอ `<select>` เพียงตัวเดียว และจะคืน array เมื่อ init ได้หลายตัว
- เมื่อใช้ `<select multiple>` mangoSelect จะแสดงตัวเลือกเป็น checkbox ภายใน dropdown ดังนั้นค้นหาเอกสารนี้ได้ทั้งคำว่า `multiple select`, `checkbox select` และ `multiple select checkbox`
- ลำดับการ resolve config คือ `options ที่ส่งให้ init() -> data-mangoselect-* -> default`

## ตัวอย่างการใช้งาน

### 1. เลือกค่าเดียวแบบ local

```html
<select id="example-single" name="province" data-mangoselect-language="th" data-mangoselect-placeholder="เลือกจังหวัด">
	<option value="bkk">กรุงเทพมหานคร</option>
	<option value="cnx">เชียงใหม่</option>
	<option value="kkc">ขอนแก่น</option>
	<option value="hdy">หาดใหญ่</option>
</select>

<script>
var singleSelect = window.mangoSelect.init({
	selector: "#example-single",
	language: "th",
	on_change: function (detail) {
		console.log("selected:", detail.selected_values[0]);
	}
});
</script>
```

### 2. หลายตัวเลือกแบบ local (multiple select checkbox)

โหมดนี้ยังใช้ `<select multiple>` ตามปกติ แต่ใน dropdown จะ render ตัวเลือกเป็น checkbox เพื่อให้เลือกหลายค่าได้ชัดเจนขึ้น

```html
<select id="example-multiple" name="team[]" multiple
	data-mangoselect-language="th"
	data-mangoselect-placeholder="เลือกฝ่าย"
	data-mangoselect-min_selected="1"
	data-mangoselect-max_selected="3">
	<option value="sales" selected>ฝ่ายขาย</option>
	<option value="marketing">การตลาด</option>
	<option value="support" selected>ซัพพอร์ต</option>
	<option value="hr">บุคคล</option>
	<option value="warehouse">คลังสินค้า</option>
</select>

<script>
var multiSelect = window.mangoSelect.init({
	selector: "#example-multiple",
	language: "th",
	search: true,
	ok_cancel_in_multi: true,
	select_all: true,
	clear_all: true
});

multiSelect.select_value(["marketing"]);
console.log(multiSelect.get_selected_values());
</script>
```

### 3. เลือกค่าเดียวแบบ Ajax

```html
<select id="example-ajax-single" name="owner"
	data-mangoselect-language="th"
	data-mangoselect-placeholder="เลือก owner 1 คน"
	data-mangoselect-delay="300"
	data-mangoselect-url="./demo/demo-api.php?fixvar=2"
	data-mangoselect-param-option="owner"
	data-mangoselect-param-customer="9"></select>

<script>
var ajaxSingle = window.mangoSelect.init({
	selector: "#example-ajax-single",
	language: "th",
	ajax: true,
	search: true,
	search_length: 2,
	on_open: function (detail) {
		console.log("open:", detail.open_reason);
	},
	on_close: function (detail) {
		console.log("close:", detail.close_reason);
	},
	on_loading_start: function (detail) {
		console.log("loading start:", detail.request_params.search);
	},
	on_loading_end: function (detail) {
		console.log("loading end:", detail.success, detail.status);
	},
	on_error: function (detail) {
		console.log("error:", detail.error_type, detail.error_message);
	},
	on_change: function (detail) {
		console.log(detail.selected_values[0], detail.selected_texts[0]);
	}
});
</script>
```

### 4. หลายตัวเลือกแบบ Ajax (multiple select checkbox)

ถ้าเป็น Ajax และใช้ `<select multiple>` ผลลัพธ์ที่โหลดเข้ามาจะถูกแสดงเป็น checkbox เช่นเดียวกับ multiple select แบบ local

```html
<select id="example-ajax-multiple" name="employee[]" multiple
	data-mangoselect-language="th"
	data-mangoselect-placeholder="ค้นหาพนักงาน"
	data-mangoselect-delay="250"
	data-mangoselect-url="./demo/demo-api.php?fixvar=2"
	data-mangoselect-per_page="10"
	data-mangoselect-max_selected="3"
	data-mangoselect-param-option="employee"
	data-mangoselect-param-customer="1"
	data-mangoselect-param-branch="bkk"></select>

<script>
var ajaxMultiple = window.mangoSelect.init({
	selector: "#example-ajax-multiple",
	language: "th",
	ajax: true,
	search: true,
	search_length: 2,
	select_all: true,
	close_after_select_all: true,
	clear_all: true,
	close_after_clear_all: true
});

ajaxMultiple.open();
</script>
```

### 5. Tags พร้อมเพิ่ม option ใหม่จากช่องค้นหา

`tags: true` รองรับทั้ง local, ajax, single select และ multiple select โดยใน single select จะเลือกค่าและปิด dropdown ทันที ส่วนใน ajax จะเพิ่ม option เข้า component ฝั่ง client ได้ทันที

```html
<select id="example-tags" name="keyword[]" multiple
	data-mangoselect-language="th"
	data-mangoselect-placeholder="เลือกหรือพิมพ์ tag"
	data-mangoselect-max_selected="5">
	<option value="urgent">urgent</option>
	<option value="review">review</option>
	<option value="draft">draft</option>
</select>

<script>
var tagSelect = window.mangoSelect.init({
	selector: "#example-tags",
	language: "th",
	search: true,
	tags: true,
	ok_cancel_in_multi: true,
	clear_all: true
});
</script>
```

### 6. Custom renderer แบบแยก 2 สไตล์

`render_option()` และ `render_group()` ใช้ได้ 2 แบบชัดเจน:

- แบบ HTML string: เขียนสั้น และเหมาะกับเคสที่ต้องการประกอบ markup เอง โดยต้องเปิด `allow_html: true`
- แบบ DOM node ปกติ: ปลอดภัยกว่า เพราะคืน `Node` และใช้ `textContent` ได้ตรง ๆ

#### 6.1 แบบ HTML string แบบง่าย

ตัวอย่างนี้เหมาะกับกรณีที่อยากเขียน renderer ให้สั้นที่สุด เช่น `return '<div class="demo-group_item">' + option.text + '</div>';`

```html
<style>
.demo-group_title {
	display: block;
	margin-bottom: 6px;
	padding: 4px 10px;
	border-radius: 999px;
	background: rgba(15, 118, 110, 0.08);
	color: #0f5f59;
	font-size: 12px;
	font-weight: 700;
}

.demo-group_item {
	display: block;
	padding: 10px 12px;
	border: 1px solid rgba(148, 163, 184, 0.22);
	border-radius: 12px;
	background: #ffffff;
}
</style>

<select id="example-renderers-html" name="assignee_html"
	data-mangoselect-language="th"
	data-mangoselect-placeholder="เลือกผู้รับผิดชอบ"
	data-mangoselect-close="true"
	data-mangoselect-allow_html="true"
	data-mangoselect-render_option="demoRenderOptionHtml"
	data-mangoselect-render_group="demoRenderGroupHtml">
	<optgroup label="Core Team">
		<option value="ava" selected>Ava Smith</option>
		<option value="noah">Noah Johnson</option>
	</optgroup>
	<optgroup label="Field Team">
		<option value="emma">Emma Wilson</option>
		<option value="liam">Liam Brown</option>
	</optgroup>
</select>

<script>
window.demoRenderGroupHtml = function (group) {
	return '<div class="demo-group_title">' + group.text + '</div>';
};

window.demoRenderOptionHtml = function (option) {
	return '<div class="demo-group_item">' + option.text + '</div>';
};

var rendererHtmlSelect = window.mangoSelect.init({
	selector: "#example-renderers-html",
	language: "th",
	close: false
});
</script>
```

ถ้าต้องการแยก style ตอน selected หรือ disabled ค่อยเช็ค `option.is_selected` และ `option.disabled` เพิ่มใน function นี้ได้ภายหลัง

#### 6.2 แบบปกติ โดยคืน DOM node

ตัวอย่างนี้ไม่ต้องต่อ string HTML เอง เหมาะกับข้อมูลที่ไม่อยากให้ไปแตะ `innerHTML`

```html
<style>
.demo-group_title {
	display: block;
	margin-bottom: 6px;
	padding: 4px 10px;
	border-radius: 999px;
	background: rgba(15, 118, 110, 0.08);
	color: #0f5f59;
	font-size: 12px;
	font-weight: 700;
}

.demo-group_item {
	display: block;
	padding: 10px 12px;
	border: 1px solid rgba(148, 163, 184, 0.22);
	border-radius: 12px;
	background: #ffffff;
}
</style>

<select id="example-renderers-node" name="assignee_node"
	data-mangoselect-language="th"
	data-mangoselect-placeholder="เลือกผู้รับผิดชอบ"
	data-mangoselect-close="true"
	data-mangoselect-render_option="demoRenderOptionNode"
	data-mangoselect-render_group="demoRenderGroupNode">
	<optgroup label="Core Team">
		<option value="ava" selected>Ava Smith</option>
		<option value="noah">Noah Johnson</option>
	</optgroup>
	<optgroup label="Field Team">
		<option value="emma">Emma Wilson</option>
		<option value="liam">Liam Brown</option>
	</optgroup>
</select>

<script>
window.demoRenderGroupNode = function (group) {
	var element = document.createElement("div");
	element.className = "demo-group_title";
	element.textContent = group.text;
	return element;
};

window.demoRenderOptionNode = function (option) {
	var element = document.createElement("div");
	element.className = "demo-group_item";
	element.textContent = option.text;
	return element;
};

var rendererNodeSelect = window.mangoSelect.init({
	selector: "#example-renderers-node",
	language: "th",
	close: false
});
</script>
```

ถ้าต้องการแยก class ตอน selected หรือ disabled ก็สามารถเพิ่มเงื่อนไขแล้วแก้ `element.className` ได้แบบเดียวกัน

#### 6.3 Custom checkbox สำหรับ multiple

ถ้าเป็น `<select multiple>` สามารถใช้ `render_checkbox(option)` เพื่อ custom หน้าตา checkbox ได้ โดยยังมี native checkbox ภายในสำหรับ sync state และถ้าไม่ตั้งค่า ไลบรารีจะใช้ checkbox ธรรมดาเหมือนเดิม

แบบ HTML string ต้องเปิด `allow_html: true`:

```html
<style>
.demo-check {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 22px;
	height: 22px;
	border: 2px solid rgba(15, 118, 110, 0.42);
	border-radius: 8px;
	background: #ffffff;
	color: #ffffff;
	font-weight: 700;
}

.demo-check.is-on {
	border-color: #0f766e;
	background: #0f766e;
}
</style>

<select id="example-renderers-checkbox" name="status[]" multiple
	data-mangoselect-language="th"
	data-mangoselect-allow_html="true"
	data-mangoselect-render_checkbox="demoRenderCheckboxHtml">
	<option value="new" selected>New</option>
	<option value="in-progress">In progress</option>
	<option value="done">Done</option>
</select>

<script>
window.demoRenderCheckboxHtml = function (option) {
	if (option.is_selected) {
		return '<span class="demo-check is-on">&#10003;</span>';
	}

	return '<span class="demo-check"></span>';
};

var rendererCheckboxSelect = window.mangoSelect.init({
	selector: "#example-renderers-checkbox",
	language: "th"
});
</script>
```

แบบ DOM node ใช้ CSS `.demo-check` ชุดเดียวกับตัวอย่างด้านบน และไม่ต้องเปิด `allow_html`:

```html
<select id="example-renderers-checkbox-node" name="priority[]" multiple
	data-mangoselect-language="th"
	data-mangoselect-render_checkbox="demoRenderCheckboxNode">
	<option value="low">Low</option>
	<option value="medium" selected>Medium</option>
	<option value="high">High</option>
</select>

<script>
window.demoRenderCheckboxNode = function (option) {
	var element = document.createElement("span");
	element.className = option.is_selected ? "demo-check is-on" : "demo-check";
	element.textContent = option.is_selected ? "✓" : "";
	return element;
};

var rendererCheckboxNodeSelect = window.mangoSelect.init({
	selector: "#example-renderers-checkbox-node",
	language: "th"
});
</script>
```

### 7. Built-in Image และ Icon

ไลบรารีรองรับการใส่รูปภาพ (Image) และไอคอน (Icon) สำหรับตัวเลือกใน Dropdown และแสดงในส่วนผลลัพธ์ที่ถูกเลือก (ในโหมดเลือกค่าเดียว Single Select) โดยอัตโนมัติ เพียงกำหนดแอตทริบิวต์ `data-mangoselect-image` หรือ `data-mangoselect-icon` บน `<option>`:

```html
<!-- แบบใช้รูปภาพ (Image) -->
<select id="example-images" name="user">
	<option value="1" data-mangoselect-image="https://i.pravatar.cc/100?img=1">User 1</option>
	<option value="2" data-mangoselect-image="https://i.pravatar.cc/100?img=2">User 2</option>
</select>

<!-- แบบใช้คลาสไอคอน (Icon เช่น FontAwesome) -->
<select id="example-icons" name="status">
	<option value="active" data-mangoselect-icon="fa fa-check-circle">Active</option>
	<option value="inactive" data-mangoselect-icon="fa fa-times-circle">Inactive</option>
</select>

<script>
window.mangoSelect.init({ selector: "#example-images" });
window.mangoSelect.init({ selector: "#example-icons" });
</script>
```

### 8. โหมดการแสดงผลตลอดเวลา (Inline / Embed Mode)

คุณสามารถฝังตัวเลือกของ mangoSelect แช่ไว้บนหน้าเว็บโดยตรงโดยไม่ต้องกดคลิกเปิดหรือปิด dropdown (คล้ายกับ listbox หรือแบบสอบถามกล่องตัวเลือกขนาดใหญ่) เพียงเปิดออปชัน `inline: true` หรือใส่ `data-mangoselect-inline="true"`:

```html
<select id="example-inline" name="role" data-mangoselect-inline="true">
	<option value="admin">Administrator</option>
	<option value="editor">Editor</option>
	<option value="author">Author</option>
</select>

<script>
window.mangoSelect.init({ selector: "#example-inline" });
</script>
```

### 9. การใช้งานคำอธิบายย่อยใต้ตัวเลือก (Option Descriptions / Helper Text)

คุณสามารถระบุคำอธิบายย่อยเพื่ออธิบายตัวเลือกใน Dropdown แต่ละตัวได้ โดยระบบจะจัดโครงสร้างตัวอักษรและรายละเอียดเรียงตัวซ้อนกันเป็นกลุ่มข้อความสวยงาม เพียงระบุแอตทริบิวต์ `data-mangoselect-description` บน `<option>`:

```html
<select id="example-descriptions" name="package">
	<option value="basic" data-mangoselect-description="ฟังก์ชันจำกัด เหมาะสำหรับบุคคลทั่วไป">Basic Pack</option>
	<option value="pro" data-mangoselect-description="ฟังก์ชันครบครัน พร้อมบริการช่วยเหลือ 24 ชั่วโมง">Professional Pack</option>
</select>

<script>
window.mangoSelect.init({ selector: "#example-descriptions" });
</script>
```

### 10. อนิเมชันการเปิด-ปิดพรีเมียม (Premium Dropdown Transitions)

คุณสามารถเปิดใช้งานหรือปรับแต่งเอฟเฟกต์อนิเมชันเปิด/ปิด Dropdown เพื่อมอบประสบการณ์ใช้งานที่ลื่นไหลระดับพรีเมียมได้ โดยผ่านออปชัน `animation` ใน JavaScript หรือกำหนดแอตทริบิวต์ `data-mangoselect-animation` บน `<select>`:

```html
<select id="example-animation" name="theme" data-mangoselect-animation="scale">
	<option value="light">Light Theme</option>
	<option value="dark">Dark Theme</option>
</select>

<script>
window.mangoSelect.init({
	selector: "#example-animation",
	animation: "scale" // เอฟเฟกต์ที่รองรับ: "slide" (สไลด์), "fade" (เลือน), "scale" (ขยายตัว), "none" (ปิดอนิเมชัน)
});
</script>
```

### 11. แถบแสดงความคืบหน้าโควตาเลือกตัวเลือก (Selection Limit Progress Bar)

สำหรับกรณีใช้งานโหมดเลือกได้หลายค่า (Multiple Select) ไลบรารีจะแสดงผล **แถบระบุความคืบหน้าและจำนวนการเลือก (Status & Progress Bar)** ด้านบนของรายการตัวเลือกโดยอัตโนมัติ โดยหากมีการกำหนดจำนวนสูงสุดไว้ (`max_selected`) ระบบจะแสดงข้อความในลักษณะเศษส่วนและแถบพลังสีฟ้าที่จะยาวขึ้นตามสัดส่วนการเลือก และเปลี่ยนเป็นสีเขียวทันทีเมื่อเลือกครบโควตา:

```html
<select id="example-progress" name="interests[]" multiple
	data-mangoselect-max_selected="3">
	<option value="coding">Coding</option>
	<option value="music">Music</option>
	<option value="sports">Sports</option>
</select>

<script>
window.mangoSelect.init({ selector: "#example-progress" });
</script>
```

### 12. คำค้นหาทางเลือกซ่อน (Search Keywords / Aliases)

คุณสามารถกำหนดคำค้นหาทางเลือกซ่อน (Keywords/Aliases) บนแต่ละตัวเลือกได้ผ่านแอตทริบิวต์ `data-mangoselect-keywords` บนแท็ก `<option>` เพื่อช่วยในการค้นหาของฝั่ง Local Search:

```html
<select id="example-keywords" name="country">
	<option value="th" data-mangoselect-keywords="thailand,สยาม,bangkok">ประเทศไทย</option>
	<option value="jp" data-mangoselect-keywords="japan,โตเกียว,nippon">ญี่ปุ่น</option>
</select>
```

> [!WARNING]
> **ข้อควรระวังสำหรับโหมด AJAX**:
> ในโหมดดึงข้อมูลระยะไกล (AJAX Mode) การพิมพ์ค้นหาจะถูกส่งไปยังเซิร์ฟเวอร์โดยตรงเพื่อฟิลเตอร์ (เช่น ส่งตัวแปร Query String `search=thailand`) ดังนั้น ฐานข้อมูลหรือ API ฝั่งหลังบ้านของคุณจะต้องเป็นผู้ค้นหาคีย์เวิร์ดนั้นและส่งรายการข้อมูลกลับมา ไลบรารีจะทำการผูกคีย์เวิร์ดของแต่ละไอเท็มที่ได้รับกลับมาจาก JSON (ผ่านฟิลด์ `item.keywords`) เข้าไปใน DOM ของตัวเลือกเพื่อรองรับการค้นหาซ้ำในฝั่งเบราว์เซอร์เท่านั้น

หมายเหตุ:

- ถ้ากำหนด option เดียวกันทั้งใน JavaScript และ attribute ค่าใน JavaScript จะถูกใช้ก่อนตามลำดับ `option -> attr -> default`
- `render_option(option)` รับข้อมูลประมาณ `{ id, value, text, html, image, icon, description, disabled, selected, is_selected }`
- `render_group(group)` รับข้อมูลประมาณ `{ text, label, html, disabled, group_key, children }`
- `render_checkbox(option)` รับข้อมูลชุดเดียวกับ `render_option()` และใช้ได้กับ multiple select เท่านั้น
- ถ้า renderer คืน `Node` ไลบรารีจะ append เข้า DOM โดยตรง
- ถ้า renderer คืน string และเปิด `allow_html: true` ไลบรารีจะ render string นั้นด้วย `innerHTML`
- ถ้า renderer คืน string แต่ `allow_html: false` ไลบรารีจะ render เป็นข้อความธรรมดา
- ถ้า `render_option()` หรือ `render_group()` คืน `null`, `undefined` หรือ `false` ไลบรารีจะ fallback ไปใช้ `html` เฉพาะเมื่อ `allow_html: true` เท่านั้น ไม่เช่นนั้นจะใช้ `text`
- ถ้า `render_checkbox()` คืน `null`, `undefined` หรือ `false` ไลบรารีจะ fallback เป็น checkbox ธรรมดา
- ถ้า `option.text` หรือ `group.text` มาจากข้อมูลที่ไม่ trusted ควรใช้แบบ DOM node หรือ escape ข้อความก่อนต่อ string HTML

## Data Attributes ที่รองรับ

ตารางนี้สรุป attributes ที่ใช้บ่อย ส่วน option อื่นในตาราง `JavaScript Options` สามารถตั้งผ่าน `data-mangoselect-<option_name>` ได้ถ้าใช้ชื่อตรงกับ option

| Attribute | ใช้กับ | ความหมาย | ตัวอย่าง |
| --- | --- | --- | --- |
| `data-mangoselect-language` | Local / Ajax | กำหนดภาษาของข้อความใน component | `data-mangoselect-language="th"` |
| `data-mangoselect-placeholder` | Local / Ajax | ข้อความ placeholder | `data-mangoselect-placeholder="เลือกจังหวัด"` |
| `data-mangoselect-close` | Local / Ajax | แสดงปุ่ม Close ภายใน dropdown | `data-mangoselect-close="true"` |
| `data-mangoselect-allow_html` | Local / Ajax | อนุญาตให้ render `html` และ string HTML ที่คืนจาก renderer ด้วย `innerHTML` | `data-mangoselect-allow_html="true"` |
| `data-mangoselect-min_selected` | Multiple | จำนวนขั้นต่ำที่ต้องคงไว้ | `data-mangoselect-min_selected="1"` |
| `data-mangoselect-max_selected` | Multiple | จำนวนสูงสุดที่เลือกได้ | `data-mangoselect-max_selected="3"` |
| `data-mangoselect-animation` | Local / Ajax | เอฟเฟกต์อนิเมชันเปิด/ปิด Dropdown (`"slide"`, `"fade"`, `"scale"`, `"none"`) | `data-mangoselect-animation="scale"` |
| `data-mangoselect-url` | Ajax | URL สำหรับดึงข้อมูล remote | `data-mangoselect-url="./demo/demo-api.php?fixvar=2"` |
| `data-mangoselect-per_page` | Ajax | จำนวนรายการต่อ request | `data-mangoselect-per_page="20"` |
| `data-mangoselect-delay` | Ajax | เวลาหน่วงก่อนยิง request ตอนค้นหา หน่วยเป็นมิลลิวินาที | `data-mangoselect-delay="300"` |
| `data-mangoselect-search_length` | Ajax | จำนวนตัวอักษรขั้นต่ำที่ต้องพิมพ์ในช่องค้นหา ก่อนเริ่มส่ง Ajax request | `data-mangoselect-search_length="2"` |
| `data-mangoselect-render_option` | Local / Ajax | ชื่อ global function สำหรับ custom render option | `data-mangoselect-render_option="demoRenderOptionHtml"` |
| `data-mangoselect-render_group` | Local / Ajax Group | ชื่อ global function สำหรับ custom render group title | `data-mangoselect-render_group="demoRenderGroupHtml"` |
| `data-mangoselect-render_checkbox` | Multiple | ชื่อ global function สำหรับ custom render checkbox ต่อหนึ่ง option ถ้าไม่ตั้งค่าจะใช้ checkbox ธรรมดา | `data-mangoselect-render_checkbox="demoRenderCheckboxHtml"` |
| `data-mangoselect-param-*` | Ajax | ทุก attribute ที่ขึ้นต้นด้วย `data-mangoselect-param-` จะถูกส่งเป็น request params อัตโนมัติ | `data-mangoselect-param-branch="bkk"` |
| `data-mangoselect-image` | Option | กำหนด URL รูปภาพเพื่อใช้แสดงด้านหน้าหัวข้อตัวเลือก (และส่วนแสดงผลการเลือกของ Single Select) | `data-mangoselect-image="avatar.png"` |
| `data-mangoselect-icon` | Option | กำหนด CSS Class ของไอคอน (เช่น FontAwesome) เพื่อแสดงด้านหน้าหัวข้อตัวเลือก | `data-mangoselect-icon="fa fa-star"` |
| `data-mangoselect-inline` | Local / Ajax | เปิดใช้งาน Inline Mode แสดงผลตัวเลือกฝังบนหน้าเว็บทันที | `data-mangoselect-inline="true"` |
| `data-mangoselect-description` | Option | กำหนดข้อความคำอธิบายย่อย (Helper subtitle text) เพื่อแสดงใต้หัวข้อตัวเลือก | `data-mangoselect-description="คำอธิบายเพิ่มเติม"` |

หมายเหตุ:

- attribute สำหรับ config หลักต้องใช้ชื่อ option ตรงตัว เช่น `data-mangoselect-min_selected`, `data-mangoselect-max_selected`, `data-mangoselect-search_length`, `data-mangoselect-close`
- ลำดับการ resolve config คือ `option -> attr -> default`
- function options ที่ตั้งผ่าน attr เช่น `data-mangoselect-render_option`, `data-mangoselect-render_group` และ `data-mangoselect-render_checkbox` ต้องอ้างถึง function ที่เข้าถึงได้จาก `window`
- `data-mangoselect-ready` และ `data-mangoselect-internal-placeholder` เป็น attribute ภายในที่ไลบรารีสร้างเอง ไม่ควรตั้งเอง

## Callback และ Function Options

เวอร์ชันนี้รองรับ callback สำหรับ lifecycle ของ dropdown, การเปลี่ยนค่า และสถานะของ Ajax request รวมถึง function options สำหรับ Ajax และภาษา

| ชื่อ | ใช้ตรงไหน | อธิบาย | ตัวอย่าง |
| --- | --- | --- | --- |
| `on_open(detail)` | options หลักของ `mangoSelect.init()` | เรียกเมื่อ dropdown ถูกเปิดผ่าน trigger หรือผ่าน API | `on_open: function (detail) { console.log(detail.open_reason); }` |
| `on_close(detail)` | options หลักของ `mangoSelect.init()` | เรียกเมื่อ dropdown ถูกปิดทุกกรณี รวมถึงปิดผ่าน API, ปิดเพราะ disabled หรือถูก `destroy()` | `on_close: function (detail) { console.log(detail.close_reason); }` |
| `on_change(detail)` | options หลักของ `mangoSelect.init()` | เรียกทุกครั้งเมื่อค่ามีการเปลี่ยน | `on_change: function (detail) { console.log(detail.selected_values); }` |
| `on_change_all(detail)` | options หลักของ `mangoSelect.init()` | เรียกตอน dropdown ถูกปิดเช่นเดียวกับ `on_close` เหมาะกับกรณีที่ต้องการอ่านค่ารวมหลังปิด dropdown | `on_change_all: function (detail) { console.log(detail.close_reason, detail.selected_values); }` |
| `on_loading_start(detail)` | options หลักของ `mangoSelect.init()` | เรียกก่อนยิง request Ajax ของ instance นั้น | `on_loading_start: function (detail) { console.log(detail.request_params.search); }` |
| `on_loading_end(detail)` | options หลักของ `mangoSelect.init()` | เรียกเมื่อ request Ajax จบทั้งกรณี success และ error | `on_loading_end: function (detail) { console.log(detail.success, detail.status); }` |
| `on_error(detail)` | options หลักของ `mangoSelect.init()` | เรียกเมื่อ request Ajax ล้มเหลว, network error, HTTP status ไม่ผ่าน หรือ parse JSON ไม่ได้ | `on_error: function (detail) { console.log(detail.error_type, detail.error_message); }` |
| `render_option(option)` | options หลักของ `mangoSelect.init()` หรือ `data-mangoselect-render_option` | custom render ต่อหนึ่ง option โดยคืน `Node`, string หรือปล่อยให้ fallback ไปใช้ `html` / `text` ถ้า `allow_html: true` และคืน string จะ render เป็น HTML | `render_option: function (option) { return '<div class="item">' + option.text + '</div>'; }` |
| `render_group(group)` | options หลักของ `mangoSelect.init()` หรือ `data-mangoselect-render_group` | custom render หัวข้อ group / optgroup title โดยคืน `Node`, string หรือใช้ fallback เดิม ถ้า `allow_html: true` และคืน string จะ render เป็น HTML | `render_group: function (group) { return '<div class="group">' + group.text + '</div>'; }` |
| `render_checkbox(option)` | options หลักของ `mangoSelect.init()` หรือ `data-mangoselect-render_checkbox` | custom render checkbox ใน multiple select โดยคืน `Node` หรือ string ถ้าเปิด `allow_html: true` string จะ render เป็น HTML ถ้าไม่ตั้งค่าจะใช้ checkbox ธรรมดา | `render_checkbox: function (option) { return option.is_selected ? '<span>on</span>' : '<span>off</span>'; }` |
| `ajax.url(params)` | `ajax.url` | คำนวณ URL แบบ dynamic ก่อนยิง request | `url: function (params) { return "/api/users?branch=" + params.branch; }` |
| `ajax.data(params)` | `ajax.data` | ปรับหรือเพิ่ม params ก่อนส่ง request | `data: function (params) { params.status = "active"; return params; }` |
| `ajax.transform_request(params)` | `ajax.transform_request` | แปลงโครงสร้างพารามิเตอร์ขาเข้า หรือคืนค่า JSON string สำหรับส่ง POST JSON Body | `transform_request: function (params) { return JSON.stringify({ q: params.search }); }` |
| `ajax.process_results(payload, params)` | `ajax.process_results` | แปลง response จาก API ให้เป็นรูปแบบที่ mangoSelect ใช้ | `process_results: function (payload) { return { results: payload.items, totals: payload.total }; }` |
| `language.selected_count(args)` | custom language object | ใช้สร้างข้อความตอนเลือกหลายค่ามากกว่า `summary_limit` | `selected_count: function (args) { return "เลือกแล้ว " + args.count + " รายการ"; }` |
| `language.selected_count_limit(args)` | custom language object | ใช้สร้างข้อความแสดงจำนวนตัวเลือกที่เลือกอยู่คู่กับโควตาสูงสุด | `selected_count_limit: function (args) { return "เลือกแล้ว " + args.count + "/" + args.max + " รายการ"; }` |

### รายละเอียดของ `detail` ใน `on_change`

```js
{
	action: "select",
	changed_value: "cnx",
	changed_values: ["cnx"],
	changed_text: "เชียงใหม่",
	changed_texts: ["เชียงใหม่"],
	is_selected: true,
	last_changed_value: "cnx",
	last_changed_values: ["cnx"],
	selected_values: ["cnx"],
	selected_texts: ["เชียงใหม่"],
	is_open: false,
	is_remote: false,
	select_element: HTMLSelectElement,
	instance: mangoSelectInstance,
	raw_instance: internalInstance
}
```

ฟิลด์เพิ่มเติมของ `detail` ใน `on_change_all`:

```js
{
	action: "close",
	close_reason: "trigger" | "outside_click" | "escape" | "select" | "select_all" | "clear_all" | "ok" | "cancel" | "api" | "switch" | "disabled" | "destroy",
	opened_selected_values: ["sales"],
	opened_selected_texts: ["ฝ่ายขาย"],
	has_changed: true,
	is_open: false,
	is_remote: false,
	last_change_detail: {
		action: "select",
		selected_values: ["sales", "marketing"]
	}
}
```

ฟิลด์ที่พบได้ใน `detail` ของ `on_open`, `on_loading_start`, `on_loading_end` และ `on_error`:

```js
{
	action: "open" | "loading_start" | "loading_end" | "error",
	open_reason: "trigger" | "api",
	request_params: {
		search: "ava",
		page_num: 1,
		per_page: 10,
		option: "owner"
	},
	request_url: "./demo/demo-api.php?fixvar=2&search=ava&page_num=1&per_page=10",
	request_method: "GET",
	page_num: 1,
	should_reset: true,
	status: 200,
	success: true,
	error_type: "",
	error_message: "",
	results: [{ id: "owner-001", text: "Owner 001" }],
	totals: 120,
	has_more: true,
	selected_values: [],
	selected_texts: [],
	is_open: true,
	is_remote: true
}
```

ค่า `action` ที่พบได้บ่อย:

- `open`
- `close`
- `select`
- `unselect`
- `clear_all`
- `select_all`
- `ok`
- `add_tag`
- `api_select_value`
- `api_set_selected_values`
- `loading_start`
- `loading_end`
- `error`

## JavaScript Options ที่รองรับทั้งหมด

ตารางนี้สรุป option หลักของ `mangoSelect.init()` โดยตรง ส่วน callback และ function options ดูหัวข้อ `Callback และ Function Options`

| Option | ค่าเริ่มต้น | กำหนดแบบไหน | มีผลยังไง | ตัวอย่าง |
| --- | --- | --- | --- | --- |
| `selector` | `""` | string selector ของ `<select>` | ต้องระบุเองทุกครั้ง โดยในเอกสารนี้แนะนำให้ใช้แบบ id และถ้าต้องการ init หลายตัวจาก class ให้ใช้ `selector: ".user-picker"` โดยตรง ถ้าไม่ส่งค่า ไลบรารีจะไม่ init | `selector: "#guide-tags"` |
| `placeholder` | `""` | string | กำหนดข้อความบน trigger ก่อนมีการเลือกค่า ถ้ากำหนดทั้ง JS และ attr ค่าใน JavaScript จะถูกใช้ก่อน | `placeholder: "เลือกพนักงาน"` |
| `summary_limit` | `2` | number | ใน multiple select ถ้าเลือกเกินจำนวนนี้ trigger จะสรุปเป็นจำนวนรายการแทนการแสดงชื่อทั้งหมด | `summary_limit: 3` |
| `language` | `"en"` | string หรือ object ภาษา | เปลี่ยนข้อความใน component ทั้งระบบ เช่น placeholder, search, clear, loading และข้อความสรุป | `language: "th"` |
| `search` | `false` | boolean | เปิดหรือปิดช่องค้นหาใน dropdown ถ้าเปิด `tags` ไลบรารีจะบังคับให้มี search อัตโนมัติ | `search: true` |
| `search_length` | `null` | number | ใช้กับ Ajax เท่านั้น ถ้ากำหนด `2` จะเริ่มยิง request เมื่อพิมพ์ครบ 2 ตัวอักษร ส่วน local search จะไม่สนใจ option นี้ | `search_length: 2` |
| `select_all` | `false` | boolean | แสดงปุ่มเลือกทั้งหมดด้านล่าง dropdown ใน multiple select | `select_all: true` |
| `clear_all` | `false` | boolean | แสดงปุ่มล้างค่าทั้งหมด หรือปุ่มล้างค่าใน single select | `clear_all: true` |
| `close` | `false` | boolean | แสดงปุ่ม Close เพิ่มใน action bar ของ dropdown | `close: true` |
| `close_after_select_all` | `false` | boolean | หลังจากกด Select all และเขียนค่าลง select สำเร็จ จะสั่งปิด dropdown ให้อัตโนมัติ ถ้าเปิด `ok_cancel_in_multi` จะรอให้กด OK ก่อน | `close_after_select_all: true` |
| `close_after_clear_all` | `false` | boolean | หลังจากกด Clear all แล้วค่าถูกล้างสำเร็จ จะสั่งปิด dropdown ให้อัตโนมัติ ถ้าอยู่ใน draft mode จะรอการยืนยันก่อน | `close_after_clear_all: true` |
| `ok_cancel_in_multi` | `false` | boolean | ใช้กับ multiple select เพื่อเก็บค่าไว้ชั่วคราว และเขียนลง `<select>` จริงเมื่อกด `OK` เท่านั้น | `ok_cancel_in_multi: true` |
| `tags` | `false` | boolean | เพิ่มปุ่ม `+` ใน search box เพื่อสร้าง option ใหม่จากข้อความที่พิมพ์ ถ้าค่านั้นมีอยู่แล้วจะเลือก option เดิมแทน รองรับทั้ง local, ajax, single select และ multiple select | `tags: true` |
| `inline` | `false` | boolean | เปิดใช้งาน Inline Mode โดยฝังตัวเลือกไว้บนหน้าเว็บโดยตรง ไม่ต้องกดคลิกเปิดหรือปิด dropdown | `inline: true` |
| `animation` | `"slide"` | string | เอฟเฟกต์อนิเมชันตอนเปิดและปิด Dropdown (รองรับ `"slide"`, `"fade"`, `"scale"`, หรือ `"none"`) | `animation: "scale"` |
| `allow_html` | `false` | boolean | อนุญาตให้ render field `html` และ string HTML ที่คืนจาก renderer ด้วย `innerHTML` ถ้า `false` จะ render string จาก renderer เป็น plain text | `allow_html: true` |
| `min_selected` | `0` | number | กำหนดจำนวนขั้นต่ำที่ต้องคงไว้ใน multiple select ถ้าถึงขั้นต่ำแล้วจะยกเลิกเลือกต่อไม่ได้ | `min_selected: 1` |
| `max_selected` | `null` | number หรือ `null` | กำหนดจำนวนสูงสุดที่เลือกได้ ถ้าเลือกครบแล้ว option อื่นจะถูกปิดไม่ให้เลือกเพิ่ม | `max_selected: 3` |
| `ajax` | `null` | `true`, string URL หรือ object | เปิด remote mode โดยใช้ URL จาก attr หรือส่ง config เพิ่ม เช่น `method`, `headers`, `data`, `transform_request`, `process_results`, `search_length` รายละเอียดดูหัวข้อ Ajax Request และ Response | `ajax: true` |

## Ajax Request และ Response

เมื่อเปิด dropdown แบบ Ajax หรือค้นหา mangoSelect จะส่งพารามิเตอร์ canonical เหล่านี้:

- `search`
- `page_num`
- `per_page`

และจะส่งทุกค่าใน `data-mangoselect-param-*` เพิ่มเข้าไปด้วย

ตัวอย่างการกำหนด `ajax` แบบ object:

```js
window.mangoSelect.init({
	selector: "#employee-select",
	language: "th",
	ajax: {
		url: "/api/employee/search",
		method: "POST",
		headers: {
			"X-CSRF-TOKEN": window.csrfToken,
			"Authorization": "Bearer YOUR_TOKEN"
		},
		data: function (baseParams) {
			return {
				customer_id: 7,
				branch_code: "bkk",
				keyword: baseParams.search
			};
		},
		process_results: function (payload, params) {
			return {
				results: payload.items || [],
				totals: payload.total_rows || 0
			};
		}
	}
});
```

หมายเหตุ:

- `ajax` ใช้ได้ 3 แบบ คือ `true`, string URL และ object config
- `url` ใช้ได้ทั้ง string และ function เช่น `url: function (params) { return "/api/employee/search"; }`
- ถ้า `method` เป็น `GET` ไลบรารีจะส่งค่าเป็น query string แต่ถ้าไม่ใช่ `GET` จะส่งเป็น `application/x-www-form-urlencoded`
- `headers` กำหนดเป็น object ของ header ที่ต้องส่งเพิ่ม เช่น CSRF token หรือ Authorization
- `data` ใช้ได้ทั้ง object และ function โดยค่าที่ส่งกลับจะถูกรวมกับพารามิเตอร์หลักของไลบรารี
- `search`, `page_num` และ `per_page` เป็น canonical params ของไลบรารีและจะถูกส่งเสมอ แม้จะกำหนด `data` เพิ่มเอง
- `process_results` ใช้แปลง response จาก backend ให้กลายเป็นรูปแบบที่ mangoSelect อ่านได้ เช่น `{ results, totals }`
- `transform_request` ใช้ปรับแต่งโครงสร้างพารามิเตอร์ขาเข้าทั้งหมดก่อนส่งออก หรือคืนค่าเป็น JSON string สำหรับยิงแบบ JSON body ได้โดยตรง ร่วมกับการกำหนด `Content-Type: application/json` ใน `headers`
- ไลบรารีจะใส่ header `X-Requested-With: XMLHttpRequest` ให้อัตโนมัติทุก request

ตัวอย่าง request:

```text
GET /demo/demo-api.php?fixvar=2
	&search=ava
	&page_num=2
	&per_page=10
	&option=employee
	&customer=1
	&branch=bkk
```

รูปแบบ response ที่รองรับ:

```json
{
	"results": [
		{
			"id": "emp-001",
			"text": "EMP-001 / Ava Smith / Sales",
			"html": "<span class='user-row'><span class='user-row-label'>EMP-001 / Ava Smith / Sales</span><span class='user-badge'>2</span></span>",
			"disabled": false
		},
		{
			"text": "Marketing",
			"html": "<div class='user-group'>Marketing</div>",
			"children": [
				{
					"id": "emp-002",
					"text": "EMP-002 / Noah Johnson / Marketing"
				},
				{
					"id": "emp-003",
					"html": "<span class='user-row'><span class='user-row-label'>EMP-003 / Emma Wilson / Marketing</span><span class='user-badge'>4</span></span>"
				}
			]
		}
	],
	"totals": 120
}
```

หมายเหตุ:

- `text` ควรเป็น plain text สำหรับใช้กับ summary, search และ `get_selected_texts()`
- `html` เป็น optional field สำหรับ fallback render ใน dropdown โดยจะถูกใช้ก็ต่อเมื่อ `allow_html: true` และ renderer ไม่คืนค่า
- ถ้าส่ง `html` มาอย่างเดียวและไม่ส่ง `text` ไลบรารีจะพยายามดึง plain text จาก HTML ให้เองสำหรับ summary และค่าที่อ่านกลับ
- `children` ใช้สำหรับสร้าง optgroup ในผลลัพธ์ Ajax โดยลูกแต่ละตัวต้องมี `id` เหมือน option ปกติ
- `disabled` เป็น optional field ถ้าไม่ส่งมาจะถือเป็น `false`
- แนะนำให้ใช้ `render_option()` และ `render_group()` เมื่อต้องการ custom UI แบบปลอดภัยและยืดหยุ่นกว่า string HTML
- `allow_html` มีค่าเริ่มต้นเป็น `false` ดังนั้น field `html` จะไม่ถูก inject เข้า DOM จนกว่าจะเปิดเอง
- ถ้าเปิด `allow_html: true` ค่า `html` และ string HTML ที่คืนจาก renderer จะถูก render ผ่าน `innerHTML` จึงควรส่งมาจาก trusted source เท่านั้น

Class hooks สำหรับปุ่มที่ไลบรารีสร้างให้:

- `mangoselect-search-action-add-tag`
- `mangoselect-action-select-all`
- `mangoselect-action-clear-all`
- `mangoselect-action-close`
- `mangoselect-action-cancel`
- `mangoselect-action-ok`
- `mangoselect-checkbox`
- `mangoselect-checkbox-input`
- `mangoselect-checkbox-custom`

นอกจากนี้ mangoSelect ยังอ่าน response ได้อีกหลายรูปแบบ:

- array ตรง ๆ เช่น `[{ id: "1", text: "A" }]`
- object ที่มี `results`
- object ที่มี `data`
- จำนวนรวมใช้ได้ทั้ง `totals` หรือ `total`
- ค่าบอกหน้าถัดไปใช้ได้ทั้ง `pagination.more`, `more`, `has_more`, `next_page`, `next_page_url`

## Keyboard และ ARIA

- `ArrowDown` และ `ArrowUp` ใช้เลื่อน active option
- `Home` และ `End` ใช้กระโดดไปตัวแรกหรือตัวสุดท้าย
- `Enter` ใช้เลือก active option หรือเพิ่ม tag เมื่อเปิด `tags: true`
- `Escape` ใช้ปิด dropdown
- trigger รองรับการกด `ArrowDown` / `ArrowUp` เพื่อเปิด dropdown แล้วเริ่มนำทางทันที
- ไลบรารีจะใส่ `role="listbox"`, `role="option"`, `role="group"`, `aria-selected`, `aria-disabled`, `aria-controls`, `aria-labelledby` และ `aria-activedescendant` ให้อัตโนมัติ

## Public Instance Methods

หลังจาก `init()` แล้ว instance จะมี methods หลักดังนี้:

| Method | ใช้ทำอะไร |
| --- | --- |
| `open()` | เปิด dropdown |
| `close()` | ปิด dropdown |
| `refresh()` | render ใหม่จากข้อมูลปัจจุบัน |
| `reload()` | โหลดข้อมูล Ajax ใหม่ หรือ refresh ใหม่ถ้าเป็น local |
| `set_disabled(true/false)` | ปิดหรือเปิดทั้ง select |
| `set_option_disabled(values, true/false)` | ปิดหรือเปิด option ตาม value |
| `disable_option(values)` | ปิด option ตาม value |
| `enable_option(values)` | เปิด option ตาม value |
| `select_all()` | เลือกทั้งหมดที่เลือกได้ใน multiple select |
| `clear_all()` | ล้างค่าที่เลือก |
| `select_value(values)` | เพิ่มค่าที่เลือก หรือเลือกค่าเดียวใน single select |
| `set_selected_values(values)` | กำหนดค่าที่เลือกใหม่ทั้งหมด |
| `get_selected_values()` | อ่าน values ที่ถูกเลือก |
| `get_selected_texts()` | อ่าน texts ที่ถูกเลือก |
| `get_last_changed_value()` | อ่าน value ล่าสุดที่เปลี่ยน |
| `get_last_change_detail()` | อ่าน detail ล่าสุดของการเปลี่ยนค่า |
| `get_select_element()` | คืนค่า native `<select>` element |
| `is_disabled()` | เช็กว่า select ถูกปิดอยู่หรือไม่ |
| `is_remote()` | เช็กว่า instance นี้ใช้ Ajax หรือไม่ |
| `set_language(languageName)` | เปลี่ยนภาษาแล้ว refresh ใหม่ |
| `destroy()` | ถอด mangoSelect instance ออก, คืน native `<select>` กลับมา, ยกเลิก request/timer ของ instance และถ้าไม่มี instance เหลือจะถอด global document listeners |

ตัวอย่าง:

```html
<script>
var instance = window.mangoSelect.get_instance("#example-multiple");
console.log(instance.get_selected_values());
instance.disable_option("marketing");
instance.set_disabled(false);
instance.destroy();
</script>
```

## ภาษา

ถ้าต้องการเพิ่มภาษาเอง:

```html
<script>
window.mangoSelect.register_language("custom", {
	placeholder: "เลือกข้อมูล",
	no_option: "ไม่มีตัวเลือก",
	search_placeholder: "ค้นหา",
	no_search_result: "ไม่พบข้อมูล",
	add_tag: "+",
	select_all: "เลือกทั้งหมด",
	clear: "ล้างค่า",
	clear_all: "ล้างทั้งหมด",
	ok: "ตกลง",
	cancel: "ยกเลิก",
	loading: "กำลังโหลด...",
	error_loading: "โหลดข้อมูลไม่สำเร็จ",
	selected_count: function (args) {
		return "เลือกแล้ว " + args.count + " รายการ";
	}
});
</script>
```

## Demo

เปิดไฟล์ [`demo/index.html`](./demo/index.html) เพื่อดู:

- การติดตั้ง
- โครงสร้างไฟล์
- ตัวอย่าง local single
- ตัวอย่าง local multiple
- ตัวอย่าง select ใน Bootstrap modal
- ตัวอย่าง ajax single
- ตัวอย่าง ajax multiple
- ตัวอย่าง tags
- ตาราง `data-*`
- ตาราง callback / function options

ถ้าต้องการทดสอบ Ajax ให้เปิดผ่าน web server เช่น Laragon, Apache, Nginx หรือ PHP built-in server เพื่อให้ `demo/demo-api.php` ตอบกลับได้ตามปกติ
