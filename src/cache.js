const timers = {
  coverLoad: null,
}

class CacheItem {
  constructor() {
    this.image
  }
}

const LoadReq = {
  None: 0,
  Front: 1,
  Disc: 2,
  Artist: 3,
  Cache: 4,
}

class ImageCache {
  constructor() {
    this._cachelist = {}
  }

  /**
   * 
   * @param {string} key 
   */
  hit(key) { }

}