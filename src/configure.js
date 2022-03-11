export const colors = {
	text: 0,
	selectedText: 0,
	background: 0,
	selection: 0,
	highlight: 0
};

export const ColorMode = {
  Sys: 0,
  Fb: 1,
  Custom: 2
}

export const fonts = {
	name: "",
	size: 0,
	items: null,
	bold: null,
	box: null,
	group1: null,
	group2: null,
	rating: null,
	mood: null,
	guifx_found: false,
	wingdings2_found: false,
}

export const timers = {
	coverLoad: false,
	coverDone: false,
	mouseWheel: false,
	saveCover: false,
	mouseDown: false,
	showPlaylistManager: false,
	hidePlaylistManager: false
};

export const ppt = {
  tf_artist: fb.TitleFormat("%artist%"),
  tf_albumartist: fb.TitleFormat("%album artist%"),
	tf_groupkey: fb.TitleFormat(window.GetProperty("_PROPERTY: tf_groupkey", "[%date%] ^^ $if2(%album%,$if(%length%,'?',%path%)) ^^ %discnumber% ## [%artist%] ^^ %title% ^^ [%genre%] ^^ $if2(%album artist%,$if(%length%,'?',%title%))")),
	tf_track: fb.TitleFormat("%tracknumber% ^^ [%length%] ^^ $if2(%rating%,0) ^^ $trim([%mood%])"),
  tf_path: fb.TitleFormat("$directory_path(%path%)\\"),
  tf_crc: fb.TitleFormat("$crc32(%path%)"),
  tf_time_remaining: fb.TitleFormat("$if(%length%,-%playback_time_remaining%,'ON AIR')"),
	defaultRowHeight: window.GetProperty("_PROPERTY: Row Height", 36),
	doubleRowPixelAdds: 4,
	rowHeight: window.GetProperty("_PROPERTY: Row Height", 36),
  rowScrollStep: 3,
  scrollSmoothness: 2.5,
  refreshRate: 40,
  extraRowsNumber: window.GetProperty("_PROPERTY: Number of Extra Rows per Group", 0),
  minimumRowsNumberPerGroup: window.GetProperty("_PROPERTY: Number minimum of Rows per Group", 0),
  groupHeaderRowsNumber: window.GetProperty("_PROPERTY: Number of Rows for Group Header", 2),
  showHeaderBar: window.GetProperty("_DISPLAY: Show Top Bar", true),
  defaultHeaderBarHeight: 25,
  headerBarHeight: 25,
  autocollapse: window.GetProperty("_PROPERTY: Autocollapse groups", false),
  enableFullScrollEffectOnFocusChange: false,
	colorMode: window.GetProperty("_PROPERTY: Color Mode(0:sys,1:fb,2:user)", ColorMode.Custom),
  showgroupheaders: window.GetProperty("_DISPLAY: Show Group Headers", true),
  showwallpaper: window.GetProperty("_DISPLAY: Show Wallpaper", false),
  wallpaperalpha: 150,
  wallpaperblurred: window.GetProperty("_DISPLAY: Wallpaper Blurred", true),
  wallpaperblurvalue: 1.05,
  wallpapermode: window.GetProperty("_SYSTEM: Wallpaper Mode", 0),
  wallpaperpath: window.GetProperty("_PROPERTY: Default Wallpaper Path", ".\\user-components\\foo_spider_monkey_panel\\samples\\js-smooth\\images\\default.png"),
  extra_font_size: window.GetProperty("_SYSTEM: Extra font size value", 0),
  showFilterBox: window.GetProperty("_PROPERTY: Enable Playlist Filterbox in Top Bar", true),
  doubleRowText: window.GetProperty("_PROPERTY: Double Row Text Info", true),
  showArtistAlways: window.GetProperty("_DISPLAY: Show Artist in Track Row", true),
  showRating: window.GetProperty("_DISPLAY: Show Rating in Track Row", true),
  showMood: window.GetProperty("_DISPLAY: Show Mood in Track Row", true),
	enableTouchControl: window.GetProperty("_PROPERTY: Touch control", false)
};

Object.defineProperty(ppt, "enableCustomColors", {
	get: () => ppt.colorMode === ColorMode.Custom,
}
);
// ppt.enableCustomColors = () => {
// 	return ppt.colorMode === ColorMode.Custom;
// }
