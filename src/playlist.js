import { blendColors, CACHE_FOLDER, cc_stringformat, DLGC_WANTALLKEYS, drawImage, DrawPolyStar, draw_blurred_image, draw_glass_reflect, DT_CALCRECT, DT_CENTER, DT_END_ELLIPSIS, DT_LEFT, DT_NOPREFIX, DT_RIGHT, DT_VCENTER, FILE_ATTRIBUTE_DIRECTORY, FontTypeCUI, FontTypeDUI, fso, GetKeyboardMask, IDC_ARROW, IDC_HAND, IDC_HELP, KMask, lc_stringformat, match, MF_DISABLED, MF_GRAYED, MF_STRING, num, on_load, process_cachekey, process_string, resize, RGB, RGBA, TrackType, VK_BACK, VK_CONTROL, VK_DELETE, VK_DOWN, VK_END, VK_ESCAPE, VK_F2, VK_F3, VK_F5, VK_F6, VK_HOME, VK_PGDN, VK_PGUP, VK_RETURN, VK_SHIFT, VK_TAB, VK_UP } from "./common";
import { colors, ppt, timers, fonts } from "./configure";
import { registerCallback } from "./event";
import { mouse } from "./mouse";
import { cScrollBar, oScrollbar } from "./scrollbar";
import { updateColors } from "./colorscheme";
import { cPlaylistManager, oPlaylistManager } from "./playlistmgr";
import { $zoomfloor, $zoom, updateFonts } from "./font";
import { cFilterBox, oFilterBox } from "./filterbox";

const smoothPath = `${fb.ProfilePath}packages\\jssmooth\\`;
const imagePath = smoothPath + "images\\";

var need_repaint = false;

const cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	y_current: 0,
	y_prev: 0,
	y_move: 0,
	scroll_delta: 0,
	t1: null,
	timer: false,
	multiplier: 0,
	delta: 0,
};


const cColumns = {
	dateWidth: 0,
	albumArtistWidth: 0,
	titleWidth: 0,
	genreWidth: 0
};


const cover = {
	masks: window.GetProperty("_PROPERTY: Cover art masks (used for the cache)", "*front*.*;*cover*.*;*folder*.*;*.*"),
	show: window.GetProperty("_DISPLAY: Show Cover Art", true),
	column: false,
	draw_glass_reflect: false,
	glass_reflect: null,
	keepaspectratio: true,
	default_margin: 4,
	margin: 4,
	w: ppt.groupHeaderRowsNumber * ppt.rowHeight,
	max_w: ppt.groupHeaderRowsNumber * ppt.rowHeight,
	h: ppt.groupHeaderRowsNumber * ppt.rowHeight,
	max_h: ppt.groupHeaderRowsNumber * ppt.rowHeight,
	previous_max_size: -1,
	resized: false
};

const images = {
	path: imagePath,
	glass_reflect: null,
	loading_angle: 0,
	loading_draw: null,
	noart: null,
	stream: null
};

const cList = {
	search_string: "",
	incsearch_font: gdi.Font("lucida console", 9, 0),
	incsearch_font_big: gdi.Font("lucida console", 20, 1),
	inc_search_noresult: false,
	clear_incsearch_timer: false,
	incsearch_timer: false
};


function setWallpaperImg() {
	if (!fb.IsPlaying || !ppt.showwallpaper) return null;

	var tmp = null

	if (ppt.wallpapermode == 0) {
		tmp = utils.GetAlbumArtV2(fb.GetNowPlaying(), 0);
	} else {
		var arr = utils.Glob(fb.TitleFormat(ppt.wallpaperpath).Eval());
		if (arr.length) {
			tmp = gdi.Image(arr[0]);
		}
	}

	if (tmp) {
		return FormatWallpaper(tmp);
	}
	return tmp;
}


function FormatWallpaper(img) {
	if (!img || !ww || !wh)
		return img;

	var tmp_img = gdi.CreateImage(ww, wh);
	var gp = tmp_img.GetGraphics();
	gp.SetInterpolationMode(7);
	drawImage(gp, img, 0, 0, ww, wh, 1);
	tmp_img.ReleaseGraphics(gp);

	// blur it!
	if (ppt.wallpaperblurred) {
		var blur_factor = ppt.wallpaperblurvalue; // [1-90]
		tmp_img = draw_blurred_image(tmp_img, 0, 0, tmp_img.Width, tmp_img.Height, 0, 0, tmp_img.Width, tmp_img.Height, blur_factor, 0x00ffffff);
	}

	return tmp_img.CreateRawBitmap();
}

/*
===================================================================================================
Images cache
===================================================================================================
 */
function reset_cover_timers() {
	if (timers.coverDone) {
		timers.coverDone && window.ClearTimeout(timers.coverDone);
		timers.coverDone = false;
	}
}

registerCallback("on_load_image_done", function on_load_image_done(tid, image) {
	var tot = brw.groups.length;
	for (var k = 0; k < tot; k++) {
		if (brw.groups[k].metadb) {
			if (brw.groups[k].tid == tid && brw.groups[k].load_requested == 1) {
				brw.groups[k].load_requested = 2;
				brw.groups[k].cover_img = g_image_cache.getit(brw.groups[k].metadb, k, image);
				if (k < brw.groups.length && brw.groups[k].rowId >= g_start_ && brw.groups[k].rowId <= g_end_) {
					if (!timers.coverDone) {
						timers.coverDone = window.SetTimeout(function () {
							brw.repaint();
							timers.coverDone && window.ClearTimeout(timers.coverDone);
							timers.coverDone = false;
						}, 5);
					}
				}
				break;
			}
		}
	}
})

registerCallback("on_get_album_art_done", function on_get_album_art_done(metadb, art_id, image, image_path) {
	var tot = brw.groups.length;
	for (var i = 0; i < tot; i++) {
		if (brw.groups[i].metadb && brw.groups[i].metadb.Compare(metadb)) {
			brw.groups[i].cover_img = g_image_cache.getit(metadb, i, image);
			if (i < brw.groups.length && i >= g_start_ && i <= g_end_) {
				if (!timers.coverDone) {
					timers.coverDone = window.SetTimeout(function () {
						brw.repaint();
						timers.coverDone && window.ClearTimeout(timers.coverDone);
						timers.coverDone = false;
					}, 5);
				}
			}
			break;
		}
	}
})

//=================================================// Cover Tools
function load_image_from_cache2(folder, crc) {
	if (fso.FileExists(folder + crc)) { // image in folder cache
		var tdi = gdi.LoadImageAsync(window.ID, folder + crc);
		return tdi;
	} else {
		return -1;
	}
}


function save_image_to_cache(metadb, albumIndex) {
	var crc = brw.groups[albumIndex].cachekey;
	if (fso.FileExists(CACHE_FOLDER + crc))
		return;

	var path = ppt.tf_path.EvalWithMetadb(metadb);
	var path_ = getpath_(path);
	if (path_) {
		resize(path_, crc);
	}
}


const image_cache = function () {
	this._cachelist = {};
	this.hit = function (metadb, albumIndex) {
		var img = this._cachelist[brw.groups[albumIndex].cachekey];
		if (typeof (img) == "undefined" || img == null) { // if image not in cache, we load it asynchronously
			brw.groups[albumIndex].crc = check_cache2(brw.groups[albumIndex].cachekey);
			if (brw.groups[albumIndex].crc && brw.groups[albumIndex].load_requested == 0) {
				// load img from cache
				if (!timers.coverLoad) {
					timers.coverLoad = window.SetTimeout(function () {
						try {
							brw.groups[albumIndex].tid = load_image_from_cache2(CACHE_FOLDER, brw.groups[albumIndex].crc);
							brw.groups[albumIndex].load_requested = 1;
						} catch (e) { }
						timers.coverLoad && window.ClearTimeout(timers.coverLoad);
						timers.coverLoad = false;
					}, (!isScrolling && !cScrollBar.timerID ? 5 : 25));
				}
			} else if (brw.groups[albumIndex].load_requested == 0) {
				// load img default method
				if (!timers.coverLoad) {
					timers.coverLoad = window.SetTimeout(function () {
						brw.groups[albumIndex].load_requested = 1;
						utils.GetAlbumArtAsync(window.ID, metadb, 0, true, false, false);
						timers.coverLoad && window.ClearTimeout(timers.coverLoad);
						timers.coverLoad = false;
					}, (!isScrolling && !cScrollBar.timerID ? 5 : 25));
				}
			}
		}
		return img;
	};
	this.reset = function (key) {
		this._cachelist[key] = null;
	};
	this.getit = function (metadb, albumId, image) {
		var cw = cover.max_w;
		var ch = cw;
		var img = null;
		var cover_type = null;

		if (cover.keepaspectratio) {
			if (!image) {
				var pw = cw - cover.margin * 2;
				var ph = ch - cover.margin * 2;
			} else {
				if (image.Height >= image.Width) {
					var ratio = image.Width / image.Height;
					var pw = (cw - cover.margin * 2) * ratio;
					var ph = ch - cover.margin * 2;
				} else {
					var ratio = image.Height / image.Width;
					var pw = cw - cover.margin * 2;
					var ph = (ch - cover.margin * 2) * ratio;
				}
			}
		} else {
			var pw = cw - cover.margin * 2;
			var ph = ch - cover.margin * 2;
		}
		// cover.type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
		if (brw.groups[albumId].tracktype != 3) {
			if (metadb) {
				if (image) {
					img = FormatCover(image, pw, ph);
					cover_type = 1;
				} else {
					//img = FormatCover(images.noart, pw, ph, false);
					cover_type = 0;
				}
			}
		} else {
			//img = FormatNoCover(albumId, pw, ph, false, mode = 2);
			cover_type = 3;

		}
		if (cover_type == 1) {
			this._cachelist[brw.groups[albumId].cachekey] = img;
		}
		// save img to cache
		if (cover_type == 1 && !brw.groups[albumId].save_requested) {
			if (!timers.saveCover) {
				brw.groups[albumId].save_requested = true;
				save_image_to_cache(metadb, albumId);
				timers.saveCover = window.SetTimeout(function () {
					window.ClearTimeout(timers.saveCover);
					timers.saveCover = false;
				}, 50);
			}
		}

		brw.groups[albumId].cover_type = cover_type;

		return img;
	};
};

var g_image_cache = new image_cache;

function FormatCover(image, w, h) {
	if (!image || w <= 0 || h <= 0) return image;
	return image.Resize(w, h, 2);
}

function check_cache2(cachekey) {
	return fso.FileExists(CACHE_FOLDER + cachekey) ? cachekey : null;
}

function getpath_(temp) {
	var img_path = "",
		path_;
	for (var iii in cover_img) {
		path_ = utils.Glob(temp + cover_img[iii], FILE_ATTRIBUTE_DIRECTORY, 0xffffffff);
		for (var j in path_) {
			if (path_[j].toLowerCase().indexOf(".jpg") > -1 || path_[j].toLowerCase().indexOf(".png") > -1 || path_[j].toLowerCase().indexOf(".gif") > -1) {
				return path_[j];
			}
		}
	}
	return null;
}

/*
===================================================================================================
Objects
===================================================================================================
 */



const oGroup = function (index, start, handle, groupkey) {
	this.index = index;
	this.start = start;
	this.count = 1;
	this.metadb = handle;
	this.groupkey = groupkey;
	this.cachekey = process_cachekey(ppt.tf_crc.EvalWithMetadb(handle));
	//
	this.cover_img = null;
	this.cover_type = null;
	this.tracktype = TrackType(handle.RawPath.substring(0, 4));
	this.tra = [];
	this.load_requested = 0;
	this.save_requested = false;
	this.collapsed = ppt.autocollapse;

	this.finalize = function (count, tracks) {
		this.tra = tracks.slice(0);
		this.count = count;
		if (count < ppt.minimumRowsNumberPerGroup) {
			this.rowsToAdd = ppt.minimumRowsNumberPerGroup - count;
		} else {
			this.rowsToAdd = 0;
		}
		this.rowsToAdd += ppt.extraRowsNumber;

		if (this.collapsed) {
			if (brw.focusedTrackId >= this.start && brw.focusedTrackId < this.start + count) { // focused track is in this group!
				this.collapsed = false;
			}
		}
	};

};

