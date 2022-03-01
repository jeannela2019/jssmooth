import { RGB, RGBA, blendColors } from "./common";
import { IDC_ARROW } from "./common";
import { globalFonts as fonts } from "./configure";
import { mouse } from "./mouse";

const timers = {

}

export const cPlaylistManager = {
	width: 230,
	default_topbarHeight: 30,
	topbarHeight: 30,
	default_botbarHeight: 4,
	botbarHeight: 4,
	default_scrollbarWidth: 10,
	scrollbarWidth: 10,
	default_rowHeight: 30,
	rowHeight: 30,
	blink_timer: false,
	blink_counter: -1,
	blink_id: null,
	blink_row: null,
	blink_totaltracks: 0,
	showTotalItems: window.GetProperty("_PROPERTY.PlaylistManager.ShowTotalItems", true)
};


const oPlaylist = function (idx, rowId) {
	this.idx = idx;
	this.rowId = rowId;
	this.name = plman.GetPlaylistName(idx);
	this.y = -1;
};

export const oPlaylistManager = function (name) {
	this.name = name;
	this.playlists = [];
	this.state = 0; // 0 = hidden, 1 = visible
	// metrics
	this.scroll = 0;
	this.offset = 0;
	this.w = 250;
	this.h = brw.h - 100;
	this.x = ww;
	this.y = brw.y + 50;
	this.total_playlists = null;
	this.rowTotal = -1;
	this.drop_done = false;

	this.adjustPanelHeight = function () {
		// adjust panel height to avoid blank area under last visible item in the displayed list
		var target_total_rows = Math.floor((this.default_h - cPlaylistManager.topbarHeight) / cPlaylistManager.rowHeight);
		if (this.rowTotal != -1 && this.rowTotal < target_total_rows)
			target_total_rows = this.rowTotal;
		this.h = cPlaylistManager.topbarHeight + (target_total_rows * cPlaylistManager.rowHeight);
		this.y = this.default_y + Math.floor((this.default_h - this.h) / 2);

		this.totalRows = Math.floor((this.h - cPlaylistManager.topbarHeight) / cPlaylistManager.rowHeight);
		this.max = (this.rowTotal > this.totalRows ? this.totalRows : this.rowTotal);
	};

	this.setSize = function (x, y, w, h) {
		this.default_x = x;
		this.default_y = y;
		this.default_w = w;
		this.default_h = h;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.totalRows = Math.floor((this.h - cPlaylistManager.topbarHeight) / cPlaylistManager.rowHeight);

		// adjust panel height / rowHeight + rowTotal (! refresh must have been executed once to have a valide rowTotal)
		this.adjustPanelHeight();
	};

	this.showPanel = function () {
		if (pman.offset < pman.w) {
			var delta = Math.ceil((pman.w - pman.offset) / 2);
			pman.offset += delta;
			brw.repaint();
		}
		if (pman.offset >= pman.w) {
			pman.offset = pman.w;
			window.ClearInterval(timers.showPlaylistManager);
			timers.showPlaylistManager = false;
			brw.repaint();
		}
	};

	this.hidePanel = function () {
		if (pman.offset > 0) {
			var delta = Math.ceil((pman.w - (pman.w - pman.offset)) / 2);
			pman.offset -= delta;
			brw.repaint();
		}
		if (pman.offset < 1) {
			pman.offset = 0;
			pman.state = 0;
			window.ClearInterval(timers.hidePlaylistManager);
			timers.hidePlaylistManager = false;
			brw.repaint();
		}
	};

	this.populate = function (exclude_active, reset_scroll) {
		this.playlists.splice(0, this.playlists.length);
		this.total_playlists = plman.PlaylistCount;
		var rowId = 0;
		for (var idx = 0; idx < this.total_playlists; idx++) {
			if (!plman.IsAutoPlaylist(idx)) {
				if (idx == plman.ActivePlaylist) {
					if (!exclude_active) {
						this.playlists.push(new oPlaylist(idx, rowId));
						rowId++;
					}
				} else {
					this.playlists.push(new oPlaylist(idx, rowId));
					rowId++;
				}
			}
		}
		this.rowTotal = rowId;

		// adjust panel height / rowHeight + rowTotal
		this.adjustPanelHeight();

		if (reset_scroll || this.rowTotal <= this.totalRows) {
			this.scroll = 0;
		} else {
			//check it total playlist is coherent with scroll value
			if (this.scroll > this.rowTotal - this.totalRows) {
				this.scroll = this.rowTotal - this.totalRows;
			}
		}
	};

	this.draw = function (gr) {
		if (this.offset > 0) {
			// metrics
			var cx = this.x - this.offset;
			var ch = cPlaylistManager.rowHeight;
			var cw = this.w;
			let cy, cy_, t, tw;
			var bg_margin_top = 2;
			var bg_margin_left = 6;
			var txt_margin = 10;
			var bg_color = RGB(0, 0, 0);
			var txt_color = RGB(255, 255, 255);

			// scrollbar metrics
			if (this.rowTotal > this.totalRows) {
				this.scr_y = this.y + cPlaylistManager.topbarHeight;
				this.scr_w = cPlaylistManager.scrollbarWidth;
				this.scr_h = this.h - cPlaylistManager.topbarHeight;
			} else {
				this.scr_y = 0;
				this.scr_w = 0;
				this.scr_h = 0;
			}

			// ** panel bg **
			gr.SetSmoothingMode(2);
			gr.FillRoundRect(cx, this.y, this.w + 12, this.h + cPlaylistManager.botbarHeight + 1, 10, 10, RGBA(0, 0, 0, 120));
			gr.FillRoundRect(cx, this.y, this.w + 12, this.h + cPlaylistManager.botbarHeight, 10, 10, RGBA(0, 0, 0, 150));
			gr.DrawRoundRect(cx, this.y, this.w + 12, this.h + cPlaylistManager.botbarHeight - 1, 9, 9, 1.0, RGBA(255, 255, 255, 200));
			gr.SetSmoothingMode(0);

			gr.FillSolidRect(cx + bg_margin_left, this.y + cPlaylistManager.topbarHeight - 2, this.w - bg_margin_left * 2, 1, RGBA(255, 255, 255, 40));

			// ** items **
			var rowIdx = 0;
			var totalp = this.playlists.length;
			var start_ = this.scroll;
			var end_ = this.scroll + this.totalRows;
			if (end_ > totalp)
				end_ = totalp;
			for (var i = start_; i < end_; i++) {
				cy = this.y + cPlaylistManager.topbarHeight + rowIdx * ch;
				this.playlists[i].y = cy;

				// ** item bg **
				gr.FillSolidRect(cx + bg_margin_left, cy + bg_margin_top, cw - bg_margin_left * 2 - this.scr_w, ch - bg_margin_top * 2, RGBA(0, 0, 0, 130));
				gr.DrawRect(cx + bg_margin_left, cy + bg_margin_top, cw - bg_margin_left * 2 - this.scr_w - 1, ch - bg_margin_top * 2 - 1, 1.0, RGBA(255, 255, 255, 20));

				// ** item text **
				// playlist total items
				if (cPlaylistManager.showTotalItems) {
					t = plman.PlaylistItemCount(this.playlists[i].idx);
					tw = gr.CalcTextWidth(t, fonts.items);
					gr.GdiDrawText(t, fonts.items, blendColors(txt_color, bg_color, 0.2), cx + bg_margin_left + txt_margin, cy, cw - bg_margin_left * 2 - txt_margin * 2 - this.scr_w, ch, DT_RIGHT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				} else {
					tw = 0;
				}
				// draw playlist name
				if ((this.activeIndex == i + 1 && cPlaylistManager.blink_counter < 0) || (cPlaylistManager.blink_id == i + 1 && cPlaylistManager.blink_row != 0)) {
					gr.GdiDrawText("+ " + this.playlists[i].name, fonts.bold, txt_color, cx + bg_margin_left + txt_margin, cy, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				} else {
					gr.GdiDrawText(this.playlists[i].name, fonts.items, blendColors(txt_color, bg_color, 0.2), cx + bg_margin_left + txt_margin, cy, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				}

				// draw flashing item on lbtn_up after a drag'n drop
				if (cPlaylistManager.blink_counter > -1) {
					if (cPlaylistManager.blink_row != 0) {
						if (i == cPlaylistManager.blink_id - 1) {
							if (cPlaylistManager.blink_counter <= 6 && Math.floor(cPlaylistManager.blink_counter / 2) == Math.ceil(cPlaylistManager.blink_counter / 2)) {
								gr.FillSolidRect(cx + bg_margin_left, cy + bg_margin_top, cw - bg_margin_left * 2 - this.scr_w, ch - bg_margin_top * 2, RGBA(255, 255, 255, 75));
							}
						}
					}
				}

				rowIdx++;
			}

			// top bar
			// draw flashing top bar item on lbtn_up after a drag'n drop
			if (cPlaylistManager.blink_counter > -1) {
				if (cPlaylistManager.blink_row == 0) {
					if (cPlaylistManager.blink_counter <= 6 && Math.floor(cPlaylistManager.blink_counter / 2) == Math.ceil(cPlaylistManager.blink_counter / 2)) {
						gr.GdiDrawText("+ Sent to a New Playlist", fonts.bold, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
					}
				} else {
					gr.GdiDrawText("Send to ...", fonts.items, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				}
			} else {
				if (this.activeRow == 0) {
					gr.GdiDrawText("+ Send to a New Playlist", fonts.bold, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				} else {
					gr.GdiDrawText("Send to ...", fonts.items, txt_color, cx + bg_margin_left + txt_margin, this.y, cw - bg_margin_left * 2 - txt_margin * 2 - tw - this.scr_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				}
			}

			// draw activeIndex hover frame
			if (cPlaylistManager.blink_counter > -1 && cPlaylistManager.blink_row > 0) {
				cy_ = this.y + cPlaylistManager.blink_row * ch;
				gr.DrawRect(cx + bg_margin_left + 1, cy_ + bg_margin_top + 1, cw - bg_margin_left * 2 - this.scr_w - 2, ch - bg_margin_top * 2 - 2, 2.0, RGBA(255, 255, 255, 240));
			} else {
				if (this.activeRow > 0 && this.activeIndex > 0) {
					if (cPlaylistManager.blink_counter < 0) {
						cy_ = this.y + this.activeRow * ch;
						gr.DrawRect(cx + bg_margin_left + 1, cy_ + bg_margin_top + 1, cw - bg_margin_left * 2 - this.scr_w - 2, ch - bg_margin_top * 2 - 2, 2.0, RGBA(255, 255, 255, 240));
					}
				}
			}

			// scrollbar
			if (this.scr_w > 0) {
				this.scr_cursor_h = (this.scr_h / (ch * this.rowTotal)) * this.scr_h;
				if (this.scr_cursor_h < 20)
					this.scr_cursor_h = 20;
				// set cursor y pos
				var ratio = (this.scroll * ch) / (this.rowTotal * ch - this.scr_h);
				this.scr_cursor_y = this.scr_y + Math.round((this.scr_h - this.scr_cursor_h) * ratio);

				gr.FillSolidRect(cx + cw - this.scr_w, this.scr_cursor_y, this.scr_w - 4, this.scr_cursor_h, RGBA(255, 255, 255, 100));
			}

		}
	};

	this._isHover = function (x, y) {
		return (x >= this.x - this.offset && x <= this.x - this.offset + this.w && y >= this.y && y <= this.y + this.h - 1);
	};

	this.on_mouse = function (event, x, y, delta) {
		this.ishover = this._isHover(x, y);

		switch (event) {
			case "move":
				// get active item index at x,y coords...
				this.activeIndex = -1;
				if (this.ishover) {
					this.activeRow = Math.ceil((y - this.y) / cPlaylistManager.rowHeight) - 1;
					this.activeIndex = Math.ceil((y - this.y) / cPlaylistManager.rowHeight) + this.scroll - 1;
				}
				if (this.activeIndex != this.activeIndexSaved) {
					this.activeIndexSaved = this.activeIndex;
					brw.repaint();
				}
				if (this.scr_w > 0 && x > this.x - this.offset && x <= this.x - this.offset + this.w) {
					if (y < this.y && pman.scroll > 0) {
						if (!timers.scrollPman && cPlaylistManager.blink_counter < 0) {
							timers.scrollPman = window.SetInterval(function () {
								pman.scroll--;
								if (pman.scroll < 0) {
									pman.scroll = 0;
									window.ClearInterval(timers.scrollPman);
									timers.scrollPman = false;
								} else {
									brw.repaint();
								}
							}, 100);
						}
					} else if (y > this.scr_y + this.scr_h && pman.scroll < this.rowTotal - this.totalRows) {
						if (!timers.scrollPman && cPlaylistManager.blink_counter < 0) {
							timers.scrollPman = window.SetInterval(function () {
								pman.scroll++;
								if (pman.scroll > pman.rowTotal - pman.totalRows) {
									pman.scroll = pman.rowTotal - pman.totalRows;
									window.ClearInterval(timers.scrollPman);
									timers.scrollPman = false;
								} else {
									brw.repaint();
								}
							}, 100);
						}
					} else {
						if (timers.scrollPman) {
							window.ClearInterval(timers.scrollPman);
							timers.scrollPman = false;
						}
					}
				}
				break;
			case "up":
				brw.drag_clicked = false;
				if (brw.drag_moving) {
					window.SetCursor(IDC_ARROW);
					this.drop_done = false;
					if (this.activeIndex > -1) {
						brw.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
						if (this.activeRow == 0) {
							// send to a new playlist
							this.drop_done = true;
							window.NotifyOthers("JSSmoothPlaylist->JSSmoothBrowser:avoid_on_playlist_switch_callbacks_on_sendItemToPlaylist", true);
							plman.CreatePlaylist(plman.PlaylistCount, "");
							plman.ActivePlaylist = plman.PlaylistCount - 1;
							plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, brw.metadblist_selection, false);
						} else {
							// send to selected (hover) playlist
							this.drop_done = true;
							var row_idx = this.activeIndex - 1;
							var playlist_idx = this.playlists[row_idx].idx;
							var insert_index = plman.PlaylistItemCount(playlist_idx);
							plman.InsertPlaylistItems(playlist_idx, insert_index, brw.metadblist_selection, false);
						}
						// timer to blink the playlist item where tracks have been droped!
						if (this.drop_done) {
							if (!cPlaylistManager.blink_timer) {
								cPlaylistManager.blink_x = x;
								cPlaylistManager.blink_y = y;
								cPlaylistManager.blink_totaltracks = brw.metadblist_selection.Count;
								cPlaylistManager.blink_id = this.activeIndex;
								cPlaylistManager.blink_row = this.activeRow;
								cPlaylistManager.blink_counter = 0;
								cPlaylistManager.blink_timer = window.SetInterval(function () {
									cPlaylistManager.blink_counter++;
									if (cPlaylistManager.blink_counter > 6) {
										window.ClearInterval(cPlaylistManager.blink_timer);
										cPlaylistManager.blink_timer = false;
										cPlaylistManager.blink_counter = -1;
										cPlaylistManager.blink_id = null;
										pman.drop_done = false;
										// close pman
										if (!timers.hidePlaylistManager) {
											timers.hidePlaylistManager = window.SetInterval(pman.hidePanel, 25);
										}
										brw.drag_moving = false;
									}
									brw.repaint();
								}, 150);
							}
						}
					} else {
						if (timers.showPlaylistManager) {
							window.ClearInterval(timers.showPlaylistManager);
							timers.showPlaylistManager = false;
						}
						if (!timers.hidePlaylistManager) {
							timers.hidePlaylistManager = window.SetInterval(this.hidePanel, 25);
						}
						brw.drag_moving = false;
					}
					brw.drag_moving = false;
				}
				break;
			case "right":
				brw.drag_clicked = false;
				if (brw.drag_moving) {
					if (timers.showPlaylistManager) {
						window.ClearInterval(timers.showPlaylistManager);
						timers.showPlaylistManager = false;
					}
					if (!timers.hidePlaylistManager) {
						timers.hidePlaylistManager = window.SetInterval(this.hidePanel, 25);
					}
					brw.drag_moving = false;
				}
				break;
			case "wheel":
				var scroll_prev = this.scroll;
				this.scroll -= delta;
				if (this.scroll < 0)
					this.scroll = 0;
				if (this.scroll > (this.rowTotal - this.totalRows))
					this.scroll = (this.rowTotal - this.totalRows);
				if (this.scroll != scroll_prev) {
					this.on_mouse("move", mouse.x, mouse.y);
				}
				break;
			case "leave":
				brw.drag_clicked = false;
				if (brw.drag_moving) {
					if (timers.showPlaylistManager) {
						window.ClearInterval(timers.showPlaylistManager);
						timers.showPlaylistManager = false;
					}
					if (!timers.hidePlaylistManager) {
						timers.hidePlaylistManager = window.SetInterval(this.hidePanel, 25);
					}
					brw.drag_moving = false;
				}
				break;
		}
	};
};
