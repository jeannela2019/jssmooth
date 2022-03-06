import { FontTypeCUI, FontTypeDUI } from "./common";
import { fonts, ppt } from "./configure";


const baseSize = 12;
const g_font_guifx_found = utils.CheckFont("guifx v2 transports");
const g_font_wingdings2_found = utils.CheckFont("wingdings 2");
const font_guifx = "guifx v2 transports";
const font_wingdings2 = "wingdings 2";

function getFbFonts() {
	if (window.InstanceType === 1) {
		return {
			items: window.GetFontDUI(FontTypeDUI.playlists),
			labels: window.GetFontDUI(FontTypeDUI.tabs)
		}
	} else {
		return {
			items: window.GetFontCUI(FontTypeCUI.items),
			labels: window.GetFontCUI(FontTypeCUI.labels)
		}
	}
}

export function updateFonts() {

	const { items, labels } = getFbFonts();

	try {
		fonts.name = items.Name;
		fonts.size = items.Size;
	} catch {
		fonts.name = "arial";
		fonts.size = 12;
	}

	fonts.size += ppt.extra_font_size;

	fonts.items = gdi.Font(fonts.name, fonts.size);
	fonts.bold = gdi.Font(fonts.name, fonts.size, 1);
	fonts.box = gdi.Font(fonts.name, fonts.size - 2, 1);

	ppt.zoompercent = Math.floor(fonts.size / baseSize * 100);

	fonts.group1 = gdi.Font(fonts.name, (fonts.size * 160 / 100), 1);
	fonts.group2 = gdi.Font(fonts.name, (fonts.size * 140 / 100), 0);

	if (g_font_guifx_found) {
		fonts.rating = gdi.Font(font_guifx, Math.round(fonts.size * 130 / 100), 0);
		fonts.mood = gdi.Font(font_guifx, Math.round(fonts.size * 130 / 100));
	} else if (g_font_wingdings2_found) {
		fonts.rating = gdi.Font(font_wingdings2, Math.round(fonts.size * 130 / 100));
		fonts.mood = gdi.Font(font_wingdings2, Math.round(fonts.size * 130 / 100));
	} else {
		fonts.rating = gdi.Font("arial", Math.round(fonts.size * 170 / 100));
		fonts.mood = gdi.Font("arial", Math.round(fonts.size * 120 / 100));
	}

}

export function $zoom(val) {
	return Math.round(val * ppt.zoompercent / 100);
}

export function $zoomfloor(val) {
	return Math.floor(val * ppt.zoompercent / 100);
}
