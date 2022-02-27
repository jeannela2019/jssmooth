/// <reference path="../typings/fsmp.d.ts" />

import { AlbumArtId, fso } from "./common";

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

	/**
	 * Try to load image from _cachelist. if failed, will first try to load 
	 * from cache folder, then use fb's api to get albumart.
	 * @param {string} key 
	 * @param {FbMetadbHandle} metadb 
	 * @returns {GdiBitmap} 
	 */
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
		if (this.discCache && cacheItem.loadReq === LoadReq.Notyet && ImageCache.coverLoad < 0) {
			ImageCache.coverLoad = setTimeout(() => {
				cacheItem.tid = gdi.LoadImageAsync(window.ID, this.cacheFolder + key);
				cacheItem.loadReq = LoadReq.Loading;
				clearTimeout(ImageCache.coverLoad);
				ImageCache.coverLoad = -1;
			}, 30);
		}


		// Get album art.
		if (!this.discCache || cacheItem.loadReq === LoadReq.Done && ImageCache.coverLoad < 0) {
			ImageCache.coverLoad = setTimeout(() => {
				utils.GetAlbumArtAsync(window.ID, metadb, AlbumArtId.front, false);
				cacheItem.loadReq = LoadReq.Retrying;
				clearTimeout(ImageCache.coverLoad);
				ImageCache.coverLoad = -1;
			}, 30);
		}

		return this.stubImages.loading_draw;
	}

	clear() {
		clearTimeout(ImageCache.coverLoad);
		ImageCache.coverLoad = -1;
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
			if (ImageCache.coverLoad < 0) {
				ImageCache.coverLoad = setTimeout(() => {
					utils.GetAlbumArtAsync(window.ID, metadb, AlbumArtId.disc, false);
					clearTimeout(ImageCache.coverLoad);
					ImageCache.coverLoad = -1;
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

ImageCache.coverLoad = -1;
ImageCache.coverDone = -1;

ImageCache.resetTimers = function () {
	if (ImageCache.coverLoad !== -1) {
		clearTimeout(ImageCache.coverDone);
		ImageCache.coverDone = -1;
	}
}

// function FormatCover(image, w, h) {
//   if (!image || w <= 0 || h <= 0) return image;
//   return image.Resize(w, h, 2);
// }

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
