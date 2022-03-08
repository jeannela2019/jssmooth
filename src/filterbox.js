import { RGB, RGBA, blendColors } from "./common";
import { button, ButtonStates } from "./common";
import { colors } from "./configure";
import { $zoom } from "./font";
import { Inputbox } from "./inputbox";

export const cFilterBox = {
	enabled: window.GetProperty("_PROPERTY: Enable Filter Box", true),
	default_w: 120,
	default_h: 20,
	x: 5,
	y: 2,
	w: 120,
	h: 20,
};

export const FilterBox = function (onFilter) {

	this.parentView = null;

	this.repaint = function () {
		this.parentView && this.parentView.repaint();
	}

	this.images = {
		magnify: null,
		resetIcon_off: null,
		resetIcon_ov: null,
	};

	this.getImages = function () {
		var gb;
		var w = $zoom(18);

		this.images.magnify = gdi.CreateImage(48, 48);
		gb = this.images.magnify.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(33, 33, 42, 42, 6.0, colors.text & 0x99ffffff);
		gb.DrawEllipse(4, 4, 32, 32, 5.0, colors.text & 0x99ffffff);
		gb.FillEllipse(12, 7, 19, 19, RGBA(250, 250, 250, 20));
		gb.SetSmoothingMode(0);
		this.images.magnify.ReleaseGraphics(gb);

		this.images.resetIcon_off = gdi.CreateImage(w, w);
		gb = this.images.resetIcon_off.GetGraphics();
		gb.SetSmoothingMode(2);
		var xpts1 = Array(6, 5, w - 5, w - 6, w - 6, w - 5, 5, 6);
		var xpts2 = Array(5, w - 6, w - 6, 5, w - 5, 6, 6, w - 5);
		gb.FillPolygon(RGB(170, 170, 170), 0, xpts1);
		gb.FillPolygon(RGB(170, 170, 170), 0, xpts2);
		gb.DrawLine(6, 6, w - 6, w - 6, 2.0, blendColors(colors.text, colors.background, 0.35));
		gb.DrawLine(6, w - 6, w - 6, 6, 2.0, blendColors(colors.text, colors.background, 0.35));
		gb.SetSmoothingMode(0);
		this.images.resetIcon_off.ReleaseGraphics(gb);

		this.images.resetIcon_ov = gdi.CreateImage(w, w);
		gb = this.images.resetIcon_ov.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(4, 4, w - 4, w - 4, 3.0, blendColors(colors.text, colors.background, 0.35));
		gb.DrawLine(4, w - 4, w - 4, 4, 3.0, blendColors(colors.text, colors.background, 0.35));
		gb.SetSmoothingMode(0);
		this.images.resetIcon_ov.ReleaseGraphics(gb);

		this.images.resetIcon_dn = gdi.CreateImage(w, w);
		gb = this.images.resetIcon_dn.GetGraphics();
		gb.SetSmoothingMode(2);
		gb.DrawLine(4, 4, w - 4, w - 4, 3.0, RGB(255, 50, 50));
		gb.DrawLine(4, w - 4, w - 4, 4, 3.0, RGB(255, 50, 50));
		gb.SetSmoothingMode(0);
		this.images.resetIcon_dn.ReleaseGraphics(gb);

		this.reset_bt = new button(
			this.images.resetIcon_off,
			this.images.resetIcon_ov,
			this.images.resetIcon_dn
		);
	};
	this.getImages();

	this.on_init = function () {
		this.inputbox = new Inputbox(
			cFilterBox.w,
			cFilterBox.h,
			"",
			"Filter",
			colors.text,
			0,
			0,
			colors.selection,
			onFilter,
			this
		);
		this.inputbox.autovalidation = true;
	};

	this.on_init();

	this.reset_colors = function () {
		this.inputbox.textcolor = colors.text;
		this.inputbox.backselectioncolor = colors.selection;
	};

	this.setSize = function (w, h, font_size) {
		this.inputbox.setSize(w, h, font_size);
		this.getImages();
	};

	this.filter_text = "";

	this.clearInputbox = function () {
		if (this.inputbox.text.length > 0) {
			this.inputbox.text = "";
			this.inputbox.offset = 0;
			this.filter_text = "";
		}
	};

	this.draw = function (gr, x, y) {
		var bx = x;
		var by = y;
		var bw = this.inputbox.w + $zoom(44);

		if (this.inputbox.edit) {
			gr.SetSmoothingMode(2);
			//gr.DrawRect(bx-3, by-1, bw+2, 21, 2.0, RGB(130,140,240));
			gr.SetSmoothingMode(0);
		}

		if (this.inputbox.text.length > 0) {
			this.reset_bt.draw(gr, bx - 1, by + 1, 255);
		} else {
			gr.DrawImage(
				this.images.magnify.Resize(cFilterBox.h - 1, cFilterBox.h - 1, 2),
				bx,
				by + 1,
				cFilterBox.h - 1,
				cFilterBox.h - 1,
				0,
				0,
				cFilterBox.h - 1,
				cFilterBox.h - 1,
				0,
				255
			);
		}
		for (var i = 0; i < cFilterBox.h - 2; i += 2) {
			gr.FillSolidRect(bx + $zoom(22) + cFilterBox.w, by + 2 + i, 1, 1, RGB(100, 100, 100));
		}
		this.inputbox.draw(gr, bx + $zoom(22), by, 0, 0);
	};

	this.on_mouse = function (event, x, y, delta) {
		switch (event) {
			case "lbtn_down":
				this.inputbox.check("down", x, y);
				if (this.inputbox.text.length > 0)
					this.reset_bt.checkstate("down", x, y);
				break;
			case "lbtn_up":
				this.inputbox.check("up", x, y);
				if (this.inputbox.text.length > 0) {
					if (this.reset_bt.checkstate("up", x, y) == ButtonStates.hover) {
						this.inputbox.text = "";
						this.inputbox.offset = 0;
						onFilter();
					}
				}
				break;
			case "lbtn_dblclk":
				this.inputbox.check("dblclk", x, y);
				break;
			case "rbtn_up":
				this.inputbox.check("right", x, y);
				break;
			case "move":
				this.inputbox.check("move", x, y);
				if (this.inputbox.text.length > 0)
					this.reset_bt.checkstate("move", x, y);
				break;
		}
	};

	this.on_key = function (event, vkey) {
		switch (event) {
			case "down":
				this.inputbox.on_key_down(vkey);
				break;
		}
	};

	this.on_char = function (code) {
		this.inputbox.on_char(code);
	};

	this.on_focus = function (is_focused) {
		this.inputbox.on_focus(is_focused);
	};
};