const oBrowser = function (name) {
	this.name = name;
	this.groups = [];
	this.rows = [];
	this.SHIFT_start_id = null;
	this.SHIFT_count = 0;
	this.scrollbar = new oScrollbar(cScrollBar.themed);
	this.scrollbar.parentView = this;
	this.check_scroll = this.scrollbar.check_scroll.bind(this.scrollbar);
	this.keypressed = false;

	this.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);

	this.launch_populate = function () {
		var launch_timer = window.SetTimeout(function () {
			// populate browser with items
			brw.populate(true);
			// populate playlist popup panel list
			pman.populate(false, true);
			// kill Timeout
			launch_timer && window.ClearTimeout(launch_timer);
			launch_timer = false;
		}, 5);
	};

	this.repaint = function () {
		need_repaint = true;
	};

	this.setSize = function (x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.marginLR = 0;
		this.groupHeaderRowHeight = ppt.groupHeaderRowsNumber;
		this.totalRows = Math.ceil(this.h / ppt.rowHeight);
		this.totalRowsVis = Math.floor(this.h / ppt.rowHeight);

		if (g_first_populate_done)
			this.gettags();

		g_filterbox.setSize(cFilterBox.w, cFilterBox.h + 2, fonts.size + 2);

		this.scrollbar.setSize();

		this.scrollbar.scroll = Math.round(this.scrollbar.scroll / ppt.rowHeight) * ppt.rowHeight;
		this.scrollbar.scroll = this.check_scroll(this.scrollbar.scroll);
		this.scrollbar.scroll_ = this.scrollbar.scroll;

		// scrollbar update
		this.scrollbar.updateScrollbar();

		pman.setSize(ww, y + 50, (cPlaylistManager.width < ww ? cPlaylistManager.width : ww), h - 100);
	};

	this.collapseAll = function (bool) { // bool = true to collapse all groups otherwise expand them all
		var end = this.groups.length;
		for (let i = 0; i < end; i++) {
			this.groups[i].collapsed = bool;
		}
		this.setList(true);
		g_focus_row = this.getOffsetFocusItem(g_focus_id);
		// if focused track not totally visible, we scroll to show it centered in the panel
		if (g_focus_row < this.scrollbar.scroll / ppt.rowHeight || g_focus_row > this.scrollbar.scroll / ppt.rowHeight + brw.totalRowsVis - 1) {
			this.scrollbar.scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
			this.scrollbar.scroll = this.check_scroll(this.scrollbar.scroll);
			this.scrollbar.scroll_ = this.scrollbar.scroll;
		}
		if (this.rowsCount > 0)
			brw.gettags(true);
		this.scrollbar.updateScrollbar();
		this.repaint();
	};

	this.setList = function () {
		this.rows.splice(0, this.rows.length);
		var r = 0,
			i = 0,
			j = 0,
			m = 0,
			n = 0,
			s = 0,
			p = 0;
		var grptags = "";
		var headerTotalRows = ppt.groupHeaderRowsNumber;

		/*
		var d1 = new Date();
		var t1 = d1.getSeconds()*1000 + d1.getMilliseconds();
		*/

		var end = this.groups.length;
		for (i = 0; i < end; i++) {

			this.groups[i].load_requested = 0;

			// update total rows present before this group
			//this.groups[i].totalPreviousRows = r;

			grptags = this.groups[i].groupkey;

			s = this.groups[i].start;

			if (this.groups[i].collapsed) {
				if (ppt.showgroupheaders) {
					this.groups[i].rowId = r;
					for (let k = 0; k < headerTotalRows; k++) {
						this.rows[r] = new Object();
						this.rows[r].type = k + 1; // 1st line of group header
						this.rows[r].metadb = this.groups[i].metadb;
						this.rows[r].albumId = i;
						this.rows[r].albumTrackId = 0;
						this.rows[r].playlistTrackId = s;
						this.rows[r].groupkey = grptags;
						r++;
					}
				}
			} else {
				if (ppt.showgroupheaders) {
					this.groups[i].rowId = r;
					for (let k = 0; k < headerTotalRows; k++) {
						this.rows[r] = new Object();
						this.rows[r].type = k + 1; // 1st line of group header
						this.rows[r].metadb = this.groups[i].metadb;
						this.rows[r].albumId = i;
						this.rows[r].albumTrackId = 0;
						this.rows[r].playlistTrackId = s;
						this.rows[r].groupkey = grptags;
						r++;
					}
				}
				// tracks
				m = this.groups[i].count;
				for (j = 0; j < m; j++) {
					this.rows[r] = new Object();
					this.rows[r].type = 0; // track
					this.rows[r].metadb = this.list[s + j];
					this.rows[r].albumId = i;
					this.rows[r].albumTrackId = j;
					this.rows[r].playlistTrackId = s + j;
					this.rows[r].groupkey = grptags;
					this.rows[r].tracktype = TrackType(this.rows[r].metadb.RawPath.substring(0, 4));
					this.rows[r].rating = -1;
					r++;
				}
				// empty extra rows
				p = this.groups[i].rowsToAdd;
				for (n = 0; n < p; n++) {
					this.rows[r] = new Object();
					this.rows[r].type = 99; // extra row at bottom of the album/group
					r++;
				}
			}
		}

		this.rowsCount = r;
	};

	this.showNowPlaying = function () {
		if (fb.IsPlaying) {
			try {
				this.nowplaying = plman.GetPlayingItemLocation();
				if (this.nowplaying.IsValid) {
					if (plman.PlayingPlaylist != g_active_playlist) {
						g_active_playlist = plman.ActivePlaylist = plman.PlayingPlaylist;
					}

					// set focus on the now playing item
					g_focus_id = this.nowplaying.PlaylistItemIndex;

					g_focus_row = this.getOffsetFocusItem(g_focus_id);
					//g = this.rows[g_focus_row].albumId;
					plman.ClearPlaylistSelection(g_active_playlist);
					//if(this.groups[g].collapsed) {
					//    this.selectGroupTracks(g);
					//} else {
					plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
					//};
					plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
					this.showFocusedItem();
				}
			} catch (e) { }
		}
	};

	this.showFocusedItem = function () {
		g_focus_row = this.getOffsetFocusItem(g_focus_id);
		this.scrollbar.scroll = (g_focus_row - Math.floor(this.totalRowsVis / 2)) * ppt.rowHeight;
		this.scrollbar.scroll = this.check_scroll(this.scrollbar.scroll);
		this.scrollbar.updateScrollbar();
	};

	this.selectAtoB = function (start_id, end_id) {
		var affectedItems = Array();

		if (this.SHIFT_start_id == null) {
			this.SHIFT_start_id = start_id;
		}

		plman.ClearPlaylistSelection(g_active_playlist);

		var previous_focus_id = g_focus_id;
		var deb, fin;

		if (start_id < end_id) {
			deb = start_id;
			fin = end_id;
		} else {
			deb = end_id;
			fin = start_id;
		}

		for (var i = deb; i <= fin; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);

		plman.SetPlaylistFocusItem(g_active_playlist, end_id);

		if (affectedItems.length > 1) {
			var delta;
			if (end_id > previous_focus_id) {
				delta = end_id - previous_focus_id;
				this.SHIFT_count += delta;
			} else {
				delta = previous_focus_id - end_id;
				this.SHIFT_count -= delta;
			}
		}
	};

	this.getAlbumIdfromTrackId = function (valeur) { // fixed!
		if (valeur < 0) {
			return -1;
		} else {
			var mediane = 0;
			var deb = 0;
			var fin = this.groups.length - 1;
			while (deb <= fin) {
				mediane = Math.floor((fin + deb) / 2);
				if (valeur >= this.groups[mediane].start && valeur < this.groups[mediane].start + this.groups[mediane].count) {
					return mediane;
				} else if (valeur < this.groups[mediane].start) {
					fin = mediane - 1;
				} else {
					deb = mediane + 1;
				}
			}
			return -1;
		}
	};

	this.getOffsetFocusItem = function (fid) { // fixed!
		var row_idx = 0;
		if (fid > -1) {
			if (ppt.showgroupheaders) {
				// fid = no item dans la playlist (focus id)
				// this.rows[] => albumId
				// 1 . rech album id contenant le focus_id
				g_focus_album_id = this.getAlbumIdfromTrackId(fid);
				// 2. rech row id
				for (let i = 0; i < this.rows.length; i++) {
					if (this.rows[i].type != 0 && this.rows[i].type != 99 && this.rows[i].albumId == g_focus_album_id) {
						if (this.groups[g_focus_album_id].collapsed) {
							row_idx = i;
						} else {
							let albumTrackId = g_focus_id - this.groups[g_focus_album_id].start;
							row_idx = i + this.groupHeaderRowHeight + albumTrackId;
						}
						break;
					}
				}
			} else {
				// 1 . rech album id contenant le focus_id
				g_focus_album_id = this.getAlbumIdfromTrackId(fid);
				// 2. rech row id
				for (let i = 0; i < this.rows.length; i++) {
					if (this.rows[i].type == 0 && this.rows[i].albumId == g_focus_album_id) {
						let albumTrackId = g_focus_id - this.groups[g_focus_album_id].start;
						row_idx = i + albumTrackId;
						break;
					}
				}
			}
		}
		return row_idx;
	};

	this.init_groups = function () {
		var handle = null;
		var current = "";
		var previous = "";
		var g = 0,
			t = 0;
		var arr = [];
		var tr = [];
		var total = this.list.Count;

		if (plman.PlaylistItemCount(g_active_playlist) > 0) {
			this.focusedTrackId = plman.GetPlaylistFocusItemIndex(g_active_playlist);
		} else {
			this.focusedTrackId = -1;
		}

		var d1 = new Date();
		var t1 = d1.getSeconds() * 1000 + d1.getMilliseconds();

		this.groups.splice(0, this.groups.length);
		var tf = ppt.tf_groupkey;
		var str_filter = process_string(g_filterbox.filter_text);

		for (var i = 0; i < total; i++) {
			handle = this.list[i];
			arr = tf.EvalWithMetadb(handle).split(" ## ");
			current = arr[0].toLowerCase();
			var toAdd;
			if (str_filter.length > 0) {
				toAdd = match(arr[0] + " " + arr[1], str_filter);
			} else {
				toAdd = true;
			}
			if (toAdd) {
				if (current != previous) {
					if (g > 0) {
						// update current group
						this.groups[g - 1].finalize(t, tr);
						tr.splice(0, t);
						t = 0;
					}
					if (i < total) {
						// add new group
						tr.push(arr[1]);
						t++;
						this.groups.push(new oGroup(g, i, handle, arr[0]));
						g++;
						previous = current;
					}
				} else {
					// add track to current group
					tr.push(arr[1]);
					t++;
				}
			}
		}

		// update last group properties
		if (g > 0)
			this.groups[g - 1].finalize(t, tr);

		var d2 = new Date();
		var t2 = d2.getSeconds() * 1000 + d2.getMilliseconds();
	};

	this.populate = function (is_first_populate) {
		this.list = plman.GetPlaylistItems(g_active_playlist);
		this.init_groups();
		this.setList();
		g_focus_row = brw.getOffsetFocusItem(g_focus_id);
		if (g_focus_id < 0) { // focused item not set
			if (is_first_populate) {
				this.scrollbar.scroll = this.scrollbar.scroll_ = 0;
			}
		} else {
			if (is_first_populate) {
				// if focused track not totally visible, we scroll to show it centered in the panel
				if (g_focus_row < this.scrollbar.scroll / ppt.rowHeight || g_focus_row > this.scrollbar.scroll / ppt.rowHeight + brw.totalRowsVis - 1) {
					this.scrollbar.scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
					this.scrollbar.scroll = this.check_scroll(this.scrollbar.scroll);
					this.scrollbar.scroll_ = this.scrollbar.scroll;
				}
			}
		}

		if (brw.rowsCount > 0)
			brw.gettags(true);
		this.scrollbar.updateScrollbar();
		this.repaint();
		g_first_populate_done = true;
	};

	this.getlimits = function () {
		var start_, end_;
		if (this.rows.length <= this.totalRowsVis) {
			start_ = 0;
			end_ = this.rows.length - 1;
		} else {
			if (this.scrollbar.scroll_ < 0)
				this.scrollbar.scroll_ = this.scrollbar.scroll;
			start_ = Math.round(this.scrollbar.scroll_ / ppt.rowHeight + 0.4);
			end_ = start_ + this.totalRows + (ppt.groupHeaderRowsNumber - 1);
			// check boundaries
			start_ = start_ > 0 ? start_ - 1 : start_;
			if (start_ < 0)
				start_ = 0;
			if (end_ >= this.rows.length)
				end_ = this.rows.length - 1;
			//end_ = end_ < this.rows.length - 1  ? end_ + 1 : this.rows.length - 1;
		}
		g_start_ = start_;
		g_end_ = end_;
	};

	this.gettags = function (all) {
		var start_prev = g_start_;
		var end_prev = g_end_;

		this.getlimits();

		// force full list refresh especially when library is populating (call from 'on_item_focus_change')
		if (Math.abs(g_start_ - start_prev) > 1 || Math.abs(g_end_ - end_prev) > 1)
			all = true;

		var tf_grp = ppt.tf_groupkey;
		var tf_trk = ppt.tf_track;

		if (all) {
			for (var i = g_start_; i <= g_end_; i++) {
				switch (this.rows[i].type) {
					case this.groupHeaderRowHeight: // last group header row
						// group tags
						this.rows[i].groupkey = tf_grp.EvalWithMetadb(this.rows[i].metadb);
						// track tags
						this.rows[i].tracktags = tf_trk.EvalWithMetadb(this.rows[i].metadb);
						break;
					case 0: // track row
						// group tags
						this.rows[i].groupkey = tf_grp.EvalWithMetadb(this.rows[i].metadb);
						// track tags
						this.rows[i].tracktags = tf_trk.EvalWithMetadb(this.rows[i].metadb);
						break;
				}
			}
		} else {
			if (g_start_ < start_prev) {
				switch (this.rows[g_start_].type) {
					case this.groupHeaderRowHeight: // last group header row
						// track tags
						this.rows[g_start_].tracktags = tf_trk.EvalWithMetadb(this.rows[g_start_].metadb);
						break;
					case 0: // track row
						// track tags
						this.rows[g_start_].tracktags = tf_trk.EvalWithMetadb(this.rows[g_start_].metadb);
						break;
				}
			} else if (g_start_ > start_prev || g_end_ > end_prev) {
				switch (this.rows[g_end_].type) {
					case this.groupHeaderRowHeight: // last group header row
						// track tags
						this.rows[g_end_].tracktags = tf_trk.EvalWithMetadb(this.rows[g_end_].metadb);
						break;
					case 0: // track row
						// track tags
						this.rows[g_end_].tracktags = tf_trk.EvalWithMetadb(this.rows[g_end_].metadb);
						break;
				}
			}
		}
	};

	this.draw = function (gr) {
		var coverWidth,
			coverTop;
		var arr_g = [];
		var arr_t = [];
		var arr_e = [];

		if (this.rows.length > 0) {

			var ax = this.marginLR;
			var ay = 0;
			var aw = this.w;
			var ah = ppt.rowHeight;
			var ghrh = this.groupHeaderRowHeight;
			var g = 0;
			coverWidth = cover.max_w;

			// get Now Playing track
			if (fb.IsPlaying && plman.PlayingPlaylist == g_active_playlist) {
				this.nowplaying = plman.GetPlayingItemLocation();
			} else {
				this.nowplaying = null;
			}

			for (var i = g_start_; i <= g_end_; i++) {
				ay = Math.floor(this.y + (i * ah) - this.scrollbar.scroll_);
				this.rows[i].x = ax;
				this.rows[i].y = ay;

				switch (this.rows[i].type) {
					case ghrh: // last group header row
						if (ay > 0 - (ghrh * ah) && ay < this.h + (ghrh * ah)) {
							try {
								arr_g = this.rows[i].groupkey.split(" ^^ ");
								arr_e = this.groups[this.rows[i].albumId].tra[0].split(" ^^ ");
							} catch (e) { }

							// Now Playing Group ?
							if (this.nowplaying && this.nowplaying.PlaylistItemIndex >= this.groups[this.rows[i].albumId].start && this.nowplaying.PlaylistItemIndex < this.groups[this.rows[i].albumId].start + this.groups[this.rows[i].albumId].count) {
								var nowplaying_group = true;
							} else {
								var nowplaying_group = false;
							}

							// group id
							g = this.rows[i].albumId;

							// ================
							// group header bg
							// ================
							// if group collapsed, check if 1st track of the group is selected to highlight the group as a selected track]
							var g_selected = false;
							if (this.groups[g].collapsed) {
								var deb = this.groups[g].start;
								var fin = this.groups[g].start + this.groups[g].count;
								for (var p = deb; p < fin; p++) {
									if (plman.IsPlaylistItemSelected(g_active_playlist, p)) {
										var g_selected = true;
										break;
									}
								}
							}
							if (g_selected) {
								// var group_color_txt_normal = (ppt.enableCustomColors ? globalColors.selectedText : globalColors.background);
								var group_color_txt_normal = colors.selectedText;
								// var group_color_txt_fader = blendColors(group_color_txt_normal, globalColors.selection, 0.25);
								var group_color_txt_fader = blendColors(group_color_txt_normal, colors.selection, 0.25);
								gr.FillSolidRect(ax, ay - ((ghrh - 1) * ah), aw, ah * ghrh - 1, colors.selection & 0xb0ffffff);
							} else {
								var group_color_txt_normal = colors.text;
								var group_color_txt_fader = blendColors(colors.text, colors.background, 0.25);
								//gr.FillGradRect(ax, ay - ((ghrh - 1) * ah), aw, ah * ghrh - 1, 90, 0, globalColors.text & 0x06ffffff, 1.0);
								gr.FillSolidRect(ax, ay - ((ghrh - 1) * ah), aw, ah * ghrh - 1, colors.text & 0x05ffffff);
								gr.FillSolidRect(ax, ay - ((ghrh - 1) * ah), aw, 1, colors.text & 0x08ffffff);
							}
							// ==========
							// cover art
							// ==========
							if (ghrh > 1 && cover.show) {
								if (this.groups[g].cover_type == null) {
									if (this.groups[g].load_requested == 0) {
										this.groups[g].cover_img = g_image_cache.hit(this.rows[i].metadb, g);
									}
								} else if (this.groups[g].cover_type == 0) {
									this.groups[g].cover_img = FormatCover(images.noart, coverWidth - cover.margin * 2, coverWidth - cover.margin * 2);
								} else if (this.groups[g].cover_type == 3) {
									this.groups[g].cover_img = FormatCover(images.stream, coverWidth - cover.margin * 2, coverWidth - cover.margin * 2);
								}
								this.coverMarginLeft = cover.margin + 1;
								if (this.groups[g].cover_img != null) {
									var cv_w = this.groups[g].cover_img.Width;
									var cv_h = this.groups[g].cover_img.Height;
									var dx = (cover.max_w - cv_w) / 2;
									var dy = (cover.max_h - cv_h) / 2;
									var cv_x = Math.floor(ax + dx + 1);
									var cv_y = Math.floor(ay + dy - ((ghrh - 1) * ah));
									gr.DrawImage(this.groups[g].cover_img, cv_x, cv_y, cv_w, cv_h, 1, 1, cv_w, cv_h, 0, 255);
									gr.DrawRect(cv_x, cv_y, cv_w - 1, cv_h - 1, 1.0, colors.text & 0x25ffffff);
								} else {
									var cv_x = Math.floor(ax + cover.margin + 1);
									var cv_y = Math.floor(ay - ((ghrh - 1) * ah) + cover.margin);
									gr.DrawImage(images.loading_draw, cv_x - cover.margin, cv_y - cover.margin, images.loading_draw.Width, images.loading_draw.Height, 0, 0, images.loading_draw.Width, images.loading_draw.Height, images.loading_angle, 230);
								}
								var text_left_margin = cover.max_w;
							} else {
								var text_left_margin = 0;
							}
							// =====
							// text
							// =====
							// right area
							cColumns.dateWidth = gr.CalcTextWidth(arr_e[3], fonts.group1) + 10;
							gr.GdiDrawText(arr_e[3], fonts.group1, group_color_txt_normal, ax + aw - cColumns.dateWidth - 5, ay - ((ghrh - 1) * ah) + Math.round(ah * 1 / 3) - 2, cColumns.dateWidth, Math.round(ah * 2 / 3), DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
							cColumns.genreWidth = gr.CalcTextWidth(arr_e[2], fonts.group2) + 10;
							gr.GdiDrawText(arr_e[2], fonts.group2, group_color_txt_fader, ax + aw - cColumns.genreWidth - 5, ay - ((ghrh - 2) * ah), cColumns.genreWidth, Math.round(ah * 2 / 3), DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
							// left area
							if (arr_g[1] == "?") {
								if (this.groups[g].count > 1) {
									var album_name = "(Singles)"
								} else {
									var arr_tmp = this.groups[g].tra[0].split(" ^^ ");
									var album_name = "(Single) " + arr_tmp[1];
								}
							} else {
								var album_name = arr_g[1];
							}
							gr.GdiDrawText(arr_g[0].toUpperCase(), fonts.group1, group_color_txt_fader, ax + text_left_margin + 5, ay - ((ghrh - 1) * ah) + Math.round(ah * 1 / 3) - 2, aw - text_left_margin - cColumns.dateWidth - 10, Math.round(ah * 2 / 3), DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
							gr.GdiDrawText(album_name, fonts.group2, group_color_txt_normal, ax + text_left_margin + 25, ay - ((ghrh - 2) * ah), aw - text_left_margin - cColumns.genreWidth - 30, Math.round(ah * 2 / 3), DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
							if (nowplaying_group) {
								gr.GdiDrawText(">", fonts.group2, group_color_txt_normal, ax + text_left_margin + 5, ay - ((ghrh - 2) * ah), 20, Math.round(ah * 2 / 3), DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
							}
						}
						break;
					case 0: // track row
						if (ay > this.y - ppt.headerBarHeight - ah && ay < this.y + this.h) {
							try {
								arr_t = this.rows[i].tracktags.split(" ^^ ");
								arr_g = this.rows[i].groupkey.split(" ^^ ");
								arr_e = this.groups[this.rows[i].albumId].tra[this.rows[i].albumTrackId].split(" ^^ ");

							} catch (e) { }

							// =========
							// track bg
							// =========
							var track_color_txt = colors.text;
							var track_artist_color_text = blendColors(track_color_txt, colors.background, 0.25);
							var track_color_rating = blendColors(track_color_txt, colors.background, 0.2);

							// selected track bg
							var t_selected = (plman.IsPlaylistItemSelected(g_active_playlist, this.rows[i].playlistTrackId));
							if (t_selected) {
								track_color_txt = (ppt.enableCustomColors ? colors.selectedText : colors.background);
								track_artist_color_text = blendColors(track_color_txt, colors.selection, 0.25);
								track_color_rating = blendColors(track_color_txt, colors.selection, 0.2);
								gr.FillSolidRect(ax, ay, aw, ah, colors.selection & 0xb0ffffff);
								// default track bg (odd/even)
								if (ppt.showgroupheaders) {
									if (this.rows[i].albumTrackId % 2 == 0) {
										gr.FillSolidRect(ax, ay, aw, ah, RGBA(255, 255, 255, 5));
									} else {
										gr.FillSolidRect(ax, ay, aw, ah, RGBA(0, 0, 0, 5));
									}
								} else {
									if (this.rows[i].playlistTrackId % 2 == 0) {
										gr.FillSolidRect(ax, ay, aw, ah, RGBA(255, 255, 255, 5));
									} else {
										gr.FillSolidRect(ax, ay, aw, ah, RGBA(0, 0, 0, 5));
									}
								}
							} else {
								// default track bg (odd/even)
								if (ppt.showgroupheaders) {
									if (this.rows[i].albumTrackId % 2 != 0) {
										gr.FillSolidRect(ax, ay, aw, ah, colors.text & 0x05ffffff);
									}
								} else {
									if (this.rows[i].playlistTrackId % 2 != 0) {
										gr.FillSolidRect(ax, ay, aw, ah, colors.text & 0x05ffffff);
									}
								}
							}
							// focused track bg
							if (this.rows[i].playlistTrackId == g_focus_id) {
								gr.DrawRect(ax + 1, ay + 1, aw - 2, ah - 2, 2.0, colors.selection & 0xd0ffffff);
							}

							// =====
							// text
							// =====
							if (ay >= (0 - ah) && ay < this.y + this.h) {

								var track_type = this.groups[this.rows[i].albumId].tracktype;

								var nbc = this.groups[this.rows[i].albumId].count.toString().length;
								if (nbc == 1)
									nbc++;

								// fields
								var track_num = arr_t[0] == "?" ? this.rows[i].albumTrackId + 1 : arr_t[0];
								var track_num_part = num(track_num, nbc) + "    ";
								if (ppt.showArtistAlways || !ppt.showgroupheaders || arr_e[0].toLowerCase() != arr_g[0].toLowerCase() || ppt.doubleRowText) {
									var track_artist_part = arr_e[0];
								} else {
									var track_artist_part = "";
								}
								var track_title_part = arr_e[1];
								var track_time_part = arr_t[1];
								// rating tag fixing & formatting
								if (this.rows[i].rating == -1) {
									if (isNaN(arr_t[2])) {
										var track_rating_part = 0;
									} else if (Math.abs(arr_t[2]) > 0 && Math.abs(arr_t[2]) < 6) {
										var track_rating_part = Math.abs(arr_t[2]);
									} else {
										var track_rating_part = 0;
									}
									this.rows[i].rating = track_rating_part;
								} else {
									track_rating_part = this.rows[i].rating;
								}

								if (ppt.showRating && track_type != 3) {
									if (g_font_guifx_found) {
										cColumns.track_rating_part = gr.CalcTextWidth("bbbbb", fonts.rating);
									} else if (g_font_wingdings2_found) {
										cColumns.track_rating_part = gr.CalcTextWidth(String.fromCharCode(234).repeat(5), fonts.rating);
									} else {
										cColumns.track_rating_part = gr.CalcTextWidth(String.fromCharCode(0x25CF).repeat(5), fonts.rating);
									}
								} else {
									cColumns.track_rating_part = 0;
								}

								gr.SetTextRenderingHint(4);

								//
								if (ppt.doubleRowText) {
									var ay_1 = ay + 2;
									var ah_1 = Math.floor(ah / 2);
									var ay_2 = ay + ah_1 - 2;
									var ah_2 = ah - Math.floor(ah / 2);
									if (this.nowplaying && this.rows[i].playlistTrackId == this.nowplaying.PlaylistItemIndex) { // now playing track
										this.nowplaying_y = ay;
										if (!g_time_remaining) {
											g_time_remaining = ppt.tf_time_remaining.Eval(true);
										}
										track_time_part = g_time_remaining;
										//
										cColumns.track_num_part = gr.CalcTextWidth(track_num_part, fonts.items) + 10;
										cColumns.track_artist_part = track_artist_part.length > 0 ? gr.CalcTextWidth(track_artist_part, fonts.items) + 0 : 0;
										cColumns.track_title_part = gr.CalcTextWidth(track_title_part, fonts.items) + 10;
										cColumns.track_time_part = gr.CalcTextWidth("00:00:00", fonts.items) + 10;
										var tx = ax + cColumns.track_num_part;
										var tw = aw - cColumns.track_num_part;
										if (track_time_part == "ON AIR") {
											gr.GdiDrawText(g_radio_title, fonts.items, track_color_txt, tx + 10, ay_1, tw - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah_1, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
											gr.GdiDrawText(g_radio_artist, fonts.items, track_artist_color_text, tx + 10, ay_2, tw - cColumns.track_time_part - 15, ah_2, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										} else {
											gr.GdiDrawText(track_title_part, fonts.items, track_color_txt, tx + 10, ay_1, tw - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah_1, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
											gr.GdiDrawText(track_artist_part, fonts.items, track_artist_color_text, tx + 10, ay_2, tw - cColumns.track_time_part - 15, ah_2, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										}
										gr.GdiDrawText(track_time_part, fonts.items, track_color_txt, tx + tw - cColumns.track_time_part - 5, ay_1, cColumns.track_time_part, ah_1, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										if (g_seconds == 0 || g_seconds / 2 == Math.floor(g_seconds / 2)) {
											gr.DrawImage(images.play_on.Resize(ppt.rowHeight, ppt.rowHeight, 2), ax + 2, ay, ppt.rowHeight, ppt.rowHeight, 0, 0, ppt.rowHeight, ppt.rowHeight, 0, 255);
										} else {
											gr.DrawImage(images.play_off.Resize(ppt.rowHeight, ppt.rowHeight, 2), ax + 2, ay, ppt.rowHeight, ppt.rowHeight, 0, 0, ppt.rowHeight, ppt.rowHeight, 0, 255);
										}
										// rating Stars
										if (ppt.showRating && track_type != 3) {
											if (g_font_guifx_found) {
												gr.DrawString("b".repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
												gr.DrawString("b".repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
											} else if (g_font_wingdings2_found) {
												gr.DrawString(String.fromCharCode(234).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
												gr.DrawString(String.fromCharCode(234).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
											} else {
												gr.DrawString(String.fromCharCode(0x25CF).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
												gr.DrawString(String.fromCharCode(0x25CF).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
											}
										}
									} else {
										cColumns.track_num_part = gr.CalcTextWidth(track_num_part, fonts.items) + 10;
										cColumns.track_artist_part = track_artist_part.length > 0 ? gr.CalcTextWidth(track_artist_part, fonts.items) : 0;
										cColumns.track_title_part = gr.CalcTextWidth(track_title_part, fonts.items) + 10;
										cColumns.track_time_part = gr.CalcTextWidth("00:00:00", fonts.items) + 10;
										var tx = ax + cColumns.track_num_part;
										var tw = aw - cColumns.track_num_part;
										gr.GdiDrawText(track_num_part, fonts.items, track_color_txt, ax + 10, ay_1, cColumns.track_num_part, ah_1, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										gr.GdiDrawText(track_artist_part, fonts.items, track_artist_color_text, tx + 10, ay_2, tw - cColumns.track_time_part - 15, ah_2, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										gr.GdiDrawText(track_title_part, fonts.items, track_color_txt, tx + 10, ay_1, tw - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah_1, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										gr.GdiDrawText(track_time_part, fonts.items, track_color_txt, tx + tw - cColumns.track_time_part - 5, ay_1, cColumns.track_time_part, ah_1, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										// rating Stars
										if (ppt.showRating && track_type != 3) {
											if (g_font_guifx_found) {
												gr.DrawString("b".repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
												gr.DrawString("b".repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
											} else if (g_font_wingdings2_found) {
												gr.DrawString(String.fromCharCode(234).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
												gr.DrawString(String.fromCharCode(234).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
											} else {
												gr.DrawString(String.fromCharCode(0x25CF).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
												gr.DrawString(String.fromCharCode(0x25CF).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay_1, cColumns.track_rating_part + 10, ah_1, lc_stringformat);
											}
										}
									}
								} else {
									if (track_artist_part.length > 0) {
										track_artist_part = track_artist_part + " - ";
									}
									// calc text part width + dtaw text
									if (this.nowplaying && this.rows[i].playlistTrackId == this.nowplaying.PlaylistItemIndex) { // now playing track
										this.nowplaying_y = ay;
										if (!g_time_remaining) {
											g_time_remaining = ppt.tf_time_remaining.Eval(true);
										}
										track_time_part = g_time_remaining;
										//
										if (track_time_part == "ON AIR") {
											if (g_radio_artist.length > 0) {
												g_radio_artist = g_radio_artist + " - ";
											}
										}
										//
										cColumns.track_num_part = gr.CalcTextWidth(track_num_part, fonts.items) + 10;
										cColumns.track_title_part = gr.CalcTextWidth(track_title_part, fonts.items) + 10;
										cColumns.track_time_part = gr.CalcTextWidth("00:00:00", fonts.items) + 10;
										if (track_time_part == "ON AIR") {
											cColumns.track_artist_part = g_radio_artist.length > 0 ? gr.CalcTextWidth(g_radio_artist, fonts.items) : 0;
										} else {
											cColumns.track_artist_part = track_artist_part.length > 0 ? gr.CalcTextWidth(track_artist_part, fonts.items) : 0;
										}
										var tx = ax + cColumns.track_num_part;
										var tw = aw - cColumns.track_num_part;
										if (cColumns.track_artist_part > 0) {
											if (track_time_part == "ON AIR") {
												gr.GdiDrawText(g_radio_artist, fonts.items, track_artist_color_text, tx + 10, ay, tw - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
											} else {
												gr.GdiDrawText(track_artist_part, fonts.items, track_artist_color_text, tx + 10, ay, tw - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
											}
										}
										if (track_time_part == "ON AIR") {
											gr.GdiDrawText(g_radio_title, fonts.items, track_color_txt, tx + cColumns.track_artist_part + 10, ay, tw - cColumns.track_artist_part - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										} else {
											gr.GdiDrawText(track_title_part, fonts.items, track_color_txt, tx + cColumns.track_artist_part + 10, ay, tw - cColumns.track_artist_part - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										}
										gr.GdiDrawText(track_time_part, fonts.items, track_color_txt, tx + tw - cColumns.track_time_part - 5, ay, cColumns.track_time_part, ah, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										if (g_seconds == 0 || g_seconds / 2 == Math.floor(g_seconds / 2)) {
											gr.DrawImage(images.play_on.Resize(ppt.rowHeight, ppt.rowHeight, 2), ax + 5, ay, ppt.rowHeight, ppt.rowHeight, 0, 0, ppt.rowHeight, ppt.rowHeight, 0, 255);
										} else {
											gr.DrawImage(images.play_off.Resize(ppt.rowHeight, ppt.rowHeight, 2), ax + 5, ay, ppt.rowHeight, ppt.rowHeight, 0, 0, ppt.rowHeight, ppt.rowHeight, 0, 255);
										}
										// rating Stars
										if (ppt.showRating && track_type != 3) {
											if (g_font_guifx_found) {
												gr.DrawString("b".repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
												gr.DrawString("b".repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
											} else if (g_font_wingdings2_found) {
												gr.DrawString(String.fromCharCode(234).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
												gr.DrawString(String.fromCharCode(234).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
											} else {
												gr.DrawString(String.fromCharCode(0x25CF).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
												gr.DrawString(String.fromCharCode(0x25CF).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
											}
										}
									} else { // default track
										cColumns.track_num_part = gr.CalcTextWidth(track_num_part, fonts.items) + 10;
										cColumns.track_artist_part = track_artist_part.length > 0 ? gr.CalcTextWidth(track_artist_part, fonts.items) + 0 : 0;
										cColumns.track_title_part = gr.CalcTextWidth(track_title_part, fonts.items) + 10;
										cColumns.track_time_part = gr.CalcTextWidth("00:00:00", fonts.items) + 10;
										var tx = ax + cColumns.track_num_part;
										var tw = aw - cColumns.track_num_part;
										gr.GdiDrawText(track_num_part, fonts.items, track_color_txt, ax + 10, ay, cColumns.track_num_part, ah, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										if (cColumns.track_artist_part > 0) {
											gr.GdiDrawText(track_artist_part, fonts.items, track_artist_color_text, tx + 10, ay, tw - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										}
										gr.GdiDrawText(track_title_part, fonts.items, track_color_txt, tx + cColumns.track_artist_part + 10, ay, tw - cColumns.track_artist_part - cColumns.track_time_part - 15 - (cColumns.track_rating_part + 10), ah, DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										gr.GdiDrawText(track_time_part, fonts.items, track_color_txt, tx + tw - cColumns.track_time_part - 5, ay, cColumns.track_time_part, ah, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_END_ELLIPSIS | DT_NOPREFIX);
										// rating Stars
										if (ppt.showRating && track_type != 3) {
											if (g_font_guifx_found) {
												gr.DrawString("b".repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
												gr.DrawString("b".repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
											} else if (g_font_wingdings2_found) {
												gr.DrawString(String.fromCharCode(234).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
												gr.DrawString(String.fromCharCode(234).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
											} else {
												gr.DrawString(String.fromCharCode(0x25CF).repeat(5), fonts.rating, track_color_txt & 0x15ffffff, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
												gr.DrawString(String.fromCharCode(0x25CF).repeat(track_rating_part), fonts.rating, track_color_rating, tx + tw - cColumns.track_time_part - (cColumns.track_rating_part + 10), ay, cColumns.track_rating_part + 10, ah, lc_stringformat);
											}
										}
									}
								}
							}
						}
						break;
					case 99: // extra bottom row
						if (ay > -1 && ay < this.h) {
							if (this.rows[i].albumTrackId % 2 == 0) {
								gr.FillSolidRect(ax, ay, aw, ah, RGBA(255, 255, 255, 3));
							} else {
								gr.FillSolidRect(ax, ay, aw, ah, RGBA(0, 0, 0, 3));
							}
						}
						break;
				}

			}
			// draw scrollbar
			if (cScrollBar.enabled) {
				brw.scrollbar && brw.scrollbar.draw(gr);
			}

			// Incremental Search Display
			if (cList.search_string.length > 0) {
				gr.SetSmoothingMode(2);
				brw.tt_x = Math.floor(((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2));
				brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
				brw.tt_w = Math.round((cList.search_string.length * 13) + (10 * 2));
				brw.tt_h = 60;
				gr.FillRoundRect(brw.tt_x, brw.tt_y, brw.tt_w, brw.tt_h, 5, 5, RGBA(0, 0, 0, 150));
				gr.DrawRoundRect(brw.tt_x, brw.tt_y, brw.tt_w, brw.tt_h, 5, 5, 1.0, RGBA(0, 0, 0, 100));
				gr.DrawRoundRect(brw.tt_x + 1, brw.tt_y + 1, brw.tt_w - 2, brw.tt_h - 2, 4, 4, 1.0, RGBA(255, 255, 255, 40));
				try {
					gr.GdiDrawText(cList.search_string, cList.incsearch_font_big, RGB(0, 0, 0), brw.tt_x + 1, brw.tt_y + 1, brw.tt_w, brw.tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
					gr.GdiDrawText(cList.search_string, cList.incsearch_font_big, cList.inc_search_noresult ? RGB(255, 70, 70) : RGB(250, 250, 250), brw.tt_x, brw.tt_y, brw.tt_w, brw.tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
				} catch (e) { }
			}

		} else { // no track, playlist is empty

			// draw scrollbar
			if (cScrollBar.enabled) {
				brw.scrollbar && brw.scrollbar.draw(gr);
			}
		}

		// draw header
		if (ppt.showHeaderBar) {
			//var boxText = "  "+this.groups.length+" album"+(this.groups.length>1?"s  ":"  ");
			var boxText = (plman.PlaylistCount > 0 ? plman.GetPlaylistName(plman.ActivePlaylist) + "  " : "no playlist  ");
			// draw background part above playlist (headerbar)
			if (fb.IsPlaying && g_wallpaperImg && ppt.showwallpaper) {
				gr.GdiDrawBitmap(g_wallpaperImg, 0, 0, ww, brw.y - 1, 0, 0, g_wallpaperImg.Width, brw.y - 1);
				gr.FillSolidRect(0, 0, ww, brw.y - 1, colors.background & RGBA(255, 255, 255, ppt.wallpaperalpha));
			} else {
				if (g_wallpaperImg && ppt.showwallpaper) {
					gr.GdiDrawBitmap(g_wallpaperImg, 0, 0, ww, brw.y - 1, 0, 0, g_wallpaperImg.Width, brw.y - 1);
					gr.FillSolidRect(0, 0, ww, brw.y - 1, colors.background & RGBA(255, 255, 255, ppt.wallpaperalpha));
				} else {
					gr.FillSolidRect(0, 0, ww, brw.y - 1, colors.background);
				}
			}
			gr.FillSolidRect(this.x, 0, this.w + (cScrollBar.enabled ? cScrollBar.width : 0), ppt.headerBarHeight - 1, colors.background & 0x20ffffff);
			gr.FillSolidRect(this.x, ppt.headerBarHeight - 2, this.w + (cScrollBar.enabled ? cScrollBar.width : 0), 1, colors.text & 0x22ffffff);

			var tx = cFilterBox.x + cFilterBox.w + $zoom(22) + 5;
			var tw = this.w - tx + (cScrollBar.enabled ? cScrollBar.width : 0);
			try {
				gr.GdiDrawText(boxText, fonts.box, blendColors(colors.text, colors.background, 0.4), tx, 0, tw, ppt.headerBarHeight - 1, DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
			} catch (e) {
				console.log(">> debug: cScrollBar.width=" + cScrollBar.width + " /boxText=" + boxText + " /ppt.headerBarHeight=" + ppt.headerBarHeight + " /g_fsize=" + fonts.size);
			}
		}
	};

	this.selectGroupTracks = function (aId) { // fixed!
		var affectedItems = [];
		var end = this.groups[aId].start + this.groups[aId].count;
		for (var i = this.groups[aId].start; i < end; i++) {
			affectedItems.push(i);
		}
		plman.SetPlaylistSelection(g_active_playlist, affectedItems, true);
	};

	this._isHover = function (x, y) {
		return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h);
	};

	this.dragndrop_check = function (x, y, rowId) {
		if (this.activeRow > -1 && rowId == this.activeRow) {
			// g_dragndrop_trackId = this.rows[rowId].playlistTrackId;
		}
	};

	this.on_mouse = function (event, x, y) {
		this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);

		// get hover row index (mouse cursor hover)
		if (y > this.y && y < this.y + this.h) {
			this.activeRow = Math.ceil((y + this.scrollbar.scroll_ - this.y) / ppt.rowHeight - 1);
			if (this.activeRow >= this.rows.length)
				this.activeRow = -1;
		} else {
			this.activeRow = -1;
		}

		// rating check
		this.ishover_rating_prev = this.ishover_rating;
		if (this.activeRow > -1) {
			var rating_x = this.x + this.w - cColumns.track_time_part - (cColumns.track_rating_part + 10);
			var rating_y = Math.floor(this.y + (this.activeRow * ppt.rowHeight) - this.scrollbar.scroll_);
			if (ppt.showRating) {
				this.ishover_rating = (this.rows[this.activeRow].type == 0 && x >= rating_x && x <= rating_x + cColumns.track_rating_part && y >= rating_y && y <= rating_y + ppt.rowHeight);
			} else {
				this.ishover_rating = false;
			}
		} else {
			this.ishover_rating = false;
		}

		switch (event) {
			case "down":
				this.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
				if (!cTouch.down && !timers.mouseDown && this.ishover && this.activeRow > -1 && Math.abs(this.scrollbar.scroll - this.scrollbar.scroll_) < 2) {
					var rowType = this.rows[this.activeRow].type;
					//
					this.drag_clicked = true;
					this.drag_clicked_x = x;
					//
					switch (true) {
						case (rowType > 0 && rowType < 99): // ----------------> group header row
							var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
							if (utils.IsKeyPressed(VK_SHIFT)) {
								if (g_focus_id != playlistTrackId) {
									if (this.SHIFT_start_id != null) {
										this.selectAtoB(this.SHIFT_start_id, playlistTrackId);
									} else {
										this.selectAtoB(g_focus_id, playlistTrackId);
									}
								}
							} else if (utils.IsKeyPressed(VK_CONTROL)) {
								this.selectGroupTracks(this.rows[this.activeRow].albumId);
								this.SHIFT_start_id = null;
							} else {
								plman.ClearPlaylistSelection(g_active_playlist);
								if (!(ppt.autocollapse && this.groups[this.rows[this.activeRow].albumId].collapsed)) {
									this.selectGroupTracks(this.rows[this.activeRow].albumId);
								}
								this.SHIFT_start_id = null;
							}
							plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
							break;
						case (rowType == 0): // ----------------> track row
							var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
							if (utils.IsKeyPressed(VK_SHIFT)) {
								if (g_focus_id != playlistTrackId) {
									if (this.SHIFT_start_id != null) {
										this.selectAtoB(this.SHIFT_start_id, playlistTrackId);
									} else {
										this.selectAtoB(g_focus_id, playlistTrackId);
									}
								}
							} else if (utils.IsKeyPressed(VK_CONTROL)) {
								if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
									plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, false);
								} else {
									plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
									plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
								}
								this.SHIFT_start_id = null;
							} else {
								// check if rating to update ?
								if (this.ishover_rating) {
									// calc new rating
									var l_rating = Math.ceil((x - rating_x) / (cColumns.track_rating_part / 5) + 0.1);
									if (l_rating > 5)
										l_rating = 5;
									// update if new rating <> current track rating
									if (this.rows[this.activeRow].tracktype < 2) {
										g_rating_updated = true;
										g_rating_rowId = this.activeRow;
										if (foo_playcount) {
											// Rate to database statistics brought by foo_playcount.dll
											if (l_rating != this.rows[this.activeRow].rating) {
												if (this.rows[this.activeRow].metadb) {
													this.rows[this.activeRow].rating = l_rating;
													window.Repaint();
													fb.RunContextCommandWithMetadb("Playback Statistics/Rating/" + ((l_rating == 0) ? "<not set>" : l_rating), this.rows[this.activeRow].metadb);
												}
											} else {
												this.rows[this.activeRow].rating = 0;
												window.Repaint();
												fb.RunContextCommandWithMetadb("Playback Statistics/Rating/<not set>", this.rows[this.activeRow].metadb);
											}
										} else {
											var handles = new FbMetadbHandleList(this.rows[this.activeRow].metadb);
											// Rate to file
											if (l_rating != this.rows[this.activeRow].rating) {
												this.rows[this.activeRow].rating = l_rating;
												window.Repaint();
												handles.UpdateFileInfoFromJSON(JSON.stringify({ "RATING": l_rating }));
											} else {
												this.rows[this.activeRow].rating = 0;
												window.Repaint();
												handles.UpdateFileInfoFromJSON(JSON.stringify({ "RATING": "" }));
											}
										}
									}
								} else {
									if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
										if (this.metadblist_selection.Count > 1) {
											//plman.ClearPlaylistSelection(g_active_playlist);
											//plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
											//plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
										} else {
											// nothing, single track already selected
										}
									} else {
										plman.ClearPlaylistSelection(g_active_playlist);
										plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
										plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
									}
									this.SHIFT_start_id = null;
								}
							}
							break;
						case (rowType == 99): // ----------------> extra empty row

							break;
					}
					this.repaint();
				} else {
					// scrollbar
					if (cScrollBar.enabled && cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					}
				}
				break;
			case "up":
				this.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
				if (this.drag_clicked && this.activeRow > -1) {
					var rowType = this.rows[this.activeRow].type;
					//
					switch (true) {
						case (rowType > 0 && rowType < 99): // ----------------> group header row
							//var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
							break;
						case (rowType == 0): // ----------------> track row
							var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
							if (!utils.IsKeyPressed(VK_SHIFT) && !utils.IsKeyPressed(VK_CONTROL)) {
								if (plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
									if (this.metadblist_selection.Count > 1) {
										plman.ClearPlaylistSelection(g_active_playlist);
										plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
										plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
									}
								}
							}
							break;
						case (rowType == 99): // ----------------> extra empty row

							break;
					}
					this.repaint();
				}

				this.drag_clicked = false;
				// scrollbar
				if (cScrollBar.enabled && cScrollBar.visible) {
					brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
				}
				break;
			case "dblclk":
				if (this.ishover && this.activeRow > -1 && Math.abs(this.scrollbar.scroll - this.scrollbar.scroll_) < 2) {
					var rowType = this.rows[this.activeRow].type;
					switch (true) {
						case (rowType > 0 && rowType < 99): // group header
							this.groups[this.rows[this.activeRow].albumId].collapsed = !this.groups[this.rows[this.activeRow].albumId].collapsed;
							this.setList(true);
							///*
							g_focus_row = this.getOffsetFocusItem(g_focus_id);
							// if focused track not totally visible, we scroll to show it centered in the panel
							if (g_focus_row < this.scrollbar.scroll / ppt.rowHeight || g_focus_row > this.scrollbar.scroll / ppt.rowHeight + brw.totalRowsVis - 1) {
								this.scrollbar.scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
								this.scrollbar.scroll = this.check_scroll(this.scrollbar.scroll);
								this.scrollbar.scroll_ = this.scrollbar.scroll;
							}
							//*/
							if (this.rowsCount > 0)
								brw.gettags(true);
							this.scrollbar.updateScrollbar();
							brw.repaint();
							break;
						case (rowType == 0): // track
							plman.ExecutePlaylistDefaultAction(g_active_playlist, this.rows[this.activeRow].playlistTrackId);
							break;
						case (rowType == 99): // extra empty row

							break;
					}
					this.repaint();
				} else {
					// scrollbar
					if (cScrollBar.enabled && cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					}
				}
				break;
			case "move":
				if (g_lbtn_click && this.drag_clicked && !this.drag_moving) {
					if (x - this.drag_clicked_x > 30 && this.h > cPlaylistManager.rowHeight * 6) {
						this.drag_moving = true;
						window.SetCursor(IDC_HELP);
						pman.state = 1;
						if (timers.hidePlaylistManager) {
							window.ClearInterval(timers.hidePlaylistManager);
							timers.hidePlaylistManager = false;
						}
						if (!timers.showPlaylistManager) {
							timers.showPlaylistManager = window.SetInterval(() => pman.showPanel(), 25);
						}
					}
				}
				if (this.drag_moving && !timers.hidePlaylistManager && !timers.showPlaylistManager) {
					pman.on_mouse("move", x, y);
				}
				// scrollbar
				if (this.ishover_rating) {
					if (!this.ishover_rating_prev)
						window.SetCursor(IDC_HAND);
				} else {
					if (this.ishover_rating_prev)
						window.SetCursor(IDC_ARROW);
					if (cScrollBar.enabled && cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					}
				}
				break;
			case "right":
				this.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
				if (this.ishover && this.activeRow > -1 && Math.abs(this.scrollbar.scroll - this.scrollbar.scroll_) < 2) {
					var rowType = this.rows[this.activeRow].type;
					switch (true) {
						case (rowType > 0 && rowType < 99): // ----------------> group header row
							var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
							if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								plman.ClearPlaylistSelection(g_active_playlist);
								this.selectGroupTracks(this.rows[this.activeRow].albumId);
								plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
								this.SHIFT_start_id = null;
							}
							this.context_menu(x, y, this.track_index, this.row_index);
							break;
						case (rowType == 0): // ----------------> track row
							var playlistTrackId = this.rows[this.activeRow].playlistTrackId;
							if (!plman.IsPlaylistItemSelected(g_active_playlist, playlistTrackId)) {
								plman.ClearPlaylistSelection(g_active_playlist);
								plman.SetPlaylistSelectionSingle(g_active_playlist, playlistTrackId, true);
								plman.SetPlaylistFocusItem(g_active_playlist, playlistTrackId);
							}
							this.context_menu(x, y, playlistTrackId, this.activeRow);
							break;
						case (rowType == 99): // ----------------> extra empty row

							break;
					}
					this.repaint();
				} else {
					// scrollbar
					if (cScrollBar.enabled && cScrollBar.visible) {
						brw.scrollbar && brw.scrollbar.on_mouse(event, x, y);
					}
					// settings menu
					if (!g_filterbox.inputbox.hover) {
						this.settings_context_menu(x, y);
					}
				}
				break;
			case "wheel":
				//this.scrollbar.updateScrollbar(); // update scrollbar done in g_time at each scroll update
				break;
			case "leave":
				// scrollbar
				if (cScrollBar.enabled && cScrollBar.visible) {
					this.scrollbar && this.scrollbar.on_mouse(event, 0, 0);
				}
				break;
			case "drag_over":
				//g_dragndrop_bottom = false;
				if (this.groups.length > 0) {
					var fin = this.rows.length;
					for (var i = 0; i < fin; i++) {
						this.dragndrop_check(x, y, i);
					}
					var rowId = fin - 1;
					var item_height_row = (this.rows[rowId].type == 0 ? 1 : ppt.groupHeaderRowsNumber);
					var limit = this.rows[rowId].y + (item_height_row * ppt.rowHeight);
					if (y > limit) {
						// g_dragndrop_bottom = true;
						// g_dragndrop_trackId = this.rows[rowId].playlistTrackId;
					}
				} else {
					// g_dragndrop_bottom = true;
					// g_dragndrop_trackId = 0;
				}
				break;
		}
	};

	this.g_time = window.SetInterval(() => {
		if (!window.IsVisible) {
			need_repaint = true;
			return;
		}

		if (!g_first_populate_launched) {
			g_first_populate_launched = true;
			brw.launch_populate();
		}

		// get hover row index (mouse cursor hover)
		if (mouse.y > brw.y && mouse.y < brw.y + brw.h) {
			brw.activeRow = Math.ceil((mouse.y + this.scrollbar.scroll_ - brw.y) / ppt.rowHeight - 1);
			if (brw.activeRow >= brw.rows.length)
				brw.activeRow = -1;
		} else {
			brw.activeRow = -1;
		}

		this.scrollbar.scroll = this.check_scroll(this.scrollbar.scroll);
		if (Math.abs(this.scrollbar.scroll - this.scrollbar.scroll_) >= 1) {
			this.scrollbar.scroll_ += (this.scrollbar.scroll - this.scrollbar.scroll_) / ppt.scrollSmoothness;
			need_repaint = true;
			isScrolling = true;
			//
			if (this.scrollbar.scroll_prev != this.scrollbar.scroll)
				brw.scrollbar.updateScrollbar();
		} else {
			if (isScrolling) {
				if (this.scrollbar.scroll_ < 1)
					this.scrollbar.scroll_ = 0;
				isScrolling = false;
				need_repaint = true;
			}
		}
		if (need_repaint) {
			if (isScrolling && brw.rows.length > 0)
				brw.gettags(false);
			need_repaint = false;
			images.loading_angle = (images.loading_angle + 30) % 360;
			window.Repaint();
		}

		this.scrollbar.scroll_prev = this.scrollbar.scroll;

	}, ppt.refreshRate);

	this.context_menu = function (x, y, id, row_id) {
		var _menu = window.CreatePopupMenu();
		var Context = fb.CreateContextMenuManager();
		var _child01 = window.CreatePopupMenu();
		var _child02 = window.CreatePopupMenu();

		if (brw.activeRow > -1) {
			var albumIndex = this.rows[this.activeRow].albumId;
			var crc = brw.groups[albumIndex].cachekey;
		}

		this.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
		Context.InitContextPlaylist();

		// check if selection is single and is in the Media Library to provide if ok a link to Album View panel
		var showInAlbumView = false;
		if (this.metadblist_selection.Count == 1) {
			if (fb.IsMetadbInMediaLibrary(this.metadblist_selection[0])) {
				showInAlbumView = true;
			}
		}

		_menu.AppendMenuItem(MF_STRING, 1, "Settings...");
		_menu.AppendMenuSeparator();
		Context.BuildMenu(_menu, 2);

		_child01.AppendTo(_menu, MF_STRING, "Selection...");
		if (brw.activeRow > -1) {
			if (this.metadblist_selection.Count == 1) {
				_child01.AppendMenuItem(MF_STRING, 1010, "Reset Image Cache");
			}
		}
		_child01.AppendMenuItem((showInAlbumView ? MF_STRING : MF_GRAYED | MF_DISABLED), 1011, "Highlight in JS Smooth Browser");
		_child01.AppendMenuItem(plman.IsAutoPlaylist(g_active_playlist) ? MF_DISABLED | MF_GRAYED : MF_STRING, 1020, "Remove");
		_child02.AppendTo(_child01, MF_STRING, "Send to...");
		_child02.AppendMenuItem(MF_STRING, 2000, "a New playlist...");

		var pl_count = plman.PlaylistCount;
		if (pl_count > 1) {
			_child02.AppendMenuSeparator();
		}
		for (var i = 0; i < pl_count; i++) {
			if (i != this.playlist && !plman.IsAutoPlaylist(i)) {
				_child02.AppendMenuItem(MF_STRING, 2001 + i, plman.GetPlaylistName(i));
			}
		}

		var ret = _menu.TrackPopupMenu(x, y);
		if (ret > 1 && ret < 800) {
			Context.ExecuteByID(ret - 2);
		} else if (ret < 2) {
			switch (ret) {
				case 1:
					this.settings_context_menu(x, y);
					break;
			}
		} else {
			switch (ret) {
				case 1010:
					if (fso.FileExists(CACHE_FOLDER + crc)) {
						try {
							fso.DeleteFile(CACHE_FOLDER + crc);
						} catch (e) {
							console.log("Spider Monkey Panel Error: Image cache [" + crc + "] can't be deleted on disk, file in use, try later or reload panel.");
						}
					}
					this.groups[albumIndex].tid = -1;
					this.groups[albumIndex].load_requested = 0;
					this.groups[albumIndex].save_requested = false;
					g_image_cache.reset(crc);
					this.groups[albumIndex].cover_img = null;
					this.groups[albumIndex].cover_type = null;
					this.repaint();
					break;
				case 1011:
					window.NotifyOthers("JSSmoothPlaylist->JSSmoothBrowser:show_item", this.metadblist_selection[0]);
					break;
				case 1020:
					plman.RemovePlaylistSelection(g_active_playlist, false);
					break;
				case 2000:
					plman.CreatePlaylist(plman.PlaylistCount, "");
					plman.ActivePlaylist = plman.PlaylistCount - 1;
					plman.InsertPlaylistItems(plman.PlaylistCount - 1, 0, this.metadblist_selection, false);
					break;
				default:
					var insert_index = plman.PlaylistItemCount(ret - 2001);
					plman.InsertPlaylistItems((ret - 2001), insert_index, this.metadblist_selection, false);
			}
		}
		return true;
	};

	this.settings_context_menu = function (x, y) {
		var _menu = window.CreatePopupMenu();
		var _menu1 = window.CreatePopupMenu();
		var _menu2 = window.CreatePopupMenu();
		var _menu3 = window.CreatePopupMenu();
		var idx;

		_menu.AppendMenuItem((fb.IsPlaying ? MF_STRING : MF_GRAYED | MF_DISABLED), 900, "Show Now Playing");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 910, "Header Bar");
		_menu.CheckMenuItem(910, ppt.showHeaderBar);
		_menu.AppendMenuItem(MF_STRING, 912, "Double Track Line");
		_menu.CheckMenuItem(912, ppt.doubleRowText);

		_menu.AppendMenuSeparator();
		_menu1.AppendMenuItem((!ppt.doubleRowText ? (!ppt.showgroupheaders ? MF_GRAYED | MF_DISABLED : MF_STRING) : MF_GRAYED | MF_DISABLED), 111, "Artist");
		_menu1.CheckMenuItem(111, ppt.showArtistAlways);
		//_menu1.AppendMenuItem(MF_STRING, 112, "Mood");
		//_menu1.CheckMenuItem(112, ppt.showMood);
		_menu1.AppendMenuItem(MF_STRING, 113, "Rating");
		_menu1.CheckMenuItem(113, ppt.showRating);
		_menu1.AppendTo(_menu, MF_STRING, "Extra Track Infos");

		_menu2.AppendMenuItem(MF_STRING, 200, "Enable");
		_menu2.CheckMenuItem(200, ppt.showwallpaper);
		_menu2.AppendMenuItem(MF_STRING, 220, "Blur");
		_menu2.CheckMenuItem(220, ppt.wallpaperblurred);
		_menu2.AppendMenuSeparator();
		_menu2.AppendMenuItem(MF_STRING, 210, "Playing Album Cover");
		_menu2.AppendMenuItem(MF_STRING, 211, "Default");
		_menu2.CheckMenuRadioItem(210, 211, ppt.wallpapermode + 210);

		_menu2.AppendTo(_menu, MF_STRING, "Background Wallpaper");

		_menu3.AppendMenuItem((!ppt.autocollapse ? MF_STRING : MF_GRAYED | MF_DISABLED), 300, "Enable");
		_menu3.CheckMenuItem(300, ppt.showgroupheaders);
		_menu3.AppendMenuItem((ppt.showgroupheaders ? MF_STRING : MF_GRAYED | MF_DISABLED), 310, "Autocollapse");
		_menu3.CheckMenuItem(310, ppt.autocollapse);
		_menu3.AppendMenuSeparator();
		_menu3.AppendMenuItem((ppt.showgroupheaders && !ppt.autocollapse ? MF_STRING : MF_GRAYED | MF_DISABLED), 320, "Collapse All");
		_menu3.AppendMenuItem((ppt.showgroupheaders && !ppt.autocollapse ? MF_STRING : MF_GRAYED | MF_DISABLED), 330, "Expand All");

		_menu3.AppendTo(_menu, MF_STRING, "Group Headers");

		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 991, "Panel Properties");
		_menu.AppendMenuItem(MF_STRING, 992, "Configure...");

		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
			case (idx == 111):
				ppt.showArtistAlways = !ppt.showArtistAlways;
				window.SetProperty("_DISPLAY: Show Artist in Track Row", ppt.showArtistAlways);
				get_metrics();
				brw.repaint();
				break;
			case (idx == 112):
				ppt.showMood = !ppt.showMood;
				window.SetProperty("_DISPLAY: Show Mood in Track Row", ppt.showMood);
				get_metrics();
				brw.repaint();
				break;
			case (idx == 113):
				ppt.showRating = !ppt.showRating;
				window.SetProperty("_DISPLAY: Show Rating in Track Row", ppt.showRating);
				get_metrics();
				brw.repaint();
				break;
			case (idx == 200):
				ppt.showwallpaper = !ppt.showwallpaper;
				window.SetProperty("_DISPLAY: Show Wallpaper", ppt.showwallpaper);
				g_wallpaperImg = setWallpaperImg();
				brw.repaint();
				break;
			case (idx == 210):
			case (idx == 211):
				ppt.wallpapermode = idx - 210;
				window.SetProperty("_SYSTEM: Wallpaper Mode", ppt.wallpapermode);
				g_wallpaperImg = setWallpaperImg();
				brw.repaint();
				break;
			case (idx == 220):
				ppt.wallpaperblurred = !ppt.wallpaperblurred;
				window.SetProperty("_DISPLAY: Wallpaper Blurred", ppt.wallpaperblurred);
				g_wallpaperImg = setWallpaperImg();
				brw.repaint();
				break;
			case (idx == 300):
				ppt.showgroupheaders = !ppt.showgroupheaders;
				window.SetProperty("_DISPLAY: Show Group Headers", ppt.showgroupheaders);
				if (!ppt.showgroupheaders)
					brw.collapseAll(false);
				get_metrics();
				brw.repaint();
				break;
			case (idx == 310):
				ppt.autocollapse = !ppt.autocollapse;
				window.SetProperty("_PROPERTY: Autocollapse groups", ppt.autocollapse);
				brw.populate(false);
				brw.showFocusedItem();
				break;
			case (idx == 320):
				brw.collapseAll(true);
				brw.showFocusedItem();
				break;
			case (idx == 330):
				brw.collapseAll(false);
				brw.showFocusedItem();
				break;
			case (idx == 900):
				brw.showNowPlaying();
				break;
			case (idx == 910):
				ppt.showHeaderBar = !ppt.showHeaderBar;
				window.SetProperty("_DISPLAY: Show Top Bar", ppt.showHeaderBar);
				get_metrics();
				brw.repaint();
				break;
			case (idx == 912):
				ppt.doubleRowText = !ppt.doubleRowText;
				window.SetProperty("_PROPERTY: Double Row Text Info", ppt.doubleRowText);
				get_metrics();
				brw.repaint();
				break;
			case (idx == 991):
				window.ShowProperties();
				break;
			case (idx == 992):
				window.ShowConfigure();
				break;
		}
		return true;
	};

	this.incrementalSearch = function () {
		var count = 0;
		var albumartist,
			artist,
			groupkey;
		var chr;
		var gstart;
		var pid = -1;

		// exit if no search string in cache
		if (cList.search_string.length <= 0)
			return true;

		// 1st char of the search string
		var first_chr = cList.search_string.substring(0, 1);
		var len = cList.search_string.length;

		// which start point for the search
		if (this.list.count > 1000) {
			albumartist = ppt.tf_albumartist.EvalWithMetadb(this.list[Math.floor(this.list.Count / 2)]);
			chr = albumartist.substring(0, 1);
			if (first_chr.charCodeAt(first_chr) > chr.charCodeAt(chr)) {
				gstart = Math.floor(this.list.Count / 2);
			} else {
				gstart = 0;
			}
		} else {
			gstart = 0;
		}

		if (!ppt.showgroupheaders) {

			// 1st search on "album artist" TAG
			var format_str = "";
			for (var i = gstart; i < this.list.Count; i++) {
				albumartist = ppt.tf_albumartist.EvalWithMetadb(this.list[i]);
				format_str = albumartist.substring(0, len).toUpperCase();
				if (format_str == cList.search_string) {
					pid = i;
					break;
				}
			}

			// if not found, search in the first part (from 0 to gstart)
			if (pid < 0) {
				var format_str = "";
				for (var i = 0; i < gstart; i++) {
					albumartist = ppt.tf_albumartist.EvalWithMetadb(this.list[i]);
					format_str = albumartist.substring(0, len).toUpperCase();
					if (format_str == cList.search_string) {
						pid = i;
						break;
					}
				}
			}

			if (pid < 0) {
				// 2nd search on "artist" TAG
				var format_str = "";
				for (var i = 0; i < this.list.Count; i++) {
					artist = ppt.tf_artist.EvalWithMetadb(this.list[i]);
					format_str = artist.substring(0, len).toUpperCase();
					if (format_str == cList.search_string) {
						pid = i;
						break;
					}
				}
			}

		} else {

			// 1st search on tf_group_key of current group by pattern
			var format_str = "";
			for (var i = gstart; i < this.list.Count; i++) {
				groupkey = ppt.tf_groupkey.EvalWithMetadb(this.list[i]);
				format_str = groupkey.substring(0, len).toUpperCase();
				if (format_str == cList.search_string) {
					pid = i;
					break;
				}
			}

			// if not found, search in the first part (from 0 to gstart)
			if (pid < 0) {
				var format_str = "";
				for (var i = 0; i < gstart; i++) {
					groupkey = ppt.tf_groupkey.EvalWithMetadb(this.list[i]);
					format_str = groupkey.substring(0, len).toUpperCase();
					if (format_str == cList.search_string) {
						pid = i;
						break;
					}
				}
			}

		}

		if (pid >= 0) { // found
			g_focus_id = pid;
			plman.ClearPlaylistSelection(g_active_playlist);
			plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
			plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
			this.showFocusedItem();
		} else { // not found on "album artist" TAG, new search on "artist" TAG
			cList.inc_search_noresult = true;
			brw.repaint();
		}

		cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
		cList.clear_incsearch_timer = window.SetTimeout(function () {
			// reset incremental search string after 1 seconds without any key pressed
			cList.search_string = "";
			cList.inc_search_noresult = false;
			brw.repaint();
			window.ClearInterval(cList.clear_incsearch_timer);
			cList.clear_incsearch_timer = false;
		}, 1000);
	};
};

/*
===================================================================================================
Main
===================================================================================================
 */
var g_seconds = 0;
var g_time_remaining = null;
var g_radio_title = "loading live tag ...";
var g_radio_artist = "";

var cover_img = cover.masks.split(";");

var brw = null;
var isScrolling = false;

var g_filterbox = null;
// var filter_text = "";

var g_instancetype = window.InstanceType;

// fonts
var g_font_guifx_found = utils.CheckFont("guifx v2 transports");
var g_font_wingdings2_found = utils.CheckFont("wingdings 2");

//
var ww = 0, wh = 0;
var g_metadb = null;
var g_selHolder = fb.AcquireUiSelectionHolder();
g_selHolder.SetPlaylistSelectionTracking();
var foo_playcount = utils.CheckComponent("foo_playcount", true);

var g_active_playlist = null;
var g_focus_id = -1;
var g_focus_row = 0;
var g_focus_album_id = -1;
//
var g_avoid_on_playlists_changed = false;
var g_avoid_on_playlist_switch = false;
var g_avoid_on_item_focus_change = false;
var g_avoid_on_playlist_items_added = false;
var g_avoid_on_playlist_items_removed = false;
var g_avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist = false;
var g_avoid_on_playlist_items_reordered = false;
// mouse actions
var g_lbtn_click = false;
//
var g_total_duration_text = "";
var g_first_populate_done = false;
var g_first_populate_launched = false;
//
// var scroll_ = 0, scroll = 0, scroll_prev = 0;
var g_start_ = 0, g_end_ = 0;
var g_wallpaperImg = null;

var g_rating_updated = false;
var g_rating_rowId = -1;
let pman;

function on_init() {
	plman.SetActivePlaylistContext();
	window.DlgCode = DLGC_WANTALLKEYS;

	get_font();
	// get_colors();
	updateColors();
	get_metrics();
	get_images();

	g_active_playlist = plman.ActivePlaylist;
	g_focus_id = getFocusId(g_active_playlist);

	brw = new oBrowser("brw");
	pman = new oPlaylistManager("pman");
	pman.parentView = brw;

	g_filterbox = new oFilterBox(g_sendResponse);
	g_filterbox.inputbox.visible = true;
}
on_init();

// START
registerCallback("on_size", function () {
	window.DlgCode = DLGC_WANTALLKEYS;

	ww = window.Width;
	wh = window.Height;
	if (!ww || !wh) return;

	g_wallpaperImg = setWallpaperImg();

	// get_images();

	// set Size of browser
	if (cScrollBar.enabled) {
		brw.setSize(0, (ppt.showHeaderBar ? ppt.headerBarHeight : 0), ww - cScrollBar.width, wh - (ppt.showHeaderBar ? ppt.headerBarHeight : 0));
	} else {
		brw.setSize(0, (ppt.showHeaderBar ? ppt.headerBarHeight : 0), ww, wh - (ppt.showHeaderBar ? ppt.headerBarHeight : 0));
	}
})

registerCallback("on_paint", function (gr) {

	if (!ww)
		return;


	// draw background under playlist
	if (fb.IsPlaying && g_wallpaperImg && ppt.showwallpaper) {
		gr.GdiDrawBitmap(g_wallpaperImg, 0, 0, ww, wh, 0, 0, g_wallpaperImg.Width, g_wallpaperImg.Height);
		gr.FillSolidRect(0, 0, ww, wh, colors.background & RGBA(255, 255, 255, ppt.wallpaperalpha));
	} else {
		//gr.FillSolidRect(0, 0, ww, wh, globalColors.background);
		if (g_wallpaperImg && ppt.showwallpaper) {
			gr.GdiDrawBitmap(g_wallpaperImg, 0, 0, ww, wh, 0, 0, g_wallpaperImg.Width, g_wallpaperImg.Height);
			gr.FillSolidRect(0, 0, ww, wh, colors.background & RGBA(255, 255, 255, ppt.wallpaperalpha));
		} else {
			gr.FillSolidRect(0, 0, ww, wh, colors.background);
		}
	}

	brw && brw.draw(gr);

	if (pman.offset > 0) {
		pman.draw(gr);
	}


	if (ppt.showHeaderBar) {
		// inputBox
		if (ppt.showFilterBox && g_filterbox) {
			if (g_filterbox.inputbox.visible) {
				g_filterbox.draw(gr, 5, 2);
			}
		}
	}
});


registerCallback("on_mouse_lbtn_down", function (x, y) {
	g_lbtn_click = true;

	// stop inertia
	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
		// stop scrolling but not abrupt, add a little offset for the stop
		if (Math.abs(brw.scrollbar.scroll - brw.scrollbar.scroll_) > ppt.rowHeight) {
			brw.scrollbar.scroll = (brw.scrollbar.scroll > brw.scrollbar.scroll_ ? brw.scrollbar.scroll_ + ppt.rowHeight : brw.scrollbar.scroll_ - ppt.rowHeight);
			brw.scrollbar.scroll = brw.scrollbar.check_scroll(brw.scrollbar.scroll);
		}
	}

	var is_scroll_enabled = brw.rowsCount > brw.totalRowsVis;
	if (ppt.enableTouchControl && is_scroll_enabled) {
		if (brw._isHover(x, y) && !brw.scrollbar._isHover(x, y)) {
			if (!timers.mouseDown) {
				cTouch.y_prev = y;
				cTouch.y_start = y;
				if (cTouch.t1) {
					cTouch.t1.Reset();
				} else {
					cTouch.t1 = fb.CreateProfiler("t1");
				}
				timers.mouseDown = window.SetTimeout(function () {
					window.ClearTimeout(timers.mouseDown);
					timers.mouseDown = false;
					if (Math.abs(cTouch.y_start - mouse.y) > 13) {
						cTouch.down = true;
					} else {
						brw.on_mouse("down", x, y);
					}
				}, 50);
			}
		} else {
			brw.on_mouse("down", x, y);
		}
	} else {
		brw.on_mouse("down", x, y);
	}

	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("lbtn_down", x, y);
	}
});

registerCallback("on_mouse_lbtn_up", function (x, y) {

	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("lbtn_up", x, y);
	}

	if (pman.state == 1) {
		pman.on_mouse("up", x, y);
	} else {
		brw.on_mouse("up", x, y);
	}

	if (timers.mouseDown) {
		window.ClearTimeout(timers.mouseDown);
		timers.mouseDown = false;
		if (Math.abs(cTouch.y_start - mouse.y) <= 24) {
			brw.on_mouse("down", x, y);
		}
	}

	// create scroll inertia on mouse lbtn up
	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_end = y;
		cTouch.scroll_delta = brw.scrollbar.scroll - brw.scrollbar.scroll_;
		//cTouch.y_delta = cTouch.y_start - cTouch.y_end;
		if (Math.abs(cTouch.scroll_delta) > 24) {
			cTouch.multiplier = ((1000 - cTouch.t1.Time) / 20);
			cTouch.delta = Math.round((cTouch.scroll_delta) / 24);
			if (cTouch.multiplier < 1)
				cTouch.multiplier = 1;
			if (cTouch.timer)
				window.ClearInterval(cTouch.timer);
			cTouch.timer = window.SetInterval(function () {
				brw.scrollbar.scroll += cTouch.delta * cTouch.multiplier;
				brw.scrollbar.scroll = brw.check_scroll(brw.scrollbar.scroll);
				cTouch.multiplier = cTouch.multiplier - 1;
				cTouch.delta = cTouch.delta - (cTouch.delta / 10);
				if (cTouch.multiplier < 1) {
					window.ClearInterval(cTouch.timer);
					cTouch.timer = false;
				}
			}, 75);
		}
	}

	g_lbtn_click = false;
})

registerCallback("on_mouse_lbtn_dblclk", function (x, y, mask) {
	if (y >= brw.y) {
		brw.on_mouse("dblclk", x, y);
	} else if (x > brw.x && x < brw.x + brw.w) {
		brw.showNowPlaying();
	} else {
		brw.on_mouse("dblclk", x, y);
	}
})

registerCallback("on_mouse_rbtn_up", function (x, y) {
	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("rbtn_up", x, y);
	}

	if (pman.state == 1) {
		pman.on_mouse("right", x, y);
	}

	brw.on_mouse("right", x, y);
	return true;
})

registerCallback("on_mouse_move", function (x, y) {

	if (mouse.x == x && mouse.y == y)
		return;

	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("move", x, y);
	}

	if (pman.state == 1) {
		pman.on_mouse("move", x, y);
	} else {
		if (cTouch.down) {
			cTouch.y_current = y;
			cTouch.y_move = (cTouch.y_current - cTouch.y_prev);
			if (x < brw.w) {
				brw.scrollbar.scroll -= cTouch.y_move;
				cTouch.scroll_delta = brw.scrollbar.scroll - brw.scrollbar.scroll_;
				if (Math.abs(cTouch.scroll_delta) < 24)
					cTouch.y_start = cTouch.y_current;
				cTouch.y_prev = cTouch.y_current;
			}
		} else {
			brw.on_mouse("move", x, y);
		}
	}

	mouse.x = x;
	mouse.y = y;
})

registerCallback("on_mouse_wheel", function (step) {

	if (cTouch.timer) {
		window.ClearInterval(cTouch.timer);
		cTouch.timer = false;
	}

	if (utils.IsKeyPressed(VK_SHIFT)) { // zoom cover size only
		var zoomStep = 1;
		var previous = ppt.groupHeaderRowsNumber;
		if (!timers.mouseWheel) {
			if (step > 0) {
				ppt.groupHeaderRowsNumber += zoomStep;
				if (ppt.groupHeaderRowsNumber > 5)
					ppt.groupHeaderRowsNumber = 5;
			} else {
				ppt.groupHeaderRowsNumber -= zoomStep;
				if (ppt.groupHeaderRowsNumber < 2)
					ppt.groupHeaderRowsNumber = 2;
			}
			if (previous != ppt.groupHeaderRowsNumber) {
				timers.mouseWheel = window.SetTimeout(function () {
					window.SetProperty("_PROPERTY: Number of Rows for Group Header", ppt.groupHeaderRowsNumber);
					get_font();
					get_metrics();
					get_images();

					// refresh covers
					g_image_cache = new image_cache;
					var total = brw.groups.length;
					for (var i = 0; i < total; i++) {
						brw.groups[i].tid = -1;
						brw.groups[i].load_requested = 0;
						brw.groups[i].save_requested = false;
						brw.groups[i].cover_img = null;
						brw.groups[i].cover_type = null;
					}

					brw.repaint();
					timers.mouseWheel && window.ClearTimeout(timers.mouseWheel);
					timers.mouseWheel = false;
				}, 100);
			}
		}
	} else if (utils.IsKeyPressed(VK_CONTROL)) {
		var zoomStep = 1;
		var previous = ppt.extra_font_size;
		if (!timers.mouseWheel) {
			if (step > 0) {
				ppt.extra_font_size += zoomStep;
				if (ppt.extra_font_size > 10)
					ppt.extra_font_size = 10;
			} else {
				ppt.extra_font_size -= zoomStep;
				if (ppt.extra_font_size < 0)
					ppt.extra_font_size = 0;
			}
			if (previous != ppt.extra_font_size) {
				timers.mouseWheel = window.SetTimeout(function () {
					window.SetProperty("_SYSTEM: Extra font size value", ppt.extra_font_size);
					get_font();
					get_metrics();
					get_images();

					// refresh covers
					g_image_cache = new image_cache;
					var total = brw.groups.length;
					for (var i = 0; i < total; i++) {
						brw.groups[i].tid = -1;
						brw.groups[i].load_requested = 0;
						brw.groups[i].save_requested = false;
						brw.groups[i].cover_img = null;
						brw.groups[i].cover_type = null;
					}

					brw.repaint();
					timers.mouseWheel && window.ClearTimeout(timers.mouseWheel);
					timers.mouseWheel = false;
				}, 100);
			}
		}
	} else {
		if (pman.state == 1) {
			if (pman.scr_w > 0)
				pman.on_mouse("wheel", mouse.x, mouse.y, step);
		} else {
			var rowStep = ppt.rowScrollStep;
			brw.scrollbar.scroll -= step * ppt.rowHeight * rowStep;
			brw.scrollbar.scroll = brw.check_scroll(brw.scrollbar.scroll);
			brw.on_mouse("wheel", mouse.x, mouse.y, step);
		}
	}

})

registerCallback("on_mouse_leave", function () {
	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_mouse("leave", 0, 0);
	}
	brw.on_mouse("leave", 0, 0);

	if (pman.state == 1) {
		pman.on_mouse("leave", 0, 0);
	}
})

//=================================================// Metrics & Fonts & Colors & Images
function get_metrics() {

	cPlaylistManager.topbarHeight = $zoomfloor(cPlaylistManager.default_topbarHeight);
	cPlaylistManager.botbarHeight = $zoomfloor(cPlaylistManager.default_botbarHeight);
	cPlaylistManager.rowHeight = $zoomfloor(cPlaylistManager.default_rowHeight);
	cPlaylistManager.scrollbarWidth = $zoomfloor(cPlaylistManager.default_scrollbarWidth);

	if (ppt.showHeaderBar) {
		ppt.headerBarHeight = $zoom(ppt.defaultHeaderBarHeight);
		ppt.headerBarHeight = Math.floor(ppt.headerBarHeight / 2) != ppt.headerBarHeight / 2 ? ppt.headerBarHeight : ppt.headerBarHeight - 1;
	} else {
		ppt.headerBarHeight = 0;
	}
	if (ppt.doubleRowText) {
		var _defaultRowHeight = ppt.defaultRowHeight + ppt.doubleRowPixelAdds;
	} else {
		var _defaultRowHeight = ppt.defaultRowHeight;
	}
	ppt.rowHeight = $zoom(_defaultRowHeight);
	// cScrollBar.width = Math.floor(cScrollBar.defaultWidth * g_zoom_percent / 100);
	cScrollBar.minCursorHeight = $zoom(cScrollBar.defaultMinCursorHeight);
	//
	cover.margin = $zoomfloor(cover.default_margin);
	cover.w = ppt.groupHeaderRowsNumber * ppt.rowHeight;
	cover.max_w = ppt.groupHeaderRowsNumber * ppt.rowHeight;
	cover.h = ppt.groupHeaderRowsNumber * ppt.rowHeight;
	cover.max_h = ppt.groupHeaderRowsNumber * ppt.rowHeight;
	//
	g_image_cache = new image_cache;

	cFilterBox.w = $zoomfloor(cFilterBox.default_w);
	cFilterBox.h = $zoom(cFilterBox.default_h);

	if (brw) {
		if (cScrollBar.enabled) {
			brw.setSize(0, (ppt.showHeaderBar ? ppt.headerBarHeight : 0), ww - cScrollBar.width, wh - (ppt.showHeaderBar ? ppt.headerBarHeight : 0));
		} else {
			brw.setSize(0, (ppt.showHeaderBar ? ppt.headerBarHeight : 0), ww, wh - (ppt.showHeaderBar ? ppt.headerBarHeight : 0));
		}
		brw.setList();
		//
		g_focus_row = brw.getOffsetFocusItem(g_focus_id);
		// if focused track not totally visible, we scroll to show it centered in the panel
		if (g_focus_row < brw.scrollbar.scroll / ppt.rowHeight || g_focus_row > brw.scrollbar.scroll / ppt.rowHeight + brw.totalRowsVis - 1) {
			brw.scrollbar.scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
			brw.scrollbar.scroll = brw.check_scroll(brw.scrollbar.scroll);
			brw.scrollbar.scroll_ = brw.scrollbar.scroll;
		}
		if (brw.rowsCount > 0)
			brw.gettags(true);
	}
}

function get_images() {
	var gb;
	var txt = "";

	cover.glass_reflect = draw_glass_reflect(200, 200);

	// PLAY icon
	images.play_on = gdi.CreateImage(70, 70);
	gb = images.play_on.GetGraphics();
	DrawPolyStar(gb, 12 - 2, 12, 46, 1, 3, 2, colors.background, colors.text, 90, 255);
	images.play_on.ReleaseGraphics(gb);

	images.play_off = gdi.CreateImage(70, 70);
	gb = images.play_off.GetGraphics();
	DrawPolyStar(gb, 16 - 2, 16, 38, 1, 3, 2, colors.background, colors.text, 90, 255);
	images.play_off.ReleaseGraphics(gb);

	var img_loading = gdi.Image(images.path + "load.png");
	var iw = ppt.groupHeaderRowsNumber * ppt.rowHeight;
	images.loading_draw = img_loading.Resize(iw, iw, 7);

	var nw = 250,
		nh = 250;
	txt = "NO\nCOVER";
	images.noart = gdi.CreateImage(nw, nh);
	gb = images.noart.GetGraphics();
	// draw no cover art image
	gb.FillSolidRect(0, 0, nw, nh, colors.text & 0x10ffffff);
	gb.SetTextRenderingHint(4);
	gb.DrawString(txt, gdi.Font(fonts.name, Math.round(nh / 12 * 2), 1), blendColors(colors.text, colors.background, 0.30), 1, 1, nw, nh, cc_stringformat);
	images.noart.ReleaseGraphics(gb);

	var sw = 250,
		sh = 250;
	txt = "STREAM";
	images.stream = gdi.CreateImage(sw, sh);
	gb = images.stream.GetGraphics();
	// draw stream art image
	gb.FillSolidRect(0, 0, sw, sh, colors.text & 0x10ffffff);
	gb.SetTextRenderingHint(4);
	gb.DrawString(txt, gdi.Font(fonts.name, Math.round(sh / 12 * 2), 1), blendColors(colors.text, colors.background, 0.30), 1, 1, sw, sh, cc_stringformat);
	images.stream.ReleaseGraphics(gb);
}

function get_font() {
	updateFonts();
}

registerCallback("on_font_changed", function () {
	get_font();
	get_metrics();
	brw.repaint();
});

registerCallback("on_colours_changed", function () {
	// get_colors();
	updateColors();
	get_images();
	if (brw)
		brw.scrollbar.setNewColors();
	g_filterbox.getImages();
	g_filterbox.reset_colors();
	brw.repaint();
})

registerCallback("on_script_unload", function () {
	brw.g_time && window.ClearInterval(brw.g_time);
	brw.g_time = false;
})

//=================================================// Keyboard Callbacks
registerCallback("on_key_up", function (vkey) {
	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_key("up", vkey);
	}

	// scroll keys up and down RESET (step and timers)
	brw.keypressed = false;
	cScrollBar.timerCounter = -1;
	cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
	cScrollBar.timerID = false;
	if (vkey == VK_SHIFT) {
		brw.SHIFT_start_id = null;
		brw.SHIFT_count = 0;
	}
	brw.repaint();
})

function vk_up() {
	var scrollstep = 1;
	var new_focus_id = 0,
		new_row = 0;

	new_row = g_focus_row - scrollstep;
	if (new_row < 0) {
		if (brw.groups[0].collapsed) {
			new_row = 0;
		} else {
			if (ppt.showgroupheaders) {
				new_row = 0 + ppt.groupHeaderRowsNumber;
			} else {
				new_row = 0;
			}
		}
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	} else {
		switch (brw.rows[new_row].type) {
			case 0: // track row
				// RAS
				break;
			case 99: // blank line (extra line)
				while (brw.rows[new_row].type == 99) {
					if (new_row > 0)
						new_row -= 1;
				}
				break;
			default: // group row
				if (brw.groups[brw.rows[new_row].albumId].collapsed) {
					new_row -= (ppt.groupHeaderRowsNumber - 1);
				} else {
					new_row -= ppt.groupHeaderRowsNumber;
				}
		}
	}
	if (new_row >= 0) {
		while (brw.rows[new_row].type == 99) {
			if (new_row > 0)
				new_row -= 1;
		}
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
}

function vk_down() {
	var scrollstep = 1;
	var new_focus_id = 0,
		new_row = 0;

	new_row = g_focus_row + scrollstep;
	if (new_row > brw.rowsCount - 1) {
		new_row = brw.rowsCount - 1;
		if (brw.groups[brw.rows[new_row].albumId].collapsed) {
			new_row -= (ppt.groupHeaderRowsNumber - 1);
		}
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	} else {
		switch (brw.rows[new_row].type) {
			case 0: // track row
				// RAS
				break;
			case 99: // blank line (extra line)
				while (brw.rows[new_row].type == 99) {
					if (new_row < brw.rowsCount - 1)
						new_row += 1;
				}
				break;
			default: // group row
				if (brw.groups[brw.rows[new_row].albumId].collapsed) {
					if (brw.rows[new_row].type > 1) { // if not 1st row of the group header
						new_row += (ppt.groupHeaderRowsNumber - brw.rows[new_row].type + 1);
						if (new_row > brw.rowsCount - 1) {
							new_row = brw.rowsCount - 1;
							if (brw.groups[brw.rows[new_row].albumId].collapsed) {
								new_row -= (ppt.groupHeaderRowsNumber - 1);
							}
						} else {
							if (!brw.groups[brw.rows[new_row].albumId].collapsed) {
								new_row += ppt.groupHeaderRowsNumber;
							}
						}
					} else {
						// RAS
					}
				} else {
					if (brw.rows[new_row].type > 1) { // if not 1st row of the group header
						// RAS, can't happend
					} else {
						new_row += ppt.groupHeaderRowsNumber;
					}
				}
		}
	}
	if (new_row < brw.rowsCount) {
		while (brw.rows[new_row].type == 99) {
			if (new_row < brw.rowsCount - 1)
				new_row += 1;
		}
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
}

function vk_pgup() {
	var scrollstep = brw.totalRowsVis;
	var new_focus_id = 0,
		new_row = 0;

	new_row = g_focus_row - scrollstep;
	if (new_row < 0) {
		if (brw.groups[0].collapsed) {
			new_row = 0;
		} else {
			new_row = 0 + ppt.groupHeaderRowsNumber;
		}
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	} else {
		switch (brw.rows[new_row].type) {
			case 0: // track row
				// RAS
				break;
			case 99: // blank line (extra line)
				while (brw.rows[new_row].type == 99) {
					if (new_row > 0)
						new_row -= 1;
				}
				break;
			default: // group row
				if (brw.groups[brw.rows[new_row].albumId].collapsed) {
					if (brw.rows[new_row].type > 1) { // if not 1st row of the group header
						new_row -= (brw.rows[new_row].type - 1);
					} else {
						// RAS
					}
				} else {
					new_row += (ppt.groupHeaderRowsNumber - brw.rows[new_row].type + 1);
				}
		}
	}
	if (new_row >= 0) {
		while (brw.rows[new_row].type == 99) {
			if (new_row > 0)
				new_row -= 1;
		}
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
}

function vk_pgdn() {
	var scrollstep = brw.totalRowsVis;
	var new_focus_id = 0,
		new_row = 0;

	new_row = g_focus_row + scrollstep;
	if (new_row > brw.rowsCount - 1) {
		new_row = brw.rowsCount - 1;
		if (brw.groups[brw.rows[new_row].albumId].collapsed) {
			new_row -= (ppt.groupHeaderRowsNumber - 1);
		}
	} else {
		switch (brw.rows[new_row].type) {
			case 0: // track row
				// RAS
				break;
			case 99: // blank line (extra line)
				while (brw.rows[new_row].type == 99) {
					if (new_row < brw.rowsCount - 1)
						new_row += 1;
				}
				break;
			default: // group row
				if (brw.groups[brw.rows[new_row].albumId].collapsed) {
					if (brw.rows[new_row].type > 1) { // if not 1st row of the group header
						new_row -= (brw.rows[new_row].type - 1);
					} else {
						// RAS
					}
				} else {
					new_row += (ppt.groupHeaderRowsNumber - brw.rows[new_row].type + 1);
				}
		}
	}
	if (new_row < brw.rowsCount) {
		while (brw.rows[new_row].type == 99) {
			if (new_row < brw.rowsCount - 1)
				new_row += 1;
		}
		new_focus_id = brw.rows[new_row].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	} else {
		// kill timer
		cScrollBar.timerCounter = -1;
		cScrollBar.timerID && window.ClearTimeout(cScrollBar.timerID);
		cScrollBar.timerID = false;
	}
}

registerCallback("on_key_down", function on_key_down(vkey) {
	var mask = GetKeyboardMask();

	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_key("down", vkey);
	}

	if (mask == KMask.none) {
		switch (vkey) {
			case VK_F2:

				break;
			case VK_F3:
				brw.showNowPlaying();
				break;
			case VK_F5:
				// refresh covers
				g_image_cache = new image_cache;
				var total = brw.groups.length;
				for (var i = 0; i < total; i++) {
					brw.groups[i].tid = -1;
					brw.groups[i].load_requested = 0;
					brw.groups[i].save_requested = false;
					brw.groups[i].cover_img = null;
					brw.groups[i].cover_type = null;
				}
				brw.repaint();
				break;
			case VK_F6:

				break;
			case VK_TAB:
				break;
			case VK_BACK:
				if (cList.search_string.length > 0) {
					cList.inc_search_noresult = false;
					brw.tt_x = ((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2);
					brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
					brw.tt_w = ((cList.search_string.length * 13) + (10 * 2));
					brw.tt_h = 60;
					cList.search_string = cList.search_string.substring(0, cList.search_string.length - 1);
					brw.repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function () {
						brw.incrementalSearch();
						window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = false;
						cList.inc_search_noresult = false;
					}, 400);
				}
				break;
			case VK_ESCAPE:
			case 222:
				brw.tt_x = ((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2);
				brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
				brw.tt_w = ((cList.search_string.length * 13) + (10 * 2));
				brw.tt_h = 60;
				cList.search_string = "";
				window.RepaintRect(0, brw.tt_y - 2, brw.w, brw.tt_h + 4);
				break;
			case VK_UP:
				if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;
					reset_cover_timers();

					vk_up();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							window.ClearTimeout(cScrollBar.timerID);
							cScrollBar.timerID = window.SetInterval(vk_up, 100);
						}, 400);
					}
				}
				break;
			case VK_DOWN:
				if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;
					reset_cover_timers();

					vk_down();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							window.ClearTimeout(cScrollBar.timerID);
							cScrollBar.timerID = window.SetInterval(vk_down, 100);
						}, 400);
					}
				}
				break;
			case VK_PGUP:
				if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;
					reset_cover_timers();

					vk_pgup();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							window.ClearTimeout(cScrollBar.timerID);
							cScrollBar.timerID = window.SetInterval(vk_pgup, 100);
						}, 400);
					}
				}
				break;
			case VK_PGDN:
				if (brw.rowsCount > 0 && !brw.keypressed && !cScrollBar.timerID) {
					brw.keypressed = true;
					reset_cover_timers();

					vk_pgdn();
					if (!cScrollBar.timerID) {
						cScrollBar.timerID = window.SetTimeout(function () {
							window.ClearTimeout(cScrollBar.timerID);
							cScrollBar.timerID = window.SetInterval(vk_pgdn, 100);
						}, 400);
					}
				}
				break;
			case VK_RETURN:
				plman.ExecutePlaylistDefaultAction(g_active_playlist, g_focus_id);
				break;
			case VK_END:
				if (brw.rowsCount > 0) {
					//var last_1st_group_row = brw.rowsCount - ppt.groupHeaderRowsNumber;
					//var new_focus_id = brw.rows[last_1st_group_row].playlistTrackId;

					var new_focus_id = brw.rows[brw.rows.length - 1].playlistTrackId;
					plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
				}
				break;
			case VK_HOME:
				if (brw.rowsCount > 0) {
					var new_focus_id = brw.rows[0].playlistTrackId;
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
				}
				break;
			case VK_DELETE:
				if (!plman.IsAutoPlaylist(g_active_playlist)) {
					plman.RemovePlaylistSelection(g_active_playlist, false);
					plman.RemovePlaylistSelection(g_active_playlist, false);
					plman.SetPlaylistSelectionSingle(g_active_playlist, plman.GetPlaylistFocusItemIndex(g_active_playlist), true);
				}
				break;
		}
	} else {
		switch (mask) {
			case KMask.shift:
				switch (vkey) {
					case VK_SHIFT: // SHIFT key alone
						brw.SHIFT_count = 0;
						break;
					case VK_UP: // SHIFT + KEY UP
						if (brw.SHIFT_count == 0) {
							if (brw.SHIFT_start_id == null) {
								brw.SHIFT_start_id = g_focus_id;
							}
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
							if (g_focus_id > 0) {
								brw.SHIFT_count--;
								g_focus_id--;
								plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
								plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
							}
						} else if (brw.SHIFT_count < 0) {
							if (g_focus_id > 0) {
								brw.SHIFT_count--;
								g_focus_id--;
								plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
								plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
							}
						} else {
							plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, false);
							brw.SHIFT_count--;
							g_focus_id--;
							plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
						}
						break;
					case VK_DOWN: // SHIFT + KEY DOWN
						if (brw.SHIFT_count == 0) {
							if (brw.SHIFT_start_id == null) {
								brw.SHIFT_start_id = g_focus_id;
							}
							plman.ClearPlaylistSelection(g_active_playlist);
							plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
							if (g_focus_id < brw.list.Count - 1) {
								brw.SHIFT_count++;
								g_focus_id++;
								plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
								plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
							}
						} else if (brw.SHIFT_count > 0) {
							if (g_focus_id < brw.list.Count - 1) {
								brw.SHIFT_count++;
								g_focus_id++;
								plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, true);
								plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
							}
						} else {
							plman.SetPlaylistSelectionSingle(g_active_playlist, g_focus_id, false);
							brw.SHIFT_count++;
							g_focus_id++;
							plman.SetPlaylistFocusItem(g_active_playlist, g_focus_id);
						}
						break;
				}
				break;
			case KMask.ctrl:
				if (vkey == 65) { // CTRL+A
					fb.RunMainMenuCommand("Edit/Select all");
					brw.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
					brw.repaint();
				}
				if (vkey == 66) { // CTRL+B
					cScrollBar.enabled = !cScrollBar.enabled;
					window.SetProperty("_DISPLAY: Show Scrollbar", cScrollBar.enabled);
					get_metrics();
					brw.repaint();
				}
				if (vkey == 84) { // CTRL+T
					ppt.showHeaderBar = !ppt.showHeaderBar;
					window.SetProperty("_DISPLAY: Show Top Bar", ppt.showHeaderBar);
					get_metrics();
					brw.scrollbar.updateScrollbar();
					brw.repaint();
				}
				if (vkey == 48 || vkey == 96) { // CTRL+0
					var previous = ppt.extra_font_size;
					if (!timers.mouseWheel) {
						ppt.extra_font_size = 0;
						if (previous != ppt.extra_font_size) {
							timers.mouseWheel = window.SetTimeout(function () {
								window.SetProperty("_SYSTEM: Extra font size value", ppt.extra_font_size);
								get_font();
								get_metrics();
								get_images();

								// refresh covers
								g_image_cache = new image_cache;
								var total = brw.groups.length;
								for (var i = 0; i < total; i++) {
									brw.groups[i].tid = -1;
									brw.groups[i].load_requested = 0;
									brw.groups[i].save_requested = false;
									brw.groups[i].cover_img = null;
									brw.groups[i].cover_type = null;
								}

								brw.repaint();
								timers.mouseWheel && window.ClearTimeout(timers.mouseWheel);
								timers.mouseWheel = false;
							}, 100);
						}
					}
				}
				break;
			case KMask.alt:
				break;
		}
	}
})

registerCallback("on_char", function (code) {
	// inputBox
	if (ppt.showHeaderBar && ppt.showFilterBox && g_filterbox.inputbox.visible) {
		g_filterbox.on_char(code);
	}
	else {
		if (brw.list.Count > 0) {
			brw.tt_x = ((brw.w) / 2) - (((cList.search_string.length * 13) + (10 * 2)) / 2);
			brw.tt_y = brw.y + Math.floor((brw.h / 2) - 30);
			brw.tt_w = ((cList.search_string.length * 13) + (10 * 2));
			brw.tt_h = 60;
			if (code == 32 && cList.search_string.length == 0)
				return true; // SPACE Char not allowed on 1st char
			if (cList.search_string.length <= 20 && brw.tt_w <= brw.w - 20) {
				if (code > 31) {
					cList.search_string = cList.search_string + String.fromCharCode(code).toUpperCase();
					brw.repaint();
					cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
					cList.clear_incsearch_timer = false;
					cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
					cList.incsearch_timer = window.SetTimeout(function () {
						brw.incrementalSearch();
						window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = false;
					}, 400);
				}
			}
		}
	}
})

//=================================================// Playback Callbacks
registerCallback("on_playback_stop", function (reason) {
	g_seconds = 0;
	g_time_remaining = null;
	g_metadb = null;

	switch (reason) {
		case 0: // user stop
		case 1: // eof (e.g. end of playlist)
			// update wallpaper
			g_wallpaperImg = setWallpaperImg();
			brw.repaint();
			break;
		case 2: // starting_another (only called on user action, i.e. click on next button)
			break;
	}

	g_radio_title = "loading live tag ...";
	g_radio_artist = "";
})

registerCallback("on_playback_new_track", function (metadb) {
	g_metadb = metadb;
	g_radio_title = "loading live tag ...";
	g_radio_artist = "";

	g_wallpaperImg = setWallpaperImg();
	brw.repaint();
})

registerCallback("on_playback_starting", function (cmd, is_paused) { })

registerCallback("on_playback_time", function (time) {
	g_seconds = time;
	g_time_remaining = ppt.tf_time_remaining.Eval(true);

	// radio Tags (live)
	if (g_metadb && g_metadb.Length < 0) {
		g_radio_title = fb.TitleFormat("%title%").Eval(true);
		g_radio_artist = fb.TitleFormat("$if2(%artist%,%bitrate%'K')").Eval(true);
	} else if (!g_metadb)
		g_metadb = fb.GetNowPlaying();

	if (brw.nowplaying_y + ppt.rowHeight > brw.y && brw.nowplaying_y < brw.y + brw.h) {
		brw.repaint();
	}
})

//=================================================// Playlist Callbacks
registerCallback("on_playlists_changed", function () {

	if (g_avoid_on_playlists_changed)
		return;

	if (pman.drop_done) {
		plman.ActivePlaylist = g_active_playlist;
	} else {
		if (g_active_playlist != plman.ActivePlaylist) {
			g_active_playlist = plman.ActivePlaylist;
		}
	}

	// refresh playlists list
	pman.populate(false, false);
})

registerCallback("on_playlist_switch", function () {

	if (pman.drop_done)
		return;

	g_active_playlist = plman.ActivePlaylist;
	g_focus_id = getFocusId(g_active_playlist);
	g_filterbox.clearInputbox();
	brw.populate(true);
	brw.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);

	// refresh playlists list
	pman.populate(false, false);
})

registerCallback("on_playlist_items_added", function (playlist_idx) {

	g_avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist = false;

	if (playlist_idx == g_active_playlist && !pman.drop_done) {
		g_focus_id = getFocusId(g_active_playlist);
		brw.populate(false);
	}
})

registerCallback("on_playlist_items_removed", function (playlist_idx, new_count) {

	if (playlist_idx == g_active_playlist && new_count == 0)
		brw.scrollbar.scroll = brw.scrollbar.scroll_ = 0;
	if (g_avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist)
		return;

	if (playlist_idx == g_active_playlist) {
		g_focus_id = getFocusId(g_active_playlist);
		brw.populate(true);
	}
})

registerCallback("on_playlist_items_reordered", function (playlist_idx) {
	if (playlist_idx == g_active_playlist) {
		g_focus_id = getFocusId(g_active_playlist);
		brw.populate(true);
	}
})

registerCallback("on_item_focus_change", function (playlist, from, to) {
	if (!brw.list || !brw || !brw.list)
		return;

	var save_focus_id = g_focus_id;
	g_focus_id = to;

	if (!g_avoid_on_item_focus_change) {
		if (playlist == g_active_playlist) {
			// Autocollapse handle
			if (ppt.autocollapse) { // && !center_focus_item
				if (from > -1 && from < brw.list.Count) {
					var old_focused_group_id = brw.getAlbumIdfromTrackId(from);
				} else {
					var old_focused_group_id = -1;
				}
				if (to > -1 && to < brw.list.Count) {
					var new_focused_group_id = brw.getAlbumIdfromTrackId(to);
				} else {
					var old_focused_group_id = -1;
				}
				if (new_focused_group_id != old_focused_group_id) {
					if (old_focused_group_id > -1) {
						brw.groups[old_focused_group_id].collapsed = true;
					}
					if (new_focused_group_id > -1) {
						brw.groups[new_focused_group_id].collapsed = false;
					}
					brw.setList();
					brw.scrollbar.updateScrollbar();
					if (brw.rowsCount > 0)
						brw.gettags(true);
				}
			}

			// if new focused track not totally visible, we scroll to show it centered in the panel
			g_focus_row = brw.getOffsetFocusItem(g_focus_id);
			if (g_focus_row < brw.scrollbar.scroll / ppt.rowHeight || g_focus_row > brw.scrollbar.scroll / ppt.rowHeight + brw.totalRowsVis - 0.1) {
				// var old = scroll;
				brw.scrollbar.scroll = (g_focus_row - Math.floor(brw.totalRowsVis / 2)) * ppt.rowHeight;
				brw.scrollbar.scroll = brw.check_scroll(brw.scrollbar.scroll);
				if (!ppt.enableFullScrollEffectOnFocusChange) {
					if (Math.abs(brw.scrollbar.scroll - brw.scrollbar.scroll_) > ppt.rowHeight * 5) {
						if (brw.scrollbar.scroll_ > brw.scrollbar.scroll) {
							brw.scrollbar.scroll_ = brw.scrollbar.scroll + ppt.rowHeight * 5;
						} else {
							brw.scrollbar.scroll_ = brw.scrollbar.scroll - ppt.rowHeight * 5;
						}
					}
				}
				/*
				if(!ppt.enableFullScrollEffectOnFocusChange && !ppt.autocollapse) {
				scroll_ = scroll + ppt.rowHeight * 5 * (from <= to ? -1 : 1);
				scroll_ = check_scroll(scroll_);
				};
				*/
				brw.scrollbar.updateScrollbar();
			}

			brw.metadblist_selection = plman.GetPlaylistSelectedItems(g_active_playlist);
			if (!isScrolling)
				brw.repaint();
		}
	}
})

registerCallback("on_metadb_changed", function (handles) {
	if (!brw.list)
		return;

	// rebuild list
	if (g_rating_updated) { // no repopulate if tag update is from rating click action in playlist
		g_rating_updated = false;
		// update track tags info to avoid a full populate
		if (g_rating_rowId > -1) {
			brw.rows[g_rating_rowId].tracktags = ppt.tf_track.EvalWithMetadb(brw.rows[g_rating_rowId].metadb);
			g_rating_rowId = -1;
		}
		window.Repaint();
	} else {
		if (!(handles.Count == 1 && handles[0].Length < 0)) {
			if (g_filterbox.filter_text.length > 0) {
				g_focus_id = 0;
				brw.populate(true);
				if (brw.rowsCount > 0) {
					var new_focus_id = brw.rows[0].playlistTrackId;
					plman.ClearPlaylistSelection(g_active_playlist);
					plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
					plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
				}
			} else {
				brw.populate(false);
			}
		}
	}
})

registerCallback("on_item_selection_change", function () {
	brw.repaint();
})

registerCallback("on_playlist_items_selection_change", function () {
	brw.repaint();
})

registerCallback("on_focus", function (is_focused) {
	if (is_focused) {
		plman.SetActivePlaylistContext();
		g_selHolder.SetPlaylistSelectionTracking();
	} else {
		brw.repaint();
	}
})

function getFocusId(playlistIndex) {
	return plman.GetPlaylistFocusItemIndex(playlistIndex);
}

function g_sendResponse() {

	if (g_filterbox.inputbox.text.length == 0) {
		g_filterbox.filter_text = "";
	} else {
		g_filterbox.filter_text = g_filterbox.inputbox.text;
	}

	// filter in current panel
	g_focus_id = 0;
	brw.populate(true);
	if (brw.rowsCount > 0) {
		var new_focus_id = brw.rows[0].playlistTrackId;
		plman.ClearPlaylistSelection(g_active_playlist);
		plman.SetPlaylistSelectionSingle(g_active_playlist, new_focus_id, true);
		plman.SetPlaylistFocusItem(g_active_playlist, new_focus_id);
	}
}

registerCallback("on_notify_data", function (name, info) {
	switch (name) {
		case "JSSmoothBrowser->JSSmoothPlaylist:avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist":
			g_avoid_on_playlist_items_removed_callbacks_on_sendItemToPlaylist = true;
			break;
	}
})


//=================================================// Drag'n'Drop Callbacks

registerCallback("on_drag_over", function (action, x, y, mask) {
	if (y < brw.y || (plman.ActivePlaylist > -1 && plman.IsPlaylistLocked(plman.Activeplaylist))) {
		action.Effect = 0;
	} else {
		action.Effect = 1;
	}
})

registerCallback("on_drag_drop", function (action, x, y, mask) {
	if (y < brw.y || (plman.ActivePlaylist > -1 && plman.IsPlaylistLocked(plman.Activeplaylist))) {
		action.Effect = 0;
	} else {
		var count = plman.PlaylistCount;
		if (count == 0 || plman.ActivePlaylist == -1) {
			plman.CreatePlaylist(count, "Dropped Items");
			action.Playlist = count;
			action.Base = 0;
		} else {
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			action.Playlist = plman.ActivePlaylist;
			action.Base = plman.PlaylistItemCount(plman.ActivePlaylist);
		}
		action.ToSelect = true;
		action.Effect = 1;
	}
});

// start
on_load();
