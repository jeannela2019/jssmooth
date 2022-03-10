/// <reference path="../typings/fsmp.d.ts" />

import { AlbumArtId, fso, blendColors, cc_stringformat } from "./common";
import { colors, fonts, ppt, timers } from "./configure";

const LoadReq = {
	Notyet: 0,
	Loading: 1,
	Done: 2,
	Retrying: 3,
	Final: 4,
}

export class ImageCache {

	constructor(props) {
		this._cachelist = {}

		// Properties;
		this.discCache = props.discCache;
		this.cacheFolder = props.cacheFolder;
		this.imageSize = props.imageSize;
		this.tf_key = props.tf_key;
		this.stubImages = props.stubImages;

		// Saved states;
		this.prevMetadb;
		this.prevKey;
	}

	hit(key, metadb) {
		if (!key) { return null; }
		let cacheItem = this._cachelist[key];
		if (cacheItem == null) {
			cacheItem = {
				tid: -1,
				image: null,
				loadReq: LoadReq.Notyet,
			}
			this._cachelist[key] = cacheItem;
		}

		if (cacheItem && cacheItem.image) {
			return cacheItem.image;
		}

		// Load from disc cache.
		if (this.discCache && cacheItem.loadReq === LoadReq.Notyet && timers.coverLoad == null) {
			timers.coverLoad = setTimeout(() => {
				cacheItem.tid = gdi.LoadImageAsync(window.ID, this.cacheFolder + key);
				cacheItem.loadReq = LoadReq.Loading;
				clearTimeout(timers.coverLoad);
				timers.coverLoad = null;
			}, 30);
		}


		// Get album art.
		if (!this.discCache || cacheItem.loadReq === LoadReq.Done && timers.coverLoad == null) {
			timers.coverLoad = setTimeout(() => {
				utils.GetAlbumArtAsync(window.ID, metadb, AlbumArtId.front, false);
				cacheItem.loadReq = LoadReq.Retrying;
				clearTimeout(timers.coverLoad);
				timers.coverLoad = null;
			}, 30);
		}

		return this.stubImages.loading_draw;
	}

	clear() {
		clearTimeout(timers.coverLoad);
		timers.coverLoad = null;
		this.prevMetadb = null;
		this.prevKey = null;
		this._cachelist = {}
	}

	onLoadImageDone(tid, image, image_path) {
		for (let key in this._cachelist) {
			if (this._cachelist[key].tid === tid) {
				let cacheItem = this._cachelist[key];
				cacheItem.tid = -1;
				if (image) {
					// cacheItem.image = FormatCover(image, this.imageSize, this.imageSize);
					// FIXIT:
					cacheItem.image = FormatCover(image, 250, 250);
				}
				cacheItem.loadReq = LoadReq.Done;
				cacheItem.image_path = image_path;
				break;
			}
		}

	}

	onGetAlbumDone(metadb, art_id, image, image_path) {
		if (!metadb) return;
		if (!image && art_id === AlbumArtId.front) {
			if (timers.coverLoad == null) {
				timers.coverLoad = setTimeout(() => {
					utils.GetAlbumArtAsync(window.ID, metadb, AlbumArtId.disc, false);
					clearTimeout(timers.coverLoad);
					timers.coverLoad = null;
				}, 30);
			}
		} else {
			let key = this.tf_key.EvalWithMetadb(metadb);
			let cacheItem = this._cachelist[key];
			if (cacheItem == null || cacheItem === LoadReq.Final) {
				return;
			}
			cacheItem.loadReq === LoadReq.Final;
			cacheItem.art_id = art_id;
			cacheItem.image = (image ? FormatCover(image, this.imageSize, this.imageSize) : this.stubImages.noart);
			cacheItem.image_path = image_path;

			// Save to cache;
			setTimeout(() => {
				if (checkCache3(this.cacheFolder, key)) {
					//
				} else {
					if (image && image.Width > 600 && image.Height > 600) {
						let img = FormatCover(image, 600, 600);
						img.SaveAs(this.cacheFolder + key);
					}
				}
			}, 30);
		}

	}

	// Save cached image to disc only when image size is larger than 600x600.
	// Maybe 600x600 is a proper size, or make it configurable.
	saveImage(key, image) {
		setTimeout(() => {
			if (checkCache3(this.cacheFolder, key)) {
				//
			} else {
				if (image && image.Width > 600 && image.Height > 600) {
					let img = FormatCover(image, 600, 600);
					img.SaveAs(this.cacheFolder + key);
				}
			}
		}, 30);
	}

	deleteImage(key) {
		setTimeout(() => {
			if (checkCache3(this.cacheFolder, key)) {
				try {
					fso.DeleteFile(this.cacheFolder, key);
				} catch (e) {
					console.log(`deleteImage: ${e}`)
				}
			}
		})
	}
}

function FormatCover(image, w, h) {
	let w1 = image.Width;
	let h1 = image.Height;
	let srcRatio = w1 / h1;
	let dstRatio = w / h;
	let tw, th, crop, tempImg;
	if (srcRatio > dstRatio) {
		tw = (w1 * dstRatio) >> 0;
		crop = ((w1 - tw) / 2) >> 0;
		tempImg = image.Clone(crop, 0, tw, h1);
	} else {
		th = (w1 / dstRatio) >> 0;
		crop = ((h1 - th) / 2) >> 0;
		tempImg = image.Clone(0, crop, w1, th);
	}
	return tempImg.Resize(w, h, 2);
}

function checkCache3(cacheFolder, key) {
	return fso.FileExists(cacheFolder + key);
}

function createFolder(dir) {
	try {
		if (!fso.FolderExists(dir)) fso.CreateFolder(dir);
		return true;
	} catch (e) { }
	return false;
}


function checkFolder(dir) {
	let result, tmpFileLoc = "";
	const pattern = /(.*?)\\/gm;
	while ((result = pattern.exec(dir))) {
		tmpFileLoc = tmpFileLoc.concat(result[0]);
		if (!createFolder(tmpFileLoc)) { return false; }
	}
	return true;
}


function getStubImages(fonts, colors) {
	var nw = 250,
		nh = 250,
		txt = "NO\nCOVER";
	const images = {}
	let gb;

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

	return images;
}

// ======================//
const testCache = new ImageCache({
	discCache: true,
	cacheFolder: `${fb.ProfilePath}testcache\\`,
	imageSize: 250,
	tf_key: ppt.tf_key,
	stubImages: getStubImages(fonts, colors)
});
