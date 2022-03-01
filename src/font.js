import { FontTypeCUI, FontTypeDUI } from "./common";
import { globalFonts as gf } from "./configure";
import { ppt } from "./configure";


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
		gf.name = items.Name;
		gf.size = items.Size;
	} catch {
		gf.name = "arial";
		gf.size = 12;
	}

	gf.size += ppt.extra_font_size;

	gf.items = gdi.Font(gf.name, gf.size);
	gf.bold = gdi.Font(gf.name, gf.size, 1);
	gf.box = gdi.Font(gf.name, gf.size - 2, 1);

	ppt.zoompercent = Math.floor(gf.size / baseSize * 100);

	gf.group1 = gdi.Font(gf.name, (gf.size * 160 / 100), 1);
	gf.group2 = gdi.Font(gf.name, (gf.size * 140 / 100), 0);

	if (g_font_guifx_found) {
		gf.rating = gdi.Font(font_guifx, Math.round(gf.size * 130 / 100), 0);
		gf.mood = gdi.Font(font_guifx, Math.round(gf.size * 130 / 100));
	} else if (g_font_wingdings2_found) {
		gf.rating = gdi.Font(font_wingdings2, Math.round(gf.size * 130 / 100));
		gf.mood = gdi.Font(font_wingdings2, Math.round(gf.size * 130 / 100));
	} else {
		gf.rating = gdi.Font("arial", Math.round(gf.size * 170 / 100));
		gf.mood = gdi.Font("arial", Math.round(gf.size * 120 / 100));
	}

}

export function $ZM(val) {
	return Math.round(val * ppt.zoompercent / 100);
}
