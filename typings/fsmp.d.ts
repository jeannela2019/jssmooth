/**
 * @typedef {number} float
 */
// type float = number;


/**
 * Evaluates the script in file.<br>
 * Similar to `eval({@link utils.ReadTextFile}(path))`, but provides more features:<br>
 * - Has `include guards` - script won't be evaluated a second time if it was evaluated before in the same panel.<br>
 * - Has script caching - script file will be read only once from filesystem (even if it is included from different panels).<br>
 * - Has better error reporting.<br>
 * <br>
 * Note: when the relative `path` is used it will be searched in the following paths:<br>
 * - `${current_package_path}/scripts/${path}`, if the panel uses a package script.<br>
 * - `${current_script_path}/${path}`, if the script is not a top-level `in-memory` script.<br>
 * - `${fb.ComponentPath}/${path}`, otherwise.
 *
 * @param {string} path Absolute or relative path to JavaScript file.
 * @param {object=} [options=undefined]
 * @param {boolean=} [options.always_evaluate=false] If true, evaluates the script even if it was included before.
 *
 * @example <caption>Include sample from `foo_spider_monkey_panel`</caption>
 * include('samples/complete/properties.js')
 */
declare function include(path: string, options?: { always_evaluate: boolean }): void;

/**
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/clearTimeout}.
 *
 * @param {number} timerID
 */
declare function clearTimeout(timerID: number): void;

/**
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/clearInterval}.
 *
 * @param {number} timerID
 */
declare function clearInterval(timerID: number): void;

/**
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setInterval}.
 *
 * @param {function()} func
 * @param {number} delay
 * @param {...*} func_args
 * @return {number}
 */
declare function setInterval(func: Function, delay: number, ...func_args: any[]): number;

/**
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout}.
 *
 * @param {function()} func
 * @param {number} delay
 * @param {...*} func_args
 * @return {number}
 *
 * @example
 * // See `samples/basic/Timer.js`
 */
declare function setTimeout(func: Function, delay: number, ...func_args: any[]): number

/**
 * Load ActiveX object.
 *
 * @constructor
 * @param {string} name
 *
 * @example
 * const xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
 */
interface ActiveXObject {

	new(name: string): ActiveXObject;


	/**
	 * Creates an `ActiveXObject` that contains an object of type (VT_ARRAY|SOME_TYPE).
	 *
	 * @static
	 *
	 * @param {Array<*>} arr An array that contains elements of primitive type.
	 * @param {number} element_variant_type A variant type of array elements.
	 *
	 * @return {ActiveXObject}
	 *
	 * @example
	 * let filename = 'x:\\file.bin';
	 * let bin_data = [0x01, 0x00, 0x00, 0x02]
	 * let com_bin_data = ActiveXObject.ActiveX_CreateArray(bin_data, 0x11) // VT_UI1
	 *
	 * let stm = new ActiveXObject('ADODB.Stream');
	 *
	 * stm.Open();
	 * stm.Type = 1; //adTypeBinary
	 * stm.Write(com_bin_data);
	 * stm.SaveToFile(filename, 2);
	 * stm.Close();
	 */
	ActiveX_CreateArray(arr: any[], element_variant_type: number): ActiveXObject;

	/**
	 * Emulates COM's weird behaviour of property accessors.
	 *
	 * @param {number|string} prop_name Name of the property or it's numeric index
	 * @return {*}
	 *
	 * @example
	 * some_activex.ActiveX_Get('property_name', 'additional_info').DoSmth();
	 * // in COM:
	 * // some_activex.Item('property_name', 'additional_info').DoSmth();
	 */
	ActiveX_Get(prop_name: string | number): any;

	/**
	 * Emulates COM's weird behaviour of property accessors.
	 *
	 * @param {number|string} prop_name Name of the property or it's numeric index
	 *
	 * @example
	 * some_activex.ActiveX_Set('property_name', 'new_value', 'additional_info');
	 * // in COM:
	 * // some_activex.Item('property_name', 'additional_info') = "new_value";
	 */
	ActiveX_Set(prop_name: string | number): void;
}


/**
 * @typedef {Object} ArtPromiseResult
 * @property {?GdiBitmap} image null on failure
 * @property {string} path path to image file (or track file if image is embedded)
 */
interface ArtPromiseResult {
	image: GdiBitmap | null;
	path: string
}

/**
 * Deprecated: use `for ... of` loop instead.
 *
 * @deprecated
 *
 * @constructor
 * @param {ActiveXObject} active_x_object Any ActiveX collection object.
 *
 * @example
 * let e = new Enumerator(active_x_object);
 * for (e.moveFirst(); !e.atEnd(); e.moveNext()) {
 *   console.log(e.item());
 * }
 */
interface Enumerator<T> {
	new(activex: ActiveXObject): Enumerator<T>;

	/**
	 * Returns a boolean value indicating if the enumerator has reached the end of the collection.
	 *
	 * @return {boolean}
	 */
	atEnd(): boolean;

	/**
	 * Returns the item at the current enumerator position.
	 *
	 * @return {*}
	 */
	item(): T;

	/**
	 * Resets enumerator position to the first item.
	 *
	 * @method
	 */
	moveFirst(): void;

	/**
	 * Moves enumerator position to the next item.
	 *
	 * @method
	 */
	moveNext(): void;
}

/**
 * @namespace
 */
interface Console {
	/**
	 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/Console/log}
	 *
	 * @param {...*} data
	 */
	log(...data: any[]): void;
}

declare var console: Console;

/**
 * Functions for controlling foobar2000 and accessing it's data.
 *
 * @namespace
 */
interface IFbUtils {
	/**
	 * @type {boolean}
	 *
	 * @example
	 * fb.AlwaysOnTop = !fb.AlwaysOnTop; // Toggles the current value.
	 */
	AlwaysOnTop: boolean;

	/**
	 * @type {string}
	 * @readonly
	 *
	 * @example
	 * console.log(fb.ComponentPath); // C:\Users\User\AppData\Roaming\foobar2000\user-components\foo_spider_monkey_panel\
	 */
	readonly ComponentPath: string

	/** @type {boolean} */
	CursorFollowPlayback: boolean;

	/**
	 * @type {string}
	 * @readonly
	 */
	readonly FoobarPath: string

	/**
	 * @type {boolean}
	 * @readonly
	 */
	IsPaused: boolean

	/**
	 * @type {boolean}
	 * @readonly
	 */
	IsPlaying: boolean

	/** @type {boolean} */
	PlaybackFollowCursor: boolean

	/**
	 * @type {float}
	 * @readonly
	 *
	 * @example
	 * console.log(fb.PlaybackLength); // 322.843414966166
	 *
	 * @example
	 * console.log(Math.round(fb.PlaybackLength)); // 323
	 */
	readonly PlaybackLength: number

	/**
	 * @type {float}
	 *
	 * @example
	 * fb.PlaybackTime = 60; // Jumps to the 1 minute mark.
	 */
	PlaybackTime: number

	/**
	 * @type {string}
	 * @readonly
	 */
	readonly ProfilePath: string

	/**
	 * 0 - None<br>
	 * 1 - Track<br>
	 * 2 - Album<br>
	 * 3 - Track/Album by Playback Order (only available in foobar2000 v1.3.8 and later)
	 *
	 * @type {number}
	 */
	ReplaygainMode: 0 | 1 | 2 | 3

	/**
	 * @type {boolean}
	 *
	 * @example
	 * fb.StopAfterCurrent = !fb.StopAfterCurrent; // Toggles the current value.
	 */
	StopAfterCurrent: boolean;

	/**
	 * @type {string}
	 * @readonly
	 *
	 * @example
	 * console.log(fb.Version)
	 * // 1.4.1
	 */
	Version: string;

	/**
	 * @type {float}
	 *
	 * @example
	 * fb.Volume = 0; // Sets the volume to max. -100 is the minimum.
	 */
	Volume: number

	/**
	 * @return {FbUiSelectionHolder}
	 */
	AcquireUiSelectionHolder(): FbUiSelectionHolder;

	/** @method */
	AddDirectory(): void;

	/** @method */
	AddFiles(): void;

	/**
	 * Checks Clipboard contents are handles or a file selection from Windows Explorer. Use in conjunction
	 * with {@link fb.GetClipboardContents}.
	 *
	 * @return {boolean}
	 */
	CheckClipboardContents(): boolean;

	/**
	 * Clears active playlist.<br>
	 * If you wish to clear a specific playlist, use {@link plman.ClearPlaylist}(playlistIndex).
	 */
	ClearPlaylist(): void;

	/**
	 * Note: items can then be pasted in other playlist viewers or in Windows Explorer as files.
	 *
	 * @param {FbMetadbHandleList} handle_list
	 * @return {boolean}
	 *
	 * @example <caption>Copy playlist items</caption>
	 * let handle_list = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
	 * fb.CopyHandleListToClipboard(handle_list);
	 *
	 * @example <caption>Cut playlist items</caption>
	 * let ap = plman.ActivePlaylist;
	 * if (!plman.GetPlaylistLockedActions(ap).includes('RemoveItems')) {
	 *    let handle_list = plman.GetPlaylistSelectedItems(ap);
	 *    if (fb.CopyHandleListToClipboard(handle_list)) {
	 *        plman.UndoBackup(ap);
	 *        plman.RemovePlaylistSelection(ap);
	 *    }
	 *  }
	 */
	CopyHandleListToClipboard(handle_list: FbMetadbHandleList): boolean

	/**
	 * @return {ContextMenuManager}
	 *
	 * @example
	 * // See `samples/basic/MainMenuManager All-In-One.js`, `samples/basic/Menu Sample.js`
	 */
	CreateContextMenuManager(): ContextMenuManager;

	/**
	 * Returns an empty handle list.<br>
	 * Deprecated: use {@link FbMetadbHandleList} constructor instead.
	 *
	 * @deprecated
	 *
	 * @return {FbMetadbHandleList}
	 */
	CreateHandleList(): FbMetadbHandleList;

	/**
	 * @return {MainMenuManager}
	 *
	 * @example
	 * // See `samples/basic/MainMenuManager All-In-One.js`, `samples/basic/Menu Sample.js`
	 */
	CreateMainMenuManager(): MainMenuManager;

	/**
	 * @param {string=} [name=''] Will be shown in console when used with {@link FbProfiler#Print} method.
	 * @return {FbProfiler}
	 */
	CreateProfiler(name?: string): FbProfiler;

	/**
	 * Invokes drag-n-drop operation (see {@link https://docs.microsoft.com/en-us/windows/win32/api/ole2/nf-ole2-dodragdrop}).<br>
	 * <br>
	 * Quick tips:<br>
	 * - If you need only to drag from your panel with copy (i.e. without physically moving them):
	 *      use only fb.DoDragDrop(handles, DROPEFFECT_COPY | DROPEFFECT_LINK).<br>
	 * - If you need only to receive drop to your panel with copy:
	 *      handle `on_drop_*()` callbacks, while setting action.effect argument to (DROPEFFECT_COPY | DROPEFFECT_LINK).<br>
	 * <br>
	 * Full drag-n-drop interface description:<br>
	 * - Drag-n-drop interface is based on Microsoft IDropSource and IDropTarget interfaces, so a lot of info (including examples) could be gathered from MSDN (IDropSource, IDropTarget, DoDragDrop, DROPEFFECT).<br>
	 * - Drag operation is started with DoDragDrop (whether it is called by your panel, or externally) with okEffects argument supplied.<br>
	 * - DoDragDrop blocks code execution until the drag operation is finished (callbacks will be called properly though). It returns effect from Action.Effect from on_drag_drop after completion.<br>
	 * - (Spider Monkey Panel specific) Drag operation is canceled when any mouse button is pressed.<br>
	 * - (Spider Monkey Panel specific) All mouse callbacks are suppressed during drag operation (including on_mouse_lbtn_up, but excluding on_mouse_mbtn_up and on_mouse_rbtn_up).<br>
	 * - Every drag callback receives Action argument. Action.Effect contains okEffects from DoDragDrop call. Action.Effect should be changed to the desired effect in the callback.
	 *   If the returned Action.Effect was not in okEffects or is equal to DROPEFFECT_NONE (=== 0), then drop will be denied:
	 *   cursor icon will be changed, on_drag_drop won't be called after releasing lmbtn, on_drag_leave will be called instead.<br>
	 * - DROPEFFECT_LINK should be used as fallback in case effect argument does not have DROPEFFECT_COPY (===1), since some external drops only allow DROPEFFECT_LINK effect.<br>
	 * - Changing effect on key modifiers is nice (to be in line with native Windows behaviour): see the example below.<br>
	 * <br>
	 * Note: due to the asynchronous nature of event handling, `fb.DoDragDrop()` might exit before `on_drag_drop` callback is triggered
	 * when dropping data on the same panel as the one that had a call to `fb.DoDragDrop()`.<br>
	 * <br>
	 * Related callbacks: {@link module:callbacks~on_drag_enter on_drag_enter, {@link module:callbacks~on_drag_drop on_drag_drop},
	 * {@link module:callbacks~on_drag_over on_drag_over}, {@link module:callbacks~on_drag_leave on_drag_leave}
	 *
	 * @param {number} window_id unused
	 * @param {FbMetadbHandleList} handle_list
	 * @param {number} effect Allowed effects.
	 * @param {object=} [options=undefined] Customization options for the data displayed in the drag window.
	 * @param {boolean=} [options.show_text=true] If true, will add track count text.
	 * @param {boolean=} [options.use_album_art=true] If true, will use album art of the focused item from dragged tracks (if available)
	 * @param {boolean=} [options.use_theming=true] If true, will use Windows drag window style. Album art and custom image are resized to fit when Windows style is active.
	 * @param {?GdiBitmap=} [options.custom_image=undefined] Custom dragging image. Will be also displayed if use_album_art is true, but there is no album art available.
	 * @return {number} Effect that was returned in {@link module:callbacks~on_drag_drop on_drag_drop}.
	 *
	 * @example
	 * // See `samples/basic/DragnDrop.js`
	 */
	DoDragDrop(window_id: number, handle_list: FbMetadbHandleList, effect?: number, options?: {
		show_text?: boolean
		use_album_art?: boolean;
		use_theming?: boolean;
		custom_image?: boolean;
	}): number;

	/** @method */
	Exit(): void

	/**
	 * Note: clipboard contents can be handles copied to the clipboard in other components,
	 * from {@link fb.CopyHandleListToClipboard} or a file selection, from Windows Explorer and etc.<br>
	 * <br>
	 * Performance note: validate clipboard content with {@link fb.CheckClipboardContents} before calling this method.
	 *
	 * @param {number=} [window_id=0] unused
	 * @return {FbMetadbHandleList}
	 *
	 * @example
	 * function on_mouse_rbtn_up(x, y) {
	 *    let ap = plman.ActivePlaylist;
	 *    let menu = window.CreatePopupMenu();
	 *    menu.AppendMenuItem(!plman.GetPlaylistLockedActions(ap).includes('AddItems') && fb.CheckClipboardContents() ? MF_STRING : MF_GRAYED, 1, "Paste"); // see Flags.js for MF_* definitions
	 *    let idx = menu.TrackPopupMenu(x, y);
	 *    if (idx == 1) {
	 *        let handle_list  = fb.GetClipboardContents();
	 *        plman.InsertPlaylistItems(ap, plman.PlaylistItemCount(ap), handle_list );
	 *    }
	 *    return true;
	 * }
	 */
	GetClipboardContents(window_id?: number): FbMetadbHandleList;

	/**
	 * Available only in foobar2000 v1.4 and above. Throws a script error on v1.3. * <br>
	 * Returns a JSON array in string form so you need to use JSON.parse() on the result.
	 * <br>
	 * Related methods: {@link fb.SetDSPPreset}.
	 *
	 * @return {string}
	 *
	 * @example
	 * let str = fb.GetDSPPresets();
	 * let arr = JSON.parse(str);
	 * console.log(JSON.stringify(arr, null, 4));
	 * // [
	 * //     {
	 * //         "active": false,
	 * //         "name": "High Filter"
	 * //     },
	 * //     {
	 * //         "active": true,
	 * //         "name": "R128 Compressor"
	 * //     },
	 * //     {
	 * //         "active": false,
	 * //         "name": "7.1 upmix"
	 * //     }
	 * // ]
	 */
	GetDSPPresets(): string;

	/**
	 * @param {boolean=} [force=true] When true, it will use the first item of the active playlist if it is unable to get the focus item.
	 * @return {FbMetadbHandle}
	 */
	GetFocusItem(force?: boolean): FbMetadbHandle;

	/**
	 * Returns all Media Library items as a handle list.
	 *
	 * @return {FbMetadbHandleList}
	 */
	GetLibraryItems(): FbMetadbHandleList;

	/**
	 * Note: do not use this while looping through a handle list. Use {@link FbMetadbHandleList#GetLibraryRelativePaths} instead. <br>
	 * <br>
	 * Returns an empty string when used on track not in Media Library
	 *
	 * @param {FbMetadbHandle} handle
	 * @return {string}
	 *
	 * @example
	 * // The foobar2000 Media Library is configured to watch "D:\Music" and the
	 * // path of the now playing item is "D:\Music\Albums\Artist\Some Album\Some Song.flac"
	 * let handle = fb.GetNowPlaying();
	 * console.log(fb.GetLibraryRelativePath(handle)); // Albums\Artist\Some Album\Some Song.flac*
	 */
	GetLibraryRelativePath(handle: FbMetadbHandle): string;

	/**
	 * Get handle of the now playing track.
	 *
	 * @return {?FbMetadbHandle} null, if nothing is being played.
	 */
	GetNowPlaying(): FbMetadbHandle | null;

	/**
	 * Available only in foobar2000 v1.4 and above. Throws a script error on v1.3. * <br>
	 * Returns a JSON array in string form so you need to use JSON.parse() on the result.
	 * <br>
	 * Related methods: {@link fb.SetOutputDevice}.
	 *
	 * @return {string}
	 *
	 * @example
	 * let str = fb.GetOutputDevices();
	 * let arr = JSON.parse(str);
	 * console.log(JSON.stringify(arr, null, 4));
	 * // [
	 * //     {
	 * //         "active": false,
	 * //         "device_id": "{5243F9AD-C84F-4723-8194-0788FC021BCC}",
	 * //         "name": "Null Output",
	 * //         "output_id": "{EEEB07DE-C2C8-44C2-985C-C85856D96DA1}"
	 * //     },
	 * //     {
	 * //         "active": true,
	 * //         "device_id": "{00000000-0000-0000-0000-000000000000}",
	 * //         "name": "Primary Sound Driver",
	 * //         "output_id": "{D41D2423-FBB0-4635-B233-7054F79814AB}"
	 * //     },
	 * //     {
	 * //         "active": false,
	 * //         "device_id": "{1C4EC038-97DB-48E7-9C9A-05FDED46847B}",
	 * //         "name": "Speakers (Sound Blaster Z)",
	 * //         "output_id": "{D41D2423-FBB0-4635-B233-7054F79814AB}"
	 * //     },
	 * //     {
	 * //         "active": false,
	 * //         "device_id": "{41B86272-3D6C-4A5A-8907-4FE7EBE39E7E}",
	 * //         "name": "SPDIF-Out (Sound Blaster Z)",
	 * //         "output_id": "{D41D2423-FBB0-4635-B233-7054F79814AB}"
	 * //     },
	 * //     {
	 * //         "active": false,
	 * //         "device_id": "{9CDC0FAE-2870-4AFA-8287-E86099D69076}",
	 * //         "name": "3 - BenQ BL3200 (AMD High Definition Audio Device)",
	 * //         "output_id": "{D41D2423-FBB0-4635-B233-7054F79814AB}"
	 * //     }
	 * // ]
	 * // As you can see, only one of the items in the array has "active"
	 * // set to true so that is the device you'd want to display the name of
	 * // or mark as selected in a menu.
	 */
	GetOutputDevices(): string;

	/**
	 * Note: use try/catch to handle invalid queries. An empty handle list will be returned if the query
	 * is valid but there are no results.
	 *
	 * @param {FbMetadbHandleList} handle_list
	 * @param {string} query
	 * @return {FbMetadbHandleList} Unsorted results.
	 *
	 * @example
	 * let a = fb.GetQueryItems(plman.GetPlaylistItems(plman.ActivePlaylist), "rating IS 5");
	 *
	 * @example
	 * let b = fb.GetQueryItems(fb.GetLibraryItems(), "rating IS 5");
	 */
	GetQueryItems(handle_list: FbMetadbHandleList, query: string): FbMetadbHandleList;

	/**
	 * Gets now playing or selected item according to settings in "File>Preferences>Display>Selection viewers".
	 *
	 * @return {?FbMetadbHandle}
	 */
	GetSelection(): FbMetadbHandle | null;

	/**
	 * Works like {@link fb.GetSelection}, but returns a handle list.<br>
	 *
	 * @param {number=} [flags=0] 1 - no now playing
	 * @return {FbMetadbHandleList}
	 */
	GetSelections(flags?: number): FbMetadbHandleList;

	/**
	 * Retrieves what the selection type is.
	 *
	 * @return {number} Possible values:<br>
	 *     0 - undefined (no item)<br>
	 *     1 - active_playlist_selection<br>
	 *     2 - caller_active_playlist<br>
	 *     3 - playlist_manager<br>
	 *     4 - now_playing<br>
	 *     5 - keyboard_shortcut_list<br>
	 *     6 - media_library_viewer
	 */
	GetSelectionType(): number;

	/**
	 * @return {boolean}
	 */
	IsLibraryEnabled(): boolean;

	/**
	 * Performance note: don't use in `on_paint`.
	 *
	 * @param {string} command Path to main menu item
	 * @return {boolean} true, if the item is checked.
	 *
	 * @example
	 * fb.RunMainMenuCommand("Playback/Scrobble Tracks"); // available with foo_scrobble
	 */
	IsMainMenuCommandChecked(command: string): boolean

	/**
	 * @param {FbMetadbHandle} handle
	 * @return {boolean}
	 *
	 * @example
	 * let np = fb.GetNowplaying();
	 * console.log(fb.IsMetadbInMediaLibrary(np)); // If false, playing track is not in Media Library.
	 */
	IsMetadbInMediaLibrary(handle: FbMetadbHandle): boolean

	/**
	 * Loads playlist from file. Equivalent to `File`>`Load Playlist...`.
	 *
	 * @method
	 */
	LoadPlaylist(): void

	/** @method */
	Next(): void

	/** @method */
	Pause(): void

	/** @method */
	Play(): void

	/** @method */
	PlayOrPause(): void

	/** @method */
	Prev(): void

	/** @method */
	Random(): void

	/**
	 * Registers a main menu item that will be displayed under `main menu`>`File`>`Spider Monkey Panel`>`Script commands`>`{Current panel name}`.<br>
	 * Being main menu item means you can bind it to global keyboard shortcuts, standard toolbar buttons, panel stack splitter buttons and etc.<br>
	 * Execution of the correspoding menu item will trigger {@link module:callbacks~on_main_menu_dynamic on_main_menu_dynamic} callback.<br>
	 * <br>
	 * Note: SMP uses a combination of panel name and command id to identify and bind the command. Hence all corresponding binds will fail
	 * if the id or the panel name is changed. This also means that collision WILL occur if there are two panels with the same name.<br>
	 * <br>
	 * Related methods: {@link fb.UnregisterMainMenuCommand}<br>
	 * Related callbacks: {@link module:callbacks~on_main_menu_dynamic on_main_menu_dynamic}
	 *
	 * @param {number} id
	 * @param {string} name
	 * @param {string=} [description='']
	 */
	RegisterMainMenuCommand(id: number, name: string, description?: string): void;

	/** @method */
	Restart(): void

	/**
	 * Shows context menu for currently played track.
	 *
	 * @param {string} command
	 * @param {number=} [flags=0]
	 *     0 - default (depends on whether SHIFT key is pressed, flag_view_reduced or flag_view_full is selected)<br>
	 *     4 - flag_view_reduced<br>
	 *     8 - flag_view_full. This can be useful if you need to run context commands the user may have hidden
	 *         using File>Preferences>Display>Context Menu<br>
	 * @return {boolean}
	 *
	 * @example
	 * fb.RunContextCommand("Properties");
	 */
	RunContextCommand(command: string, flags?: number): boolean

	/**
	 * Shows context menu for supplied tracks.
	 *
	 * @param {string} command
	 * @param {FbMetadbHandle|FbMetadbHandleList} handle_or_handle_list Handles on which to apply context menu
	 * @param {number=} flags Same flags as {@link fb.RunContextCommand}
	 * @return {boolean}
	 */
	RunContextCommandWithMetadb(command: string, handle_or_handle_list: FbMetadbHandle | FbMetadbHandleList, flags?: number): boolean

	/**
	 * @param {string} command
	 * @return {boolean}
	 *
	 * @example
	 * fb.RunMainMenuCommand("File/Add Location...");
	 */
	RunMainMenuCommand(command: string): boolean

	/** @method */
	SavePlaylist(): void

	/**
	 * Available only in foobar2000 v1.4 and above. Throws a script error on v1.3.<br>
	 * <br>
	 * Related methods: {@link fb.GetDSPPresets}.
	 *
	 * @param {number} idx
	 *
	 * @example
	 * let str = fb.GetDSPPresets();
	 * let arr = JSON.parse(str);
	 * let idx; // find the required DSP from `arr` and assign it to `idx`
	 * fb.SetDSPPreset(idx);
	 */
	SetDSPPreset(idx: number): void

	/**
	 * Available only in foobar2000 v1.4 and above. Throws a script error on v1.3.<br>
	 * <br>
	 * Related methods: {@link fb.GetOutputDevices}.
	 *
	 * @param {string} output
	 * @param {string} device
	 *
	 * @example
	 * // To actually change device, you'll need the device_id and output_id
	 * // and use them with fb.SetOutputDevice.
	 * let str = fb.GetOutputDevices();
	 * let arr = JSON.parse(str);
	 * // Assuming same list from above, switch output to the last device.
	 * fb.SetOutputDevice(arr[4].output_id, arr[4].device_id);
	 */
	SetOutputDevice(output: string, device: string): void

	/** @method */
	ShowConsole(): void

	/**
	 * Opens the Library>Search window populated with the query you set.
	 *
	 * @param {string} query
	 */
	ShowLibrarySearchUI(query: string): void;

	/**
	 * @param {string} message
	 * @param {string=} [title='Spider Monkey Panel']
	 */
	ShowPopupMessage(message: string, title?: string): void

	/** @method */
	ShowPreferences(): void

	/** @method */
	Stop(): void

	/**
	 * Performance note: if you use the same query frequently,
	 * try caching FbTitleFormat object (by storing it somewhere),
	 * instead of creating it every time.
	 *
	 * @param {string} expression
	 * @return {FbTitleFormat}
	 */
	TitleFormat(expression: string): FbTitleFormat;

	/**
	 * Unregisters a main menu item.<br>
	 * <br>
	 * Related methods: {@link fb.RegisterMainMenuCommand}
	 *
	 * @param {number} id
	 */
	UnregisterMainMenuCommand(id: number, name: string, description?: string): number

	/** @method */
	VolumeDown(): void;

	/** @method */
	VolumeMute(): void

	/** @method */
	VolumeUp(): void;
}

declare var fb: IFbUtils;

/**
 * Functions for working with graphics. Most of them are wrappers for Gdi and GdiPlus methods.
 *
 * @namespace
 */
interface IGdiUtils {

	/**
	 * @param {number} w
	 * @param {number} h
	 * @return {GdiBitmap}
	 */
	CreateImage(w: number, h: number): GdiBitmap;

	/**
	 * Performance note: avoid using inside `on_paint`.<br>
	 * Performance note II: try caching and reusing `GdiFont` objects,
	 * since the maximum amount of such objects is hard-limited by Windows.
	 * `GdiFont` creation will fail after reaching this limit.
	 *
	 * @param {string} name
	 * @param {number} size_px See Helper.js > Point2Pixel function for conversions
	 * @param {number=} [style=0] See Flags.js > FontStyle
	 * @return {?GdiFont} null, if font is not present.
	 */
	Font(name: string, size_px: number, style?: number): GdiFont;

	/**
	 * Load image from file.<br>
	 * <br>
	 * Performance note: consider using {@link gdi.LoadImageAsync} or {@link gdi.LoadImageAsyncV2} if there are a lot of images to load
	 * or if the image is big.
	 *
	 * @param {string} path
	 * @return {?GdiBitmap} null, if image failed to load.
	 *
	 * @example
	 * let img = gdi.Image('e:\\images folder\\my_image.png');
	 */
	Image(path: string): GdiBitmap | null;

	/**
	 * Load image from file asynchronously.
	 *
	 * @param {number} window_id unused
	 * @param {string} path
	 * @return {number} a unique id, which is used in {@link module:callbacks~on_load_image_done on_load_image_done}.
	 *
	 * @example
	 * // See `samples/basic/LoadImageAsync.js`
	 */
	LoadImageAsync(window_id: number, path: string): number

	/**
	 * Load image from file asynchronously.
	 * Returns a `Promise` object, which will be resolved when image loading is done.
	 *
	 * @param {number} window_id unused
	 * @param {string} path
	 * @return {Promise.<?GdiBitmap>}
	 *
	 * @example
	 * // See `samples/basic/LoadImageAsyncV2.js`
	 */
	LoadImageAsyncV2(window_id: number, path: string): Promise<GdiBitmap | null>;
}

declare var gdi: IGdiUtils;

/**
 * Functions for managing foobar2000 playlists.
 *
 * @namespace
 */
interface IPlaylistManager {

	/**
	 * -1 if there is no active playlist.
	 *
	 * @type {number}
	 *
	 * @example
	 * console.log(plman.ActivePlaylist);
	 *
	 * @example
	 * plman.ActivePlaylist = 1; // Switches to 2nd playlist.
	 */
	ActivePlaylist: number;

	/**
	 * 0 - Default<br>
	 * 1 - Repeat (Playlist)<br>
	 * 2 - Repeat (Track)<br>
	 * 3 - Random<br>
	 * 4 - Shuffle (tracks)<br>
	 * 5 - Shuffle (albums)<br>
	 * 6 - Shuffle (folders)
	 *
	 * @type {number}
	 */
	PlaybackOrder: 0 | 1 | 2 | 3 | 4 | 5 | 6;


	/**
	 * -1 if there is no playing playlist.
	 *
	 * @type {number}
	 *
	 * @example
	 * console.log(plman.PlayingPlaylist);
	 */
	PlayingPlaylist: number;

	/**
	 * @type {number}
	 * @readonly
	 */
	readonly PlaylistCount: number;

	/**
	 * A Recycle Bin for playlists.
	 *
	 * @type {FbPlaylistRecycler}
	 * @readonly
	 */
	readonly PlaylistRecycler: FbPlaylistRecycler;

	/**
	 * This operation is asynchronous and may take some time to complete if it's a large array.
	 *
	 * @param {number} playlistIndex
	 * @param {Array<string>} paths An array of files/URLs
	 * @param {boolean=} [select=false]
	 *        If true, the active playlist will be set to the playlistIndex, the items will
	 *        be selected and focus will be set to the first new item.
	 *
	 * @example
	 * plman.AddLocations(plman.ActivePlaylist, ["e:\\1.mp3"]);
	 * // This operation is asynchronous, so any code in your script directly
	 * // after this line will run immediately without waiting for the job to finish.
	 */
	AddLocations(playlistIndex: number, paths: string[], select?: boolean): void;

	/**
	 * @param {number} playlistIndex
	 *
	 * @example
	 * plman.ClearPlaylist(plman.PlayingPlaylist);
	 */
	ClearPlaylist(playlistIndex: number): void;

	/**
	 * @param {number} playlistIndex
	 *
	 * @example
	 * plman.ClearPlaylistSelection(plman.ActivePlaylist);
	 */
	ClearPlaylistSelection(playlistIndex: number): void;

	/**
	 * @param {number} playlistIndex
	 * @param {string} name Name for the new autoplaylist.
	 * @param {string} query Title formatting pattern for forming the playlist content.
	 * @param {string=} [sort=''] Title formatting pattern for sorting.
	 * @param {number=} [flags=0] 1 - when set, will keep the autoplaylist sorted and prevent user from reordering it.
	 * @return {number} Index of the created playlist.
	 */
	CreateAutoPlaylist(playlistIndex: number, name: string, query: string, sort?: string, flags?: number): number;

	/**
	 * @param {number} playlistIndex
	 * @param {string} name
	 * @return {number} Index of the created playlist.
	 *
	 * @example
	 * // Creates a new playlist named "New playlist", which is put at the beginning of the current playlists.
	 * plman.CreatePlaylist(0, '');
	 *
	 * @example
	 * // Create a new playlist named "my favourites", which is put at the end.
	 * plman.CreatePlaylist(plman.PlaylistCount, 'my favourites');
	 */
	CreatePlaylist(playlistIndex: number, name: string): number;

	/**
	 * Note: the duplicated playlist gets inserted directly after the source playlistIndex.<br>
	 * It only duplicates playlist content, not the properties of the playlist (e.g. Autoplaylist).
	 *
	 * @param {number} playlistIndex
	 * @param {?string=} [name] A name for the new playlist. If the name is "" or undefined, the name of the source playlist will be used.
	 * @return {number} Index of the created playlist.
	 */
	DuplicatePlaylist(playlistIndex: number, name?: string): number;

	/**
	 * Signals playlist viewers to display the track (e.g. by scrolling to it's position).
	 *
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 */
	EnsurePlaylistItemVisible(playlistIndex: number, playlistItemIndex: number): void;

	/**
	 * Starts playback by executing default doubleclick/enter action unless overridden by a lock to do something else.
	 *
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 * @return {boolean} -1 on failure.
	 */
	ExecutePlaylistDefaultAction(playlistIndex: number, playlistItemIndex: number): boolean;

	/**
	 * Returns playlist index of the named playlist or creates a new one, if not found.<br>
	 * If a new playlist is created, the playlist index of that will be returned.
	 *
	 * @param {string} name
	 * @param {boolean} unlocked If true, locked playlists are ignored when looking for existing playlists.
	 *                           If false, the playlistIndex of any playlist with the matching name will be returned.
	 * @return {number} Index of the found or created playlist.
	 */
	FindOrCreatePlaylist(name: string, unlocked: boolean): number;

	/**
	 * @param {string} name Case insensitive.
	 * @return {number} Index of the found playlist on success, -1 on failure.
	 */
	FindPlaylist(name: string): number;

	/**
	 * Retrieves playlist position of currently playing item.<br>
	 * On failure, the property {@link FbPlayingItemLocation#IsValid} will be set to false.
	 *
	 * @return {FbPlayingItemLocation}
	 */
	GetPlayingItemLocation(): FbPlayingItemLocation;

	/**
	 * @param {number} playlistIndex
	 * @return {number} Returns -1 if nothing is selected
	 *
	 * @example
	 * let focus_item_index = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist); // 0 would be the first item
	 */
	GetPlaylistFocusItemIndex(playlistIndex: number): number;

	/**
	 * @param {number} playlistIndex
	 * @return {FbMetadbHandleList}
	 *
	 * @example
	 * let handle_list = plman.GetPlaylistItems(plman.PlayingPlaylist);
	 */
	GetPlaylistItems(playlistIndex: number): FbMetadbHandleList;

	/**
	 * Returns the list of blocked actions
	 *
	 * @param {number} playlistIndex
	 * @return {Array<string>} May contain the following:<br>
	 *   - 'AddItems'<br>
	 *   - 'RemoveItems'<br>
	 *   - 'ReorderItems'<br>
	 *   - 'ReplaceItems'<br>
	 *   - 'RenamePlaylist'<br>
	 *   - 'RemovePlaylist'<br>
	 *   - 'ExecuteDefaultAction'
	 */
	GetPlaylistLockedActions(playlistIndex: number): string[];

	/**
	 * @param {number} playlistIndex
	 * @return {?string} name of lock owner if there is a lock, null otherwise
	 */
	GetPlaylistLockName(playlistIndex: number): string | null;

	/**
	 * @param {number} playlistIndex
	 * @return {string}
	 *
	 * @example
	 * console.log(plman.GetPlaylistName(plman.ActivePlaylist));
	 */
	GetPlaylistName(playlistIndex: number): string;

	/**
	 * @param {number} playlistIndex
	 * @return {FbMetadbHandleList}
	 *
	 * @example
	 * let selected_items = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
	 */
	GetPlaylistSelectedItems(playlistIndex: number): number;

	/**
	 * @param {number} playlistIndex
	 * @param {number} base Position in playlist
	 * @param {FbMetadbHandleList} handle_list Items to insert
	 * @param {boolean=} [select=false] If true then inserted items will be selected
	 *
	 * @example <caption>Add all library tracks to the beginning of playlist.</caption>
	 * let ap = plman.ActivePlaylist;
	 * plman.InsertPlaylistItems(ap, 0, fb.GetLibraryItems());
	 *
	 * @example <caption>Add all library tracks to end of playlist.</caption>
	 * let ap = plman.ActivePlaylist;
	 * plman.InsertPlaylistItems(ap, plman.PlaylistItemCount(ap), fb.GetLibraryItems());
	 */
	InsertPlaylistItems(playlistIndex: number, base: number, handle_list: FbMetadbHandleList, select?: boolean): void;

	/**
	 * Same as {@link plman.InsertPlaylistItems} except any duplicates contained in handle_list are removed.
	 *
	 * @param {number} playlistIndex
	 * @param {number} base Position in playlist
	 * @param {FbMetadbHandleList} handle_list Items to insert
	 * @param {boolean=} [select=false] If true then inserted items will be selected
	 */
	InsertPlaylistItemsFilter(playlistIndex: number, base: number, handle_list: FbMetadbHandleList, select?: boolean): void;

	/**
	 * @param {number} playlistIndex
	 * @return {boolean}
	 */
	IsAutoPlaylist(playlistIndex: number): boolean;

	/**
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 * @return {boolean}
	 */
	IsPlaylistItemSelected(playlistIndex: number, playlistItemIndex: number): boolean;

	/**
	 * Note: returns true, if the playlist is an autoplaylist. To determine if a playlist is not an autoplaylist,
	 * but locked with something like `foo_utils` or `foo_playlist_attributes`, use with conjunction of {@link plman.IsAutoPlaylist}.
	 * <br>
	 * Deprecated: use {@link plman.GetPlaylistLockedActions}.
	 *
	 * @deprecated
	 *
	 * @param {number} playlistIndex
	 * @return {boolean}
	 */
	IsPlaylistLocked(playlistIndex: number): boolean

	/**
	 * Returns whether a redo restore point is available for specified playlist.
	 * <br>
	 * Related methods: {@link plman.IsUndoAvailable}, {@link plman.Redo}, {@link plman.Undo}, {@link plman.UndoBackup}
	 *
	 * @param {number} playlistIndex
	 * @return {boolean}
	 */
	IsRedoAvailable(playlistIndex: number): boolean

	/**
	 * Returns whether an undo restore point is available for specified playlist.
	 * <br>
	 * Related methods: {@link plman.IsRedoAvailable}, {@link plman.Redo}, {@link plman.Undo}, {@link plman.UndoBackup}
	 *
	 * @param {number} playlistIndex
	 * @return {boolean}
	 */
	IsUndoAvailable(playlistIndex: number): void

	/**
	 * @param {number} from
	 * @param {number} to
	 * @return {boolean}
	 */
	MovePlaylist(from: number, to: number): boolean

	/**
	 * @param {number} playlistIndex
	 * @param {number} delta
	 * @return {boolean}
	 *
	 * @example
	 * // Moves selected items to end of playlist.
	 * plman.MovePlaylistSelection(plman.ActivePlaylist, plman.PlaylistItemCount(plman.ActivePlaylist));
	 */
	MovePlaylistSelection(playlistIndex: number, delta: number): boolean;

	/**
	 * @param {number} playlistIndex
	 * @return {number}
	 *
	 * @example
	 * console.log(plman.PlaylistItemCount(plman.PlayingPlaylist)); // 12
	 */
	PlaylistItemCount(playlistIndex: number): number;

	/**
	 * Reverts specified playlist to the next redo restore point and generates an undo restore point.<br>
	 * Note: revert operation may be not applied if the corresponding action is locked.
	 * Use {@link plman.GetPlaylistLockedActions} to check if there are any locks present.<br>
	 * <br>
	 * Related methods: {@link plman.IsRedoAvailable}, {@link plman.IsUndoAvailable}, {@link plman.Undo}, {@link plman.UndoBackup}
	 *
	 * @param {number} playlistIndex
	 */
	Redo(playlistIndex: number): void

	/**
	 * Removes the specified playlist.<br>
	 * Note: if removing the active playlist, no playlist will be active after using this. You'll
	 * need to set it manually or use {@link plman.RemovePlaylistSwitch} instead.
	 *
	 * @param {number} playlistIndex
	 * @return {boolean}
	 */
	RemovePlaylist(playlistIndex: number): boolean

	/**
	 * @param {number} playlistIndex
	 * @param {boolean=} [crop=false] If true, then removes items that are NOT selected.
	 *
	 * @example <Remove selected items from playlist>
	 * plman.RemovePlaylistSelection(plman.ActivePlaylist);
	 *
	 * @example <Remove items that are NOT selected>
	 * plman.RemovePlaylistSelection(plman.ActivePlaylist, true);
	 */
	RemovePlaylistSelection(playlistIndex: number, crop?: boolean): void

	/**
	 * Removes the specified playlist.<br>
	 * This automatically sets another playlist as active if removing the active playlist.
	 *
	 * @param {number} playlistIndex
	 * @return {boolean}
	 */
	RemovePlaylistSwitch(playlistIndex: number): boolean;

	/**
	 * @param {number} playlistIndex
	 * @param {string} name
	 * @return {boolean}
	 */
	RenamePlaylist(playlistIndex: number, name: string): boolean;

	/**
	 * Workaround so you can use the Edit menu or run {@link fb.RunMainMenuCommand}("Edit/Something...")
	 * when your panel has focus and a dedicated playlist viewer doesn't.
	 *
	 * @example
	 * plman.SetActivePlaylistContext(); // once on startup
	 *
	 * function on_focus(is_focused) {
	 *    if (is_focused) {
	 *        plman.SetActivePlaylistContext(); // When the panel gets focus but not on every click
	 *    }
	 * }
	 */
	SetActivePlaylistContext(): void;

	/**
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 *
	 * @example
	 * plman.SetPlaylistFocusItem(plman.ActivePlaylist, 0);
	 */
	SetPlaylistFocusItem(playlistIndex: number, playlistItemIndex: number): void;

	/**
	 * @param {number} playlistIndex
	 * @param {FbMetadbHandle} handle
	 *
	 * @example
	 * let ap = plman.ActivePlaylist;
	 * let handle = plman.GetPlaylistItems(ap)[1]; // 2nd item in playlist
	 * plman.SetPlaylistFocusItemByHandle(ap, handle);
	 */
	SetPlaylistFocusItemByHandle(playlistIndex: number, handle: FbMetadbHandle): void;

	/**
	 * Blocks requested actions.<br>
	 * Note: the lock can be changed only if there is no lock or if it's owned by `foo_spider_monkey_panel`.
	 * The owner of the lock can be checked via {@link plman.GetPlaylistLockName}.
	 *
	 *
	 * @param {number} playlistIndex
	 * @param {Array<string>} lockedActions May contain the following:<br>
	 *   - 'AddItems'<br>
	 *   - 'RemoveItems'<br>
	 *   - 'ReorderItems'<br>
	 *   - 'ReplaceItems'<br>
	 *   - 'RenamePlaylist'<br>
	 *   - 'RemovePlaylist'<br>
	 *   - 'ExecuteDefaultAction'
	 */
	SetPlaylistLockedActions(playlistIndex: number, lockedActions: string[]): void;

	/**
	 * @param {number} playlistIndex
	 * @param {Array<number>} affectedItems An array of item indexes.
	 * @param {boolean} state
	 *
	 * @example
	 * // Selects first, third and fifth tracks in playlist. This does not affect other selected items.
	 * plman.SetPlaylistSelection(plman.ActivePlaylist, [0, 2, 4], true);
	 */
	SetPlaylistSelection(playlistIndex: number, affectedItems: number[], state: boolean): void;

	/**
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 * @param {boolean} state
	 *
	 * @example
	 * // Deselects first playlist item. Only works when it is already selected!
	 * plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, 0, false);
	 *
	 * @example
	 * let ap = plman.ActivePlaylist;
	 * // Selects last item in playlist. This does not affect other selected items.
	 * plman.SetPlaylistSelectionSingle(ap, plman.PlaylistItemCount(ap) - 1, true);
	 */
	SetPlaylistSelectionSingle(playlistIndex: number, playlistItemIndex: number, state: boolean): void;

	/**
	 * Shows popup window letting you edit certain autoplaylist properties.<br>
	 * Before using, check if your playlist is an autoplaylist by using {@link plman.IsAutoPlaylist};
	 *
	 * @param {number} playlistIndex
	 * @return {boolean}
	 *
	 * @example
	 * fb.ShowAutoPlaylistUI(plman.ActivePlaylist);
	 */
	ShowAutoPlaylistUI(playlistIndex: number): boolean;

	/**
	 * @param {number} playlistIndex Index of playlist to alter.
	 * @param {string} pattern Title formatting pattern to sort by. Set to "" to randomise the order of items.
	 * @param {boolean=} [selected_items_only=false]
	 * @return {boolean} true on success, false on failure (playlist locked etc).
	 */
	SortByFormat(playlistIndex: number, pattern: string, selected_items_only?: boolean): boolean;

	/**
	 * @param {number} playlistIndex Index of playlist to alter.
	 * @param {string} pattern Title formatting pattern to sort by.
	 * @param {number=} [direction=1]
	 *     1 - ascending<br>
	 *     -1 - descending<br>
	 * @return {boolean}
	 */
	SortByFormatV2(playlistIndex: number, pattern: string, direction?: number): boolean

	/**
	 * @param {number=} [direction=1]
	 *     1 - ascending;<br>
	 *     -1 - descending<br>
	 */
	SortPlaylistsByName(direction?: number): void

	/**
	 * Reverts specified playlist to the last undo restore point and generates a redo restore point.<br>
	 * Note: revert operation may be not applied if the corresponding action is locked.
	 * Use {@link plman.GetPlaylistLockedActions} to check if there are any locks present.<br>
	 * <br>
	 * Related methods: {@link plman.IsRedoAvailable}, {@link plman.IsUndoAvailable}, {@link plman.Redo}, {@link plman.UndoBackup}
	 *
	 * @param {number} playlistIndex
	 */
	Undo(playlistIndex: number): void

	/**
	 * Creates an undo restore point for the specified playlist. This will enable `Edit`>`Undo` menu item after calling other {@link plman} methods that change playlist content.<br>
	 * Note: this method should be called before performing modification to the playlist.<br>
	 * <br>
	 * Related methods: {@link plman.IsRedoAvailable}, {@link plman.IsUndoAvailable}, {@link plman.Redo}, {@link plman.Undo}
	 *
	 * @param {number} playlistIndex
	 */
	UndoBackup(playlistIndex: number): void

	/**
	 * @param {FbMetadbHandle} handle
	 */
	AddItemToPlaybackQueue(handle: FbMetadbHandle): void

	/**
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 */
	AddPlaylistItemToPlaybackQueue(playlistIndex: number, playlistItemIndex: number): void;

	/**
	 * @param {FbMetadbHandle} handle
	 * @param {number} playlistIndex
	 * @param {number} playlistItemIndex
	 * @return {number} Returns position in queue on success, -1 if track is not in queue.
	 */
	FindPlaybackQueueItemIndex(handle: FbMetadbHandle, playlistIndex: number, playlistItemIndex: number): number

	/** @method */
	FlushPlaybackQueue(): void

	/**
	 * @return {Array<FbPlaybackQueueItem>}
	 *
	 * @example
	 * let contents = plman.GetPlaybackQueueContents();
	 * if (contents.length) {
	 *     // access properties of first item
	 *     console.log(contents[0].PlaylistIndex, contents[0].PlaylistItemIndex);
	 * }
	 */
	GetPlaybackQueueContents(): FbPlaybackQueueItem[]

	/**
	 * @return {FbMetadbHandleList}
	 *
	 * @example
	 * let handles = plman.GetPlaybackQueueHandles();
	 * if (handles.Count > 0) {
	 *    // use "Count" to determine if Playback Queue is active.
	 * }
	 */
	GetPlaybackQueueHandles(): FbMetadbHandleList;

	/**
	 * @param {number} index
	 */
	RemoveItemFromPlaybackQueue(index: number): void

	/**
	 * @param {Array<number>} affectedItems Array like [1, 3, 5]
	 */
	RemoveItemsFromPlaybackQueue(affectedItems: number[]): void
}

declare var plman: IPlaylistManager;


/**
 * Note: returned directories are not guaranteed to exist.
 *
 * @property {string} Root Root directory of the package
 * @property {string} Assets Directory inside package folder that contains assets
 * @property {string} Scripts Directory inside package folder that contains scripts
 * @property {string} Storage Persistent and unique directory inside foobar2000 profile folder that can be used to store runtime data (e.g. cache)
 */
interface JsPackageDirs {
	Root: string;
	Assets: string;
	Scripts: string;
	Storage: string;
}

/**
 * Return value of {@link window.GetPackageInfo}.<br>
 *
 * @typedef {Object} JsPackageInfo
 * @property {string} Version Package version
 * @property {JsPackageDirs} Directories Package directories
 */
interface JsPackageInfo {
	Version: string;
	Directories: JsPackageDirs;
}


/**
 * Return value of {@link window.JsMemoryStats}.<br>
 *
 * @property {number} MemoryUsage Memory usage of the current panel (in bytes)
 * @property {number} TotalMemoryUsage Total memory usage of all panels (in bytes)
 * @property {number} TotalMemoryLimit
 *    Maximum allowed memory usage for the component (in bytes).<br>
 *    If the total memory usage exceeds this value, all panels will fail with OOM error.
 */
interface JsMemoryStats {
	MemoryUsage: number;
	TotalMemoryUsage: number;
	TotalMemoryLimit: number
}

/**
 * Various utility functions.
 *
 * @namespace
 */
interface IUtils {

	/**
	 * A string corresponding to the version.
	 *
	 * Component uses semantic versioning (see {@link https://semver.org}).
	 *
	 * @type {string}
	 *
	 * @example
	 * function is_compatible(requiredVersionStr) {
	 *     let requiredVersion = requiredVersionStr.split('.');
	 *     let currentVersion = utils.Version.split('.'); // e.g. 0.1.0-alpha.2
	 *     if (currentVersion.length > 3) {
	 *         currentVersion.length = 3; // We need only numbers
	 *     }
	 *
	 *     for(let i = 0; i< currentVersion.length; ++i) {
	 *       if (currentVersion[i] != requiredVersion[i]) {
	 *           return currentVersion[i] > requiredVersion[i];
	 *       }
	 *     }
	 *
	 *     return true;
	 * }
	 *
	 * let requiredVersionStr = '1.0.0';
	 * if (!is_compatible(requiredVersionStr)) {
	 *     fb.ShowPopupMessage(`This script requires v${requiredVersionStr}. Current component version is v${utils.Version}.`);
	 * }
	 */
	Version: string

	/**
	 * Checks the availability of foobar2000 component.
	 *
	 * @param {string} name
	 * @param {boolean=} [is_dll=true] If true, method checks filename as well as the internal name.
	 * @return {boolean}
	 *
	 * @example
	 * console.log(utils.CheckComponent("foo_playcount", true));
	 */
	CheckComponent(name: string, is_dll?: boolean): boolean

	/**
	 * Check if the font is installed.<br>
	 * Note: it cannot detect fonts loaded by `foo_ui_hacks`. However, {@link gdi.Font} can use those fonts.
	 *
	 * @param {string} name Can be either in English or the localised name in your OS.
	 * @return {boolean}
	 */
	CheckFont(name: string): boolean

	/**
	 * Spawns a windows popup dialog to let you choose a colour.
	 *
	 * @param {number} window_id unused
	 * @param {number} default_colour This colour is used if OK button was not clicked.
	 * @return {number}
	 *
	 * @example
	 * let colour = utils.ColourPicker(0, RGB(255, 0, 0));
	 * // See docs\Helper.js for RGB function.
	 */
	ColourPicker(window_id: number, default_colour: number): number

	/**
	 * Detect the codepage of the file.\n
	 * Note: detection algorithm is probability based (unless there is a UTF BOM),
	 * i.e. even though the returned codepage is the most likely one,
	 * there's no 100% guarantee it's the correct one.\n
	 * Performance note: detection algorithm is quite slow, so results should be cached as much as possible.
	 *
	 * @param {number} path Path to file
	 * @return {number} Codepage number on success, 0 if codepage detection failed
	 */
	DetectCharset(path: string): number

	/**
	 * Edit a text file with the default text editor. <br>
	 * Default text editor can be changed via `Edit` button on the main tab of {@link window.ShowConfigureV2}.
	 *
	 * @param {number} path Path to file
	 */
	EditTextFile(path: string): number

	/**
	 * @param {number} path Path to file
	 * @return {boolean} true, if file exists.
	 */
	FileExists(path: string): boolean

	/**
	 * Various utility functions for working with file.<br>
	 * <br>
	 * Deprecated: use {@link utils.DetectCharset}, {@link utils.FileExists}, {@link utils.GetFileSize},
	 * {@link utils.IsDirectory}, {@link utils.IsFile} and {@link utils.SplitFilePath} instead.
	 *
	 * @deprecated
	 *
	 * @param {string} path
	 * @param {string} mode
	 *     "chardet" - Detects the codepage of the given file. Returns a corresponding codepage number on success, 0 if codepage detection failed.<br>
	 *     "e" - If file path exists, returns true.<br>
	 *     "s" - Retrieves file size, in bytes.<br>
	 *     "d" - If path is a directory, returns true.<br>
	 *     "split" - Returns an array of [directory, filename, filename_extension].
	 * @return {*}
	 *
	 * @example
	 * let arr = utils.FileTest("D:\\Somedir\\Somefile.txt", "split");
	 * // arr[0] <= "D:\\Somedir\\" (always includes backslash at the end)
	 * // arr[1] <= "Somefile"
	 * // arr[2] <= ".txt"
	 */
	FileTest(path: string, mode: string): any;

	/**
	 * @param {number} seconds
	 * @return {string}
	 *
	 * @example
	 * console.log(utils.FormatDuration(plman.GetPlaylistItems(plman.ActivePlaylist).CalcTotalDuration())); // 1wk 1d 17:25:30
	 */
	FormatDuration(seconds: number): string

	/**
	 * @param {number} bytes
	 * @return {string}
	 *
	 * @example
	 * console.log(utils.FormatFileSize(plman.GetPlaylistItems(plman.ActivePlaylist).CalcTotalSize())); // 7.9 GB
	 */
	FormatFileSize(bytes: number): string

	/**
	 * Load art image for the track asynchronously.<br>
	 * <br>
	 * Performance note: consider using {@link gdi.LoadImageAsync} or {@link gdi.LoadImageAsyncV2} if there are a lot of images to load
	 * or if the image is big.
	 *
	 * @param {number} window_id unused
	 * @param {FbMetadbHandle} handle
	 * @param {number=} [art_id=0] See Flags.js > AlbumArtId
	 * @param {boolean=} [need_stub=true]
	 * @param {boolean=} [only_embed=false]
	 * @param {boolean=} [no_load=false]  If true, "image" parameter will be null in {@link module:callbacks~on_get_album_art_done on_get_album_art_done} callback.
	 *
	 * @example
	 * // See `samples/basic/GetAlbumArtAsync.js`
	 */
	GetAlbumArtAsync(window_id: number, handle: FbMetadbHandle, art_id?: number, need_stub?: boolean, only_embed?: boolean, no_load?: number): void


	/**
	 * Load art image for the track asynchronously.<br>
	 * Returns a `Promise` object, which will be resolved when art loading is done.
	 *
	 * @param {number} window_id unused
	 * @param {FbMetadbHandle} handle
	 * @param {number=} [art_id=0] See Flags.js > AlbumArtId
	 * @param {boolean=} [need_stub=true] If true, will return a stub image from `Preferences`>`Display`>`Stub image path` when there is no art image available.
	 * @param {boolean=} [only_embed=false] If true, will only try to load the embedded image.
	 * @param {boolean=} [no_load=false] If true, then no art loading will be performed and only path to art will be returned in {@link ArtPromiseResult}.
	 * @return {Promise.<ArtPromiseResult>} see {@link ArtPromiseResult}
	 *
	 * @example
	 * // See `samples/basic/GetAlbumArtAsyncV2.js`
	 */
	GetAlbumArtAsyncV2(window_id: number, handle: FbMetadbHandle, art_id?: number, need_stub?: boolean, only_embed?: boolean, no_load?: boolean): ArtPromiseResult;

	/**
	 * Load embedded art image for the track.<br>
	 * <br>
	 * Performance note: consider using {@link fb.GetAlbumArtAsync} or {@link fb.GetAlbumArtAsyncV2} if there are a lot of images to load.
	 *
	 * @param {string} rawpath Path to track file
	 * @param {number=} [art_id=0] See Flags.js > AlbumArtId
	 * @return {GdiBitmap}
	 *
	 * @example
	 * let img = utils.GetAlbumArtEmbedded(fb.GetNowPlaying().RawPath, 0);
	 */
	GetAlbumArtEmbedded(rawpath: string, art_id?: number): GdiBitmap;

	/**
	 * Load art image for the track.<br>
	 * <br>
	 * Performance note: consider using {@link fb.GetAlbumArtAsync} or {@link fb.GetAlbumArtAsyncV2} if there are a lot of images to load.
	 *
	 * @param {FbMetadbHandle} handle
	 * @param {number=} [art_id=0] See Flags.js > AlbumArtId
	 * @param {boolean=} [need_stub=true]
	 * @return {GdiBitmap}
	 *
	 * @example
	 * // See `samples/basic/GetAlbumArtV2.js`
	 */
	GetAlbumArtV2(handle: FbMetadbHandle, art_id?: number, need_stub?: boolean): GdiBitmap;

	/**
	 * @param {string} path
	 * @return {number} File size, in bytes
	 */
	GetFileSize(path: string): number


	/**
	 * Get information about a package with the specified id.<br>
	 *
	 * @param {string} package_id
	 * @return {?JsPackageInfo} null if not found, package information otherwise
	 */
	GetPackageInfo(package_id: string): JsPackageInfo;

	/**
	 * Get path to a package directory with the specified id.<br>
	 * Throws exception if package is not found. <br>
	 * <br>
	 * Deprecated: use {@link window.GetPackageInfo} instead.
	 *
	 * @deprecated
	 *
	 * @param {string} package_id
	 * @return {string}
	 */
	GetPackagePath(package_id: string): string

	/**
	 * @param {number} index {@link https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getsyscolor}
	 * @return {number} 0 if failed
	 *
	 * @example
	 * let splitter_colour = utils.GetSysColour(15);
	 */
	GetSysColour(index: number): number

	/**
	 * @param {number} index {@link https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getsyscolor}
	 * @return {number} 0 if failed
	 */
	GetSystemMetrics(index: number): number

	/**
	 * Retrieves filepaths that match the supplied pattern.
	 *
	 * @param {string} pattern
	 * @param {number=} [exc_mask=0x10] Default is FILE_ATTRIBUTE_DIRECTORY. See Flags.js > Used in utils.Glob()
	 * @param {number=} [inc_mask=0xffffffff]
	 * @return {Array<string>}
	 *
	 * @example
	 * let arr = utils.Glob("C:\\*.*");
	 */
	Glob(pattern: string, exc_mask?: number, inc_mask?: number): string[]

	/**
	 * @param {number} window_id
	 * @param {string} prompt
	 * @param {string} caption
	 * @param {string=} [default_val='']
	 * @param {boolean=} [error_on_cancel=false] If set to true, use try/catch like Example2.
	 * @return {string}
	 *
	 * @example
	 * // With "error_on_cancel" not set (or set to false), cancelling the dialog will return "default_val".
	 * let username = utils.InputBox(0, "Enter your username", "Spider Monkey Panel", "");
	 *
	 * @example
	 * // Using Example1, you can't tell if OK or Cancel was pressed if the return value is the same
	 * // as "default_val". If you need to know, set "error_on_cancel" to true which throws a script error
	 * // when Cancel is pressed.
	 * let username = "";
	 * try {
	 *    username = utils.InputBox(0, "Enter your username", "Spider Monkey Panel", "", true);
	 *    // OK was pressed.
	 * } catch(e) {
	 *     // Dialog was closed by pressing Esc, Cancel or the Close button.
	 * }
	 */
	InputBox(window_id: number, prompt: string, caption: string, default_val?: string, error_on_cancel?: boolean): string

	/**
	 * @param {string} path
	 * @return {boolean} true, if location exists and it's a directory
	 */
	IsDirectory(path: string): boolean

	/**
	 * @param {string} path
	 * @return {boolean} true, if location exists and it's a file
	 */
	IsFile(path: string): boolean

	/**
	 * @param {number} vkey {@link https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes}. Some are defined in Flags.js > Used with utils.IsKeyPressed().
	 * @return {boolean}
	 */
	IsKeyPressed(vkey: number): boolean

	/**
	 * See {@link https://docs.microsoft.com/en-us/windows/desktop/api/winnls/nf-winnls-lcmapstringa}.
	 *
	 * @param {string} text
	 * @param {string} lcid
	 * @param {number} flags
	 * @return {string}
	 */
	MapString(text: string, lcid: string, flags: number): string

	/**
	 * Check if the supplied string matches the pattern.<br>
	 * Using Microsoft MS-DOS wildcards match type. eg "*.txt", "abc?.tx?"
	 *
	 * @param {string} pattern
	 * @param {string} str
	 * @return {boolean}
	 */
	PathWildcardMatch(pattern: string, str: string): boolean

	/**
	 * Performance note: supply codepage argument if it is known, since codepage detection might take some time.
	 *
	 * @param {string} filename
	 * @param {number=} [codepage=0] See Codepages.js. If codepage is 0, then automatic detection is performed.
	 * @return {string}
	 *
	 * @example
	 * let text = utils.ReadTextFile("E:\\some text file.txt");
	 */
	ReadTextFile(filename: string, codepage?: string): string

	/**
	 * Note: this only returns up to 255 characters per value.
	 *
	 * @param {string} filename
	 * @param {string} section
	 * @param {string} key
	 * @param {string=} [default_val]
	 * @return {string}
	 *
	 * @example
	 * let username = utils.ReadINI("e:\\my_file.ini", "Last.fm", "username");
	 */
	ReadINI(filename: string, section: string, key: string, default_val?: string): string

	/**
	 * Displays an html dialog, rendered by IE engine.<br>
	 * Utilizes the latest non-Edge IE that you have on your system.<br>
	 * Dialog is modal (blocks input to the parent window while open).<br>
	 *<br>
	 * Html code must be IE compatible, meaning:<br>
	 * - JavaScript features are limited by IE (see {@link https://www.w3schools.com/js/js_versions.asp}).<br>
	 * - Objects passed to `data` are limited to standard JavaScript objects:<br>
	 *   - No extensions from Spider Monkey Panel (e.g. no FbMetadbHandle or GdiBitmap).<br>
	 *<br>
	 * There are also additional limitations:<br>
	 * - options.data may contain only the following types:<br>
	 *   - Basic types: number, string, boolean, null, undefined.<br>
	 *   - Objects as string: the only way to pass objects is to convert them to string and back with `JSON.stringify()` and `JSON.parse()`.<br>
	 *   - Arrays: must be cast via `.toArray()` inside html. Each element has same type limitations as options.data.<br>
	 *   - Functions: has maximum of 7 arguments. Each argument has same type limitations as options.data.
	 *
	 * @param {number} window_id unused
	 * @param {string} code_or_path Html code or file path. File path must begin with `file://` prefix.
	 * @param {object=} [options=undefined]
	 * @param {number=} [options.width=250] Window width
	 * @param {number=} [options.height=100] Window height
	 * @param {number=} [options.x=0] Window horizontal position relative to desktop
	 * @param {number=} [options.y=0] Window vertical position relative to desktop
	 * @param {boolean=} [options.center=true] If true and if options.x and options.y are not set, will center window relative to fb2k position.
	 * @param {boolean=} [options.context_menu=false] If true, will enable right-click context menu.
	 * @param {boolean=} [options.resizable=false] If true, will allow to resize the window.
	 * @param {boolean=} [options.selection=false] If true, will allow to select everything (label texts, buttons and etc).
	 * @param {boolean=} [options.scroll=false] If true, will display scrollbars.
	 * @param {*=} [options.data=undefined] Will be saved in `window.external.dialogArguments` and can be accessed from JavaScript executed inside HTML window.
	 *                                      This data is read-only and should not be modified. Has type limitations (see above).
	 *
	 * @example <caption>Dialog from code</caption>
	 * // See `samples/basic/HtmlDialogWithCheckbox.js`
	 *
	 * @example <caption>Dialog from file</caption>
	 * utils.ShowHtmlDialog(0, `file://${fb.ComponentPath}samples/basic/html/PopupWithCheckBox.html`);
	 */
	ShowHtmlDialog(window_id: number, code_or_path: string, options: {
		width?: number;
		height?: number;
		x?: number;
		y?: number;
		center?: boolean;
		context_menu?: boolean;
		resizable?: boolean;
		selection?: boolean;
		scroll?: boolean;
		data?: any
	}): any

	/**
	 * @param {string} path
	 * @return {Array<string>} An array of [directory, filename, filename_extension]
	 *
	 * @example
	 * let arr = utils.SplitFilePath('D:\\Somedir\\Somefile.txt');
	 * // arr[0] <= 'D:\\Somedir\\' (always includes backslash at the end)
	 * // arr[1] <= 'Somefile'
	 * // arr[2] <= '.txt'
	 */
	SplitFilePath(path: string): boolean

	/**
	 * @param {string} filename
	 * @param {string} section
	 * @param {string} key
	 * @param {string} val
	 * @return {boolean}
	 *
	 * @example
	 * utils.WriteINI("e:\\my_file.ini", "Last.fm", "username", "Bob");
	 */
	WriteINI(filename: string, section: string, key: string, val: string): boolean

	/**
	 * Note: the parent folder must already exist.
	 * Note2: the file is written with UTF8 encoding.
	 *
	 * @param {string} filename
	 * @param {string} content
	 * @param {boolean=} [write_bom=true]
	 * @return {boolean}
	 *
	 * @example <caption>Default encoding</caption>
	 * // write_bom missing but defaults to true, resulting file is UTF8-BOM
	 * utils.WriteTextFile("z:\\1.txt", "test");
	 *
	 * @example <caption>UTF8 with BOM</caption>
	 * utils.WriteTextFile("z:\\2.txt", "test", true);
	 *
	 * @example <caption>UTF8 without BOM</caption>
	 * utils.WriteTextFile("z:\\3.txt", "test", false);
	 */
	WriteTextFile(filename: string, content: string, write_bom?: boolean): boolean
}

declare var utils: IUtils;

/**
 * Functions for working with the current SMP panel and accessing it's properties.
 *
 * @namespace
 */
interface Window {
	/**
	 * Indicates which keys should be processed by the panel.<br>
	 * See {@link https://docs.microsoft.com/en-us/windows/desktop/dlgbox/wm-getdlgcode} for more info.
	 *
	 * @return {number} See Flags.js > With window.DlgCode
	 *
	 * @example
	 * window.DlgCode = DLGC_WANTALLKEYS;
	 */
	DlgCode: number

	/**
	 * Window handle casted to uint32_t.
	 *
	 * @type {number}
	 * @readonly
	 */
	ID: number

	/**
	 * You need this to determine which GetFontXXX and GetColourXXX methods to use, assuming you want to support both interfaces.<br>
	 * <br>
	 * 0 - if using Columns UI<br>
	 * 1 - if using default UI.
	 *
	 * @type {number}
	 * @readonly
	 */
	readonly InstanceType: number

	/**
	 * Only useful within Panel Stack Splitter (Columns UI component)<br>
	 * Depends on setting inside Spider Monkey Panel Configuration window. You generally use it to determine
	 * whether or not to draw a background.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	readonly IsTransparent: boolean

	/**
	 * @type {boolean}
	 * @readonly
	 */
	readonly IsVisible: boolean


	/**
	 * Get memory statistics for JavaScript engine.
	 *
	 * @type {JsMemoryStats}
	 * @readonly
	 */
	readonly JsMemoryStats: JsMemoryStats;

	/**
	 * @type {number}
	 * @readonly
	 */
	readonly Height: number;

	/**
	 * {@link window.MaxHeight}, {@link window.MaxWidth}, {@link window.MinHeight} and {@link window.MinWidth} can be used to lock the panel size.<br>
	 * Do not use if panels are contained within Panel Stack Splitter (Columns UI component).
	 *
	 * @type {number}
	 */
	MaxHeight: number

	/**
	 * See {@link window.MaxHeight}.
	 *
	 * @type {number}
	 */
	MaxWidth: number

	/**
	 * Maximum allowed memory usage for the component (in bytes).<br>
	 * If the total memory usage exceeds this value, all panels will fail with OOM error.<br>
	 * <br>
	 * Deprecated: use {@link window.JsMemoryStats.total_memory_limit} instead.
	 *
	 * @deprecated
	 *
	 * @type {number}
	 * @readonly
	 */
	readonly MemoryLimit: number

	/**
	 * See {@link window.MaxHeight}.
	 *
	 * @type {number}
	 */
	MinHeight: number

	/**
	 * See {@link window.MaxHeight}.
	 *
	 * @type {number}
	 */
	MinWidth: number

	/**
	 * Returns the panel name set in {@link window.ShowConfigureV2}.
	 *
	 * @type {string}
	 * @readonly
	 */
	Name: string

	/**
	 * Memory usage of the current panel (in bytes).<br>
	 * <br>
	 * Deprecated: use {@link window.JsMemoryStats.memory_usage} instead.
	 *
	 * @deprecated
	 *
	 * @type {number}
	 * @readonly
	 */
	readonly PanelMemoryUsage: number


	/**
	 * Information about the panel script.
	 *
	 * @type {ScriptInfo}
	 * @readonly
	 */
	ScriptInfo: ScriptInfo;

	/**
	 * Get associated tooltip object.
	 *
	 * @type {FbTooltip}
	 * @readonly
	 */
	Tooltip: FbTooltip

	/**
	 * Total memory usage of all panels (in bytes).<br>
	 * <br>
	 * Deprecated: use {@link window.JsMemoryStats.total_memory_usage} instead.
	 *
	 * @deprecated
	 *
	 * @type {number}
	 * @readonly
	 */
	readonly TotalMemoryUsage: number

	/**
	 * @type {number}
	 * @readonly
	 */
	readonly Width: number

	/**
	 * See {@link clearTimeout}.
	 *
	 * @param {number} timerID
	 */
	ClearTimeout(timerID: number): void

	/**
	 * See {@link clearInterval}.
	 *
	 * @param {number} timerID
	 */
	ClearInterval(timerID: number): void

	/**
	 * Setups panel and script information and available features.<br>
	 * Can be called only once, so it's better to define it
	 * directly in the panel Configure menu.<br>
	 * <br>
	 * Deprecated: use {@link window.DefineScript} instead.
	 * Panel name can be changed via {@link window.ShowConfigureV2}.
	 *
	 * @deprecated
	 *
	 * @param {string} name Script name and panel name
	 * @param {object=} [options={}]
	 * @param {string=} [options.author=''] Script author
	 * @param {string=} [options.version=''] Script version
	 * @param {object=} [options.features=undefined] Additional script features
	 * @param {boolean=} [options.features.drag_n_drop=false] Indicates if drag_n_drop functionality should be enabled
	 */
	DefinePanel(name: string, options?: {
		author?: string;
		version?: string;
		features?: object;
		drag_n_drop?: boolean;
	}): void;

	/**
	 * Setup the script information.<br>
	 * Can be called only once for the whole panel.
	 *
	 * @param {string} name Script name
	 * @param {object=} [options={}]
	 * @param {string=} [options.author=''] Script author
	 * @param {string=} [options.version=''] Script version
	 * @param {object=} [options.features=undefined] Additional script features
	 * @param {boolean=} [options.features.drag_n_drop=false] Indicates if drag_n_drop functionality should be enabled
	 * @param {boolean=} [options.features.grab_focus=true] Indicates if panel should grab mouse focus
	 */
	DefineScript(name: string, options?: {
		author?: string;
		version?: string;
		features?: object;
		drag_n_drop?: boolean;
		grab_focus?: boolean
	}): void;

	/**
	 * Open the current panel script in the default text editor.<br>
	 * Default text editor can be changed via `Edit` button on the main tab of {@link window.ShowConfigureV2}.
	 */
	EditScript(): void;

	/**
	 * @return {MenuObject}
	 *
	 * @example
	 * // See `samples/basic/MainMenuManager All-In-One.js`, `samples/basic/Menu Sample.js`
	 */
	CreatePopupMenu(): MenuObject

	/**
	 * @param {string} class_id {@link https://docs.microsoft.com/en-us/windows/win32/controls/parts-and-states}
	 * @return {ThemeManager}
	 *
	 * @example
	 * // See `samples/basic/SimpleThemedButton.js`
	 */
	CreateThemeManager(class_id: string): ThemeManager;

	/**
	 * Note: a single panel can have only a single tooltip object.
	 * Creating a new tooltip will replace the previous one.<br>
	 * <br>
	 * Deprecated: use {@link fb.Tooltip} and {@link FbTooltip.SetFont} instead.
	 *
	 * @deprecated
	 *
	 * @param {string=} [font_name='Segoe UI']
	 * @param {number=} [font_size_px=12]
	 * @param {number=} [font_style=0] See Flags.js > FontStyle
	 * @return {FbTooltip}
	 */
	CreateTooltip(font_name?: string, font_size_px?: number, font_style?: number): FbTooltip;

	/**
	 * @param {number} type See Flags.js > Used in window.GetColourXXX()
	 * @param {string=} client_guid See Flags.js > Used in GetColourCUI() as client_guid.
	 * @return {number} returns black colour if the requested one is not available.
	 */
	GetColourCUI(type: number, client_guid?: string): number

	/**
	 * @param {number} type
	 * @return {number} returns black colour if the requested one is not available.
	 */
	GetColourDUI(type: number): number

	/**
	 * Note: see the example in {@link window.GetFontDUI}.
	 *
	 * @param {number} type See Flags.js > Used in window.GetFontXXX()
	 * @param {string=} client_guid See Flags.js > Used in GetFontCUI() as client_guid.
	 * @return {?GdiFont} returns null if the requested font was not found.
	 */
	GetFontCUI(type: number, client_guid?: string): GdiFont | null;

	/**
	 * @param {number} type See Flags.js > Used in window.GetFontXXX()
	 * @return {?GdiFont} returns null if the requested font was not found.
	 *
	 * @example
	 * // To avoid errors when trying to use the font or access its properties, you
	 * // should use code something like this...
	 * let font = window.GetFontDUI(0);
	 * if (!font) {
	 *    console.log("Unable to determine your default font. Using Segoe UI instead.");
	 *    font = gdi.Font("Segoe UI", 12);
	 * }
	 */
	GetFontDUI(type: number): GdiFont | null;

	/**
	 * Get value of property.<br>
	 * If property does not exist and default_val is not undefined and not null,
	 * it will be created with the value of default_val.<br>
	 * <br>
	 * Note: leading and trailing whitespace are removed from property name.
	 *
	 * @param {string} name
	 * @param {*=} default_val
	 * @return {*}
	 */
	GetProperty<T extends string | number | boolean>(name: string, default_val: T): T;

	/**
	 * This will trigger {@link module:callbacks~on_notify_data on_notify_data}(name, info) in other panels.<br>
	 * <b>!!! Beware !!!</b>: data passed via `info` argument must NOT be used or modified in the source panel after invoking this method.
	 *
	 * @param {string} name
	 * @param {*} info
	 *
	 * @example
	 * let data = {
	 *    // some data
	 * };
	 * window.NotifyOthers('have_some_data', data);
	 *
	 * data = null; // stop using the object immediately
	 * // AddSomeAdditionalValues(data); // don't try to modify it, since it will affect the object in the other panel as well
	 */
	NotifyOthers(name: string, info: any): void

	/**
	 * Reload panel.
	 * @method
	 */
	Reload(): void

	/**
	 * Performance note: don't force the repaint unless it's really necessary -
	 * repaint calls might be grouped up when *not forced* which will turn them into a single repaint call,
	 * thus reducing the amount of {@link module:callbacks~on_paint on_paint} calls.
	 *
	 * @param {boolean=} [force=false] If true, will repaint immediately, otherwise a repaint task will be *scheduled*.
	 */
	Repaint(force?: boolean): void

	/**
	 * Repaints a part of the screen.<br>
	 * Use this instead of {@link window.Repaint} on frequently updated areas
	 * such as time, bitrate, seekbar, etc.<br>
	 * <br>
	 * Performance note: see Performance note in {@link window.Repaint}.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {boolean=} [force=false] If true, will repaint immediately, otherwise a repaint task will be *scheduled*.
	 */
	RepaintRect(x: number, y: number, w: number, h: number, force?: boolean): void

	/**
	 * This would usually be used inside the {@link module:callbacks~on_mouse_move on_mouse_move} callback.<br>
	 * Use -1 if you want to hide the cursor.
	 *
	 * @param {number} id See Flags.js > Used in window.SetCursor()
	 */
	SetCursor(id: number): void

	/**
	 * See {@link setInterval}.
	 *
	 * @param {function()} func
	 * @param {number} delay
	 *
	 * @return {number}
	 */
	SetInterval(func: Function, delay: string): number

	/**
	 * Set property value.<br>
	 * Property will be removed, if val is undefined or null.<br>
	 * <br>
	 * Property values are saved per panel instance and are remembered between foobar2000 restarts.<br>
	 * <br>
	 * Note: leading and trailing whitespace are removed from property name.
	 *
	 * @param {string} name
	 * @param {*=} val
	 */
	SetProperty(name: string, val: any): void;

	/**
	 * See {@link setTimeout}.
	 *
	 * @param {function()} func
	 * @param {number} delay
	 *
	 * @return {number}
	 */
	SetTimeout(func: Function, delay: number): number

	/**
	 * Show configuration window of current panel.
	 * <br>
	 * Deprecated: use {@link window.ShowConfigureV2} to configure panel and {@link window.EditScript} to edit script.
	 *
	 * @deprecated
	 *
	 * @method
	 */
	ShowConfigure(): void

	/**
	 * Show configuration window of current panel
	 * @method
	 */
	ShowConfigureV2(): void

	/**
	 * Show properties window of current panel
	 * @method
	 */
	ShowProperties(): void;
}

declare var window: Window;

/**
 * @constructor
 * @hideconstructor
 */
interface FbMetadbHandle {

	/**
	 * @type {string}
	 * @readonly
	 *
	 * @example
	 * let handle = fb.GetFocusItem();
	 * console.log(handle.Path); // D:\SomeSong.flac
	 */

	readonly Path: string; // (string) (read)

	/**
	 * @type {string}
	 * @readonly
	 *
	 * @example
	 * console.log(handle.RawPath); // file://D:\SomeSong.flac
	 */
	readonly RawPath: string;

	/**
	 * @type {number}
	 * @readonly
	 */
	readonly SubSong: number;

	/**
	 * -1 if size is unavailable.
	 *
	 * @type {number}
	 * @readonly
	 */
	readonly FileSize: number

	/**
	 * @type {float}
	 * @readonly
	 */
	readonly Length: number

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @param {number} playcount Use 0 to clear
	 */
	SetPlayCount(playcount: number): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @param {number} loved Use 0 to clear
	 */
	SetLoved(loved: number): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @param {string} first_played Use "" to clear
	 */
	SetFirstPlayed(first_played: string): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @param {string} last_played Use "" to clear
	 */
	SetLastPlayed(last_played: string): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @param {number} rating Use 0 to clear
	 */
	SetRating(rating: number): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @method
	 */
	ClearStats(): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @method
	 */
	RefreshStats(): void

	/**
	 * Compare two {@link FbMetadbHandle} instances, pointer only.<br>
	 * If you want to compare them physically, use the {@link FbMetadbHandle#RawPath} property.
	 *
	 * @param {FbMetadbHandle} handle
	 * @return {boolean}
	 *
	 * @example
	 * handle.Compare(handle2);
	 */
	Compare(handle: FbMetadbHandle): boolean

	/**
	 * @return {?FbFileInfo} null if file info is not available.
	 */
	GetFileInfo(): FbFileInfo
}

/**
 * Return value of {@link window.ScriptInfo}.<br>
 * Note: package_id is only present when the panel script is a package.
 *
 * @property {string} Name
 * @property {string} [Author]
 * @property {string} [Version]
 * @property {string} [PackageId]
 */
interface ScriptInfo {
	Name: string
	Author?: string;
	Version: string;
	PackageId?: string;
}


/**
 * @constructor
 * @hideconstructor
 */
interface FbFileInfo {
	/**
	 * @type {number}
	 * @readonly
	 *
	 * @example
	 * let handle = fb.GetFocusItem();
	 * let file_info = handle.GetFileInfo();
	 * if (file_info) {
	 *     console.log(file_info.MetaCount); // 11
	 * }
	 */
	readonly MetaCount: number

	/**
	 * @type {number}
	 * @readonly
	 *
	 * @example
	 * console.log(file_info.InfoCount); // 9
	 */
	readonly InfoCount: number

	/**
	 * @param {string} name
	 * @return {number} -1 if not found
	 */
	InfoFind(name: string): number

	/**
	 * @param {number} idx
	 * @return {string}
	 */
	InfoName(idx: number): string

	/**
	 * @param {number} idx
	 * @return {string}
	 */
	InfoValue(idx: number): string

	/**
	 * @param {string} name
	 * @return {number} -1 if not found
	 */
	MetaFind(name: string): number

	/**
	 * Note: the case of the tag name returned can be different depending on tag type,
	 * so using toLowerCase() or toUpperCase() on the result is recommended
	 *
	 * @param {number} idx
	 * @return {string}
	 *
	 * @example
	 * for (let i = 0; i < f.MetaCount; ++i) {
	 *      console.log(file_info.MetaName(i).toUpperCase());
	 * }
	 */
	MetaName(idx: number): string

	/**
	 * @param {number} idx
	 * @param {number} value_idx Used for iterating through multi-value tags.
	 * @return {string}
	 */
	MetaValue(idx: number, value_idx: number): string

	/**
	 * The number of values contained in a meta tag.
	 *
	 * @param {number} idx
	 * @return {number}
	 */
	MetaValueCount(idx: number): number
}

/**
 * Handle list elements can be accessed with array accessor, e.g. handle_list[i]
 *
 * @constructor
 * @param {FbMetadbHandleList | FbMetadbHandle | Array<FbMetadbHandle> | null | undefined} [arg]
 */
interface FbMetadbHandleList extends Array<FbMetadbHandle> {
	new(arg?: FbMetadbHandleList | FbMetadbHandle | FbMetadbHandle[]): FbMetadbHandleList;
	/**
	 * @type {number}
	 * @readonly
	 *
	 * @example
	 * plman.GetPlaylistItems(plman.ActivePlaylist);
	 * console.log(handle_list.Count);
	 */
	readonly Count: number

	/**
	 * @param {FbMetadbHandle} handle
	 * @return {uint}
	 *
	 * @example
	 * handle_list.Add(fb.GetNowPlaying());
	 */
	Add(handle: FbMetadbHandle): number;

	/**
	 * @param {FbMetadbHandleList} handle_list
	 *
	 * @example
	 * handle_list.AddRange(fb.GetLibraryItems());
	 */
	AddRange(handle_list: FbMetadbHandleList): void

	/**
	 * Errors such as invalid path, corrupt image, target file type not supporting
	 * embedded art, etc should all silently fail. A progress dialog will be shown for larger file
	 * selections.<br>
	 * Any existing artwork of the specified type will be overwritten - there is no need to remove it first.
	 *
	 * @param {FbMetadbHandleList} image_path path to an existing image
	 * @param {number=} [art_id=0] See Flags.js > AlbumArtId
	 *
	 * @example
	 * let handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
	 * if (handle_list.Count > 0) {
	 *    let img_path = 'C:\\path\\to\\image.jpg';
	 *    handle_list.AttachImage(img_path, 0);
	 * }
	 *
	 * @example
	 * // since there is no handle method, do this for a single item
	 * let handle_list = new FbMetadbHandleList(fb.GetFocusItem());
	 * let img_path = "C:\\path\\to\\image.jpg";
	 * handle_list.AttachImage(img_path, 0);
	 */
	AttachImage(image_path: string, art_id?: number): void

	/**
	 * Faster than {@link FbMetadbHandleList#Find}.
	 *
	 * @param {FbMetadbHandle} handle Must be sorted with {@link FbMetadbHandleList#Sort}.
	 * @return {uint} -1 on failure.
	 */
	BSearch(handle: FbMetadbHandle): number

	/**
	 * @return {float} total duration in seconds. For display purposes, consider using {@link utils.FormatDuration} on the result.
	 */
	CalcTotalDuration(): number

	/**
	 * @return {number} total size in bytes. For display purposes, consider using utils.FormatFileSize() on the result.
	 */
	CalcTotalSize(): number

	/**
	 * @return {FbMetadbHandleList}
	 *
	 * @example
	 * let handle_list2 = handle_list.Clone();
	 */
	Clone(): FbMetadbHandleList;

	/**
	 * Converts {@link FbMetadbHandleList} to an array of {@link FbMetadbHandle}.<br>
	 * Use this instead of looping through {@link FbMetadbHandleList}, if the playlist is big
	 * or if you need to loop multiple times.<br>
	 *
	 * @return {Array<FbMetadbHandle>}
	 *
	 * @example
	 * let playlist_items_array = plman.GetPlaylistItems(plman.ActivePlaylist).Convert();
	 * for (let i = 0; i < playlist_items_array.length; ++i) {
	 *    // do something with playlist_items_array[i] which is your handle
	 * }
	 */
	Convert(): FbMetadbHandle[];

	/**
	 * Performance note: if sorted with {@link FbMetadbHandleList#Sort}, use {@link FbMetadbHandleList#BSearch} instead.
	 *
	 * @param {FbMetadbHandle} handle
	 * @return {number} index in the handle list on success, -1 if not found
	 */
	Find(handle: FbMetadbHandle): number

	/**
	 * See {@link fb.GetLibraryRelativePath}.<br>
	 * <br>
	 * This should be faster than looping a handle list manually and using the aforementioned method.
	 *
	 * @return {Array<string>}
	 *
	 * @example
	 * let handle_list = fb.GetLibraryItems();
	 * handle_list.OrderByRelativePath();
	 * let relative_paths = handle_list.GetLibraryRelativePaths();
	 */
	GetLibraryRelativePaths(): string[]

	/**
	 * @param {number} index
	 * @param {FbMetadbHandle} handle
	 *
	 * @example
	 * // This inserts at the end of the handle list.
	 * handle_list.Insert(handle_list.Count, fb.GetNowPlaying());
	 */
	Insert(index: number, handle: FbMetadbHandle): void

	/**
	 * @param {number} index
	 * @param {FbMetadbHandleList} handle_list
	 */
	InsertRange(index: number, handle_list: FbMetadbHandleList): void

	/**
	 * Note: sort with {@link FbMetadbHandleList#Sort} before using.
	 *
	 * @param {FbMetadbHandleList} handle_list Sorted handle list.
	 *
	 * @example
	 * let one = plman.GetPlaylistItems(0);
	 * one.Sort();
	 *
	 * let two = plman.GetPlaylistItems(1);
	 * two.Sort();
	 *
	 * one.MakeDifference(two);
	 * // "one" now only contains handles that were unique to "one".
	 * // Anything that also existed in "two" will have been removed.
	 */
	MakeDifference(handle_list: FbMetadbHandleList): void

	/**
	 * Note: sort with {@link FbMetadbHandleList#Sort} before using.
	 *
	 * @param {FbMetadbHandleList} handle_list Sorted handle list.
	 *
	 * @example
	 * let one = plman.GetPlaylistItems(0);
	 * one.Sort();
	 *
	 * let two = plman.GetPlaylistItems(1);
	 * two.Sort();
	 *
	 * one.MakeIntersection(two);
	 * // "one" now only contains handles that were in BOTH "one" AND "two"
	 */
	MakeIntersection(handle_list: FbMetadbHandleList): void

	/**
	 * Note: sort with {@link FbMetadbHandleList#Sort} before using.
	 *
	 * @param {FbMetadbHandleList} handle_list Sorted handle list.
	 *
	 * @example
	 * let one = plman.GetPlaylistItems(0);
	 * one.Sort();
	 *
	 * let two = plman.GetPlaylistItems(1);
	 * two.Sort();
	 *
	 * one.MakeUnion(two);
	 * // "one" now contains all handles from "one" AND "two" with any duplicates removed
	 */
	MakeUnion(handle_list: FbMetadbHandleList): void

	/**
	 * @param {FbTitleFormat} tfo An instance of FbTitleFormat.
	 * @param {number} direction > 0 - ascending.
	 *
	 * @example
	 * let handle_list = fb.GetLibraryItems();
	 * let tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
	 * handle_list.OrderByFormat(tfo, 1);
	 */
	OrderByFormat(tfo: FbTitleFormat, direction: number): void

	/**
	 * Note: this method should only be used on a handle list containing items that are monitored as part of the Media Library.
	 *
	 * @method
	 */
	OrderByPath(): void

	/** @method */
	OrderByRelativePath(): void

	/**
	 * See {@link https://theqwertiest.github.io/foo_spider_monkey_panel/docs/guides/playback_stats}
	 *
	 * @method
	 */
	RefreshStats(): void

	/**
	 * @param {FbMetadbHandle} handle
	 */
	Remove(handle: FbMetadbHandle): void

	/** @method */
	RemoveAll(): void

	/**
	 * Note: a progress dialog will be shown for larger file selections.
	 *
	 * @param {number=} [art_id=0] See Flags.js > AlbumArtId
	 */
	RemoveAttachedImage(art_id?: number): void

	/**
	 * Removes all attached images.
	 *
	 * Note: a progress dialog will be shown for larger file selections.
	 */
	RemoveAttachedImages(): void

	/**
	 * @param {number} idx
	 *
	 * @example
	 * handle_list.RemoveById(0);
	 */
	RemoveById(idx: number): void

	/**
	 * @param {number} from
	 * @param {number} num
	 *
	 * @example
	 * handle_list.RemoveRange(10, 20);
	 */
	RemoveRange(from: number, num: number): void

	/**
	 * Remove duplicates and optimise for other handle list operations
	 *
	 * @method
	 */
	Sort(): void

	/**
	 * Updated metadb tags with new values.
	 *
	 * @param {string} str JSON string, which contains an object (applies same values to every track)
	 *                     or an array of objects (one object per track).
	 *
	 * @example
	 * // assume we've selected one album
	 * let handles = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
	 *
	 * let arr = [];
	 * for (let i = 0; i < handles.Count; ++i) {
	 *     // each element of the array must be an object of key names/values, indicated by the curly braces
	 *     arr.push({
	 *         'tracknumber' : i + 1, // independent values per track
	 *         'totaltracks' : handles.Count,
	 *         'album' : 'Greatest Hits', // a simple string for a single value
	 *         'genre' : ['Rock', 'Hard Rock'], // we can use an array here for multiple value tags
	 *         'bad_tag' : '' // blank values will clear any existing tags.
	 *     });
	 * }
	 *
	 * handles.UpdateFileInfoFromJSON(JSON.stringify(arr));
	 */
	UpdateFileInfoFromJSON(str: string): void
}

/**
 * A Recycle Bin for playlists.
 *
 * @constructor
 * @hideconstructor
 */
interface FbPlaylistRecycler {

	/**
	 * @type {uint}
	 * @readonly
	 */
	readonly Count: number

	/**
	 * @param {number} index
	 * @return {string}
	 */
	GetName(index: number): string

	/**
	 * @param {number} index
	 * @return {FbMetadbHandleList}
	 */
	GetContent(index: number): FbMetadbHandleList;

	/**
	 * @param {number} affectedItems array like [1, 3, 5]
	 */
	Purge(affectedItems: number): void

	/**
	 * @param {number} index
	 */
	Restore(index: number): void;
}

/**
 * @constructor
 * @hideconstructor
 *
 * @example
 * let playing_item_location = plman.GetPlayingItemLocation();
 * if (playing_item_location.IsValid) {
 *     console.log(playing_item_location.PlaylistIndex);
 *     console.log(playing_item_location.PlaylistItemIndex);
 * }
 */
interface FbPlayingItemLocation {

	/**
	 * False if foobar2000 isn't playing or if the playing track
	 * has since been removed from the playlist it was on when playback was started.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	readonly IsValid: boolean;

	/**
	 * -1 if item is not in a playlist
	 *
	 * @type {int}
	 * @readonly
	 */
	readonly PlaylistIndex: number;

	/**
	 * -1 if item is not in a playlist
	 *
	 * @type {int}
	 * @readonly
	 */
	readonly PlaylistItemIndex: number
}

/**
 * @constructor
 * @hideconstructor
 */
interface FbPlaybackQueueItem {

	/**
	 * @type {FbMetadbHandle}
	 * @readonly
	 */
	readonly Handle: FbMetadbHandle

	/**
	 * -1 if item is not in a playlist
	 *
	 * @type {int}
	 * @readonly
	 */
	readonly PlaylistIndex: number

	/**
	 * -1 if item is not in a playlist
	 *
	 * @type {int}
	 * @readonly
	 */
	readonly PlaylistItemIndex: number
}

/**
 * @constructor
 * @param {string} name
 *
 * @example
 * let test = new FbProfiler('test');
 * // do something time consuming
 * console.log(test.Time); // Outputs bare time in ms like "789"
 * test.Print(); // Outputs component name/version/assigned name like "Spider Monkey Panel v1.0.0: profiler (test): 789 ms"
 */
interface FbProfiler {
	new(name: string): FbProfiler;

	/**
	 * @type {uint}
	 * @readonly
	 */
	readonly Time: number

	/** @method */
	Reset(): void

	/**
	 * @param {string=} [additionalMsg=''] string that will be prepended to the measured time
	 * @param {boolean=} [printComponentInfo=true]
	 *
	 * @example
	 * let test = new FbProfiler('Group #1');
	 * // Do smth #1
	 * test.Print('\nTask #1:', false);
	 * // Do smth #2
	 * test.Print('\nTask #2:', false);
	 * // Do smth
	 * test.Print();
	 * // Output:
	 * // profiler (Group #1):
	 * // Task #1: 789 ms"
	 * // profiler (Group #1):
	 * // Task #2: 1530 ms"
	 * // Spider Monkey Panel v1.0.0: profiler (Group #1): 3541 ms"
	 */
	Print(additionalMsg?: string, printComponentInfo?: boolean): void
}

/**
 * Performance note: if you use the same query frequently,
 * try caching FbTitleFormat object (by storing it somewhere),
 * instead of creating it every time.
 *
 * @constructor
 * @param {string} expression
 */
interface FbTitleFormat {
	new(expression: string): FbTitleFormat;
	/**
	 * Always use Eval when you want dynamic info such as %playback_time%, %bitrate% etc.<br>
	 * {@link FbTitleFormat#EvalWithMetadb}(fb.GetNowplaying()) will not give the results you want.
	 *
	 * @param {boolean=} [force=false] If true, you can process text that doesn't contain
	 *     title formatting even when foobar2000 isn't playing. When playing, you
	 *     should always get a result.
	 * @return {string}
	 *
	 * @example
	 * let tfo = fb.TitleFormat("%artist%");
	 * console.log(tfo.Eval());
	 */
	Eval(force?: boolean): string;

	/**
	 * @param {FbMetadbHandle} handle
	 * @return {string}
	 *
	 * @example
	 * let tfo = fb.TitleFormat("%artist%");
	 * console.log(tfo.EvalWithMetadb(fb.GetFocusItem()));
	 */
	EvalWithMetadb(handle: FbMetadbHandle): string

	/**
	 * @param {FbMetadbHandleList} handle_list
	 * @return {Array<string>}
	 *
	 * @example
	 * let tfo = fb.TitleFormat("%artist%");
	 * let handle_list = fb.GetLibraryItems();
	 * let artists = tfo.EvalWithMetadbs(handle_list);
	 * console.log(handle_list.Count === artists.length); // should always be true!
	 */
	EvalWithMetadbs(handle_list: FbMetadbHandleList): string[]
}

/**
 * @constructor
 * @hideconstructor
 */
interface FbTooltip {
	/**
	 * Note: this also updates text on the active tooltip
	 * i.e. there is no need to manually cycle Deactivate()/Activate()
	 * to update text.
	 *
	 * @type {string}
	 *
	 * @example
	 * let tooltip = window.Tooltip;
	 * tooltip.Text = "Whoop";
	 */
	Text: string;

	/** @type {boolean} */
	TrackActivate: boolean

	/**
	 * Note: only do this when text has changed, otherwise it will flicker.
	 *
	 * @method
	 *
	 * @example
	 * let text = "...";
	 * if (tooltip.Text != text) {
	 *    tooltip.Text = text;
	 *    tooltip.Activate();
	 * }
	 */
	Activate(): void

	/** @method */
	Deactivate(): void

	/**
	 * @param {number} type
	 * @return {uint}
	 */
	GetDelayTime(type: number): number;

	/**
	 * @param {number} type See Flags.js > Used in {@link FbTooltip#GetDelayTime} and {@link FbTooltip#SetDelayTime}
	 * @param {number} time
	 */
	SetDelayTime(type: number, time: number): void;

	/**
	 * @param {string} font_name
	 * @param {number=} [font_size_px=12]
	 * @param {number=} [font_style=0] See Flags.js > FontStyle
	 */
	SetFont(font_name: string, font_size_px?: number, font_style?: number): void;

	/**
	 * Use if you want multi-line tooltips.<br>
	 * Use \n as a new line separator.
	 *
	 * @param {number} width
	 *
	 * @example
	 * tooltip.SetMaxWidth(800);
	 * tooltip.Text = "Line1\nLine2";
	 */
	SetMaxWidth(width: number): void;

	/**
	 * Note: check that x, y positions have changed from the last invocation, otherwise it will flicker.<br>
	 * Note 2: ensure that the tooltip does not overlap the mouse pointer, otherwise it will glitch out.
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	TrackPosition(x: number, y: number): void;
}

/**
 * This is typically used to update the selection used by the default UI artwork panel
 * or any other panel that makes use of the preferences under
 * File > Preferences > Display > Selection viewers. Use in conjunction with the {@link module:callbacks~on_focus on_focus}
 * callback.
 *
 * @constructor
 * @hideconstructor
 *
 * @example <caption>For playlist viewers</caption>
 * let selection_holder = fb.AcquireUiSelectionHolder();
 * selection_holder.SetPlaylistSelectionTracking();
 *
 * function on_focus(is_focused) {
 *     if (is_focused) { // Updates the selection when panel regains focus
 *         selection_holder.SetPlaylistSelectionTracking();
 *     }
 * }
 *
 * @example <caption>For library viewers</caption>
 * let selection_holder = fb.AcquireUiSelectionHolder();
 * let handle_list = null;
 *
 * function on_mouse_lbtn_up(x, y) { // Presumably going to select something here...
 *    handle_list = ...;
 *    selection_holder.SetSelection(handle_list);
 * }
 *
 * function on_focus(is_focused) {
 *    if (is_focused) { // Updates the selection when panel regains focus
 *        if (handle_list && handle_list.Count)
 *            selection_holder.SetSelection(handle_list);
 *    }
 * }
 */
interface FbUiSelectionHolder {

	/**
	 * Sets the selected items.
	 *
	 * @param {FbMetadbHandleList} handle_list
	 *
	 * @param {number} [type=0] Selection type. Possible values:<br>
	 *     0 - default, undefined<br>
	 *     1 - active_playlist_selection<br>
	 *     2 - caller_active_playlist<br>
	 *     3 - playlist_manager<br>
	 *     4 - now_playing<br>
	 *     5 - keyboard_shortcut_list<br>
	 *     6 - media_library_viewer
	 *
	 */
	SetSelection(handle_list: FbMetadbHandleList, type?: number): void

	/**
	 * Sets selected items to playlist selection and enables tracking.<br>
	 * When the playlist selection changes, the stored selection is automatically
	 * updated. Tracking ends when a set method is called on any ui_selection_holder
	 * or when the last reference to this ui_selection_holder is released.
	 */
	SetPlaylistSelectionTracking(): void

	/**
	 * Sets selected items to playlist contents and enables tracking.<br>
	 * When the playlist selection changes, the stored selection is automatically
	 * updated. Tracking ends when a set method is called on any ui_selection_holder
	 * or when the last reference to this ui_selection_holder is released.
	 */
	SetPlaylistTracking(): void
}

interface GdiBitmap {
	new(arg: GdiBitmap): GdiBitmap;


	/**
	 * @type {uint}
	 * @readonly
	 */
	readonly Height: number;

	/**
	 * @type {uint}
	 * @readonly
	 */
	Width: number

	/**
	 * @param {number} alpha Valid values 0-255.
	 * @return {GdiBitmap}
	 */
	ApplyAlpha(alpha: number): GdiBitmap;

	/**
	 * Changes will be saved in the current bitmap.
	 *
	 * @param {GdiBitmap} img
	 *
	 * @example <caption>Blur image<caption>
	 * // See `samples/basic/Apply Mask.js`
	 */
	ApplyMask(img: GdiBitmap): boolean

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @return {GdiBitmap}
	 */
	Clone(x: number, y: number, w: number, h: number): GdiBitmap;

	/**
	 * Create a DDB bitmap from GdiBitmap, which is used in {@link GdiGraphics#GdiDrawBitmap}
	 *
	 * @return {GdiRawBitmap}
	 */
	CreateRawBitmap(): GdiRawBitmap;

	/**
	 * @param {number} max_count
	 * @return {Array<number>}
	 */
	GetColourScheme(max_count: number): number[]

	/**
	 * Returns a JSON array in string form so you need to use JSON.parse() on the result.<br>
	 * Each entry in the array is an object which contains colour and frequency values.<br>
	 * Uses a different method for calculating colours than {@link GdiBitmap#GetColourScheme}.<br>
	 * Image is automatically resized during processing for performance reasons so there's no
	 * need to resize before calling the method.
	 *
	 * @param {number} max_count
	 * @return {string}
	 *
	 * @example
	 * // See docs\Helpers.js for "toRGB" function.
	 * img = ... // use utils.GetAlbumArtV2 / gdi.Image / etc
	 * colours = JSON.parse(img.GetColourSchemeJSON(5));
	 * console.log(colours[0].col); // -4194304
	 * console.log(colours[0].freq); // 0.34
	 * console.log(toRGB(colours[0].col)); // [192, 0, 0]
	 */
	GetColourSchemeJSON(max_count: number): string

	/**
	 * Note: don't forget to use {@link GdiBitmap#ReleaseGraphics} after work on GdiGraphics is done!
	 *
	 * @return {GdiGraphics}
	 */
	GetGraphics(): GdiGraphics;

	/**
	 * Inverts the colours in a bitmap, to create a negative image.
	 * i.e. White becomes black, black becomes white, etc.
	 * @return {GdiBitmap}
	 */
	InvertColours(): GdiBitmap;

	/**
	 * @param {GdiGraphics} gr
	 */
	ReleaseGraphics(gr: GdiGraphics): void;

	/**
	 * @param {number} w
	 * @param {number} h
	 * @param {number=} [mode=0] See Flags.js > InterpolationMode
	 * @return {GdiBitmap}
	 */
	Resize(w: number, h: number, mode?: number): GdiBitmap;

	/**
	 * Changes will be saved in the current bitmap.
	 *
	 * @param {number} mode See Flags.js > RotateFlipType
	 */
	RotateFlip(mode: number): void;

	/**
	 * @param {string} path Full path including file extension. The parent folder must already exist.
	 * @param {string=} [format='image/png']
	 *      "image/png"<br>
	 *      "image/bmp"<br>
	 *      "image/jpeg"<br>
	 *      "image/gif"<br>
	 *      "image/tiff"
	 * @return {boolean}
	 *
	 * @example
	 * let img = utils.GetAlbumArtEmbedded(fb.GetFocusItem().RawPath, 0);
	 * if (img) {
	 *     img.SaveAs("D:\\export.jpg", "image/jpeg");
	 * }
	 */
	SaveAs(path: string, format?: string): boolean

	/**
	 * Changes will be saved in the current bitmap.
	 *
	 * @param {number} radius Valid values 2-254.
	 *
	 * @example <caption>Blur image<caption>
	 * // `samples/basic/StackBlur (image).js`
	 *
	 * @example <caption>Blur text<caption>
	 * // `samples/basic/StackBlur (text).js`
	 */
	StackBlur(radius: number): void;
}

interface GdiFont {
	/**
	 * Constructor may fail if font is not present.<br>
	 *
	 * Performance note: try caching and reusing `GdiFont` objects,
	 * since the maximum amount of such objects is hard-limited by Windows.
	 * `GdiFont` creation will fail after reaching this limit.
	 *
	 * @constructor
	 * @param {string} name
	 * @param {number} size_px See Helper.js > Point2Pixel function for conversions
	 * @param {number=} [style=0] See Flags.js > FontStyle
	 */
	// new(name: string, size_px: number, style?: number): GdiFont;
	/**
	 * @type {number}
	 * @readonly
	 *
	 * @example
	 * console.log(my_font.Height); // 15
	 */
	readonly Height: number

	/**
	 * @type {string}
	 * @readonly
	 *
	 * @example
	 * console.log(my_font.Name); // Segoe UI
	 */
	readonly Name: string

	/**
	 * @type {float}
	 * @readonly
	 *
	 * @example
	 * console.log(my_font.Size); // 12
	 */
	readonly Size: number

	/**
	 * See Flags.js > FontStyle for value interpretation.
	 *
	 * @type {uint}
	 * @readonly
	 *
	 * @example
	 * console.log(my_font.Style);
	 */
	readonly Style: number
}

/**
 * Typically used inside `on_paint`.<br>
 *
 * Note: there are many different ways to get colours:
 * window.GetColourDUI/window.GetColourCUI,
 * RGB function from Helpers.js, utils.ColourPicker and
 * etc.
 *
 * @constructor
 * @hideconstructor
 */
interface GdiGraphics {
	/**
	 * Calculates text height for {@link GdiGraphics#GdiDrawText}.<br>
	 * Note: this will only calculate the text height of one line.
	 *
	 * @param {string} str
	 * @param {GdiFont} font
	 * @return {uint}
	 */
	CalcTextHeight(str: string, font: GdiFont): number;

	/**
	 * Calculates text width for {@link GdiGraphics#GdiDrawText}.
	 *
	 * Note: When the str contains a kerning pair that is found in the specified
	 * font, the return value will be larger than the actual drawn width of the
	 * text. If accurate values are required, set use_exact to true.
	 *
	 * @param {string} str
	 * @param {GdiFont} font
	 * @param {boolean=} [use_exact=false] Uses a slower, but more accurate method of calculating text width which accounts for kerning pairs.
	 * @return {uint}
	 */
	CalcTextWidth(str: string, font: GdiFont, use_exact?: boolean): number

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} line_width
	 * @param {number} colour
	 */
	DrawEllipse(x: number, y: number, w: number, h: number, line_width: number, colour: number): void;

	/**
	 * @param {GdiBitmap} img
	 * @param {number} dstX
	 * @param {number} dstY
	 * @param {number} dstW
	 * @param {number} dstH
	 * @param {number} srcX
	 * @param {number} srcY
	 * @param {number} srcW
	 * @param {number} srcH
	 * @param {float=} [angle=0]
	 * @param {number=} [alpha=255] Valid values 0-255.
	 */
	DrawImage(img: GdiBitmap, dstX: number, dstY: number, dstW: number, dstH: number, srcX: number, srcY: number, srcW: number, srcH: number, angle?: number, alpha?: number): void;

	/**
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 * @param {number} line_width
	 * @param {number} colour
	 */
	DrawLine(x1: number, y1: number, x2: number, y2: number, line_width: number, colour: number): void;

	/**
	 * @param {number} colour
	 * @param {number} line_width
	 * @param {Array<Array<number>>} points
	 */
	DrawPolygon(colour: number, line_width: number, points: Array<Array<number>>): void;

	/**
	 * Should be only used when {@link GdiGraphics#GdiDrawText} is not applicable.
	 *
	 * @param {string} str
	 * @param {GdiFont} font
	 * @param {number} colour
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number=} [flags=0] See Flags.js > StringFormatFlags
	 */
	DrawString(str: string | number, font: GdiFont, colour: number, x: number, y: number, w: number, h: number, flags?: number): void

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} line_width
	 * @param {number} colour
	 */
	DrawRect(x: number, y: number, w: number, h: number, line_width: number, colour: number): void;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} arc_width
	 * @param {number} arc_height
	 * @param {number} line_width
	 * @param {number} colour
	 */
	DrawRoundRect(x: number, y: number, w: number, h: number, arc_width: number, arc_height: number, line_width: number, colour: number): void;

	/**
	 * @param {string} str
	 * @param {GdiFont} font
	 * @param {number} max_width
	 * @return {Array<Array>}
	 *    index | meaning <br>
	 *    [0] text line 1 <br>
	 *    [1] width of text line 1 (in pixel) <br>
	 *    [2] text line 2 <br>
	 *    [3] width of text line 2 (in pixel) <br>
	 *    ... <br>
	 *    [2n + 2] text line n <br>
	 *    [2n + 3] width of text line n (px)
	 */
	EstimateLineWrap(str: number, font: GdiFont, max_width: number): Array<Array<string | number>>

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} colour
	 */
	FillEllipse(x: number, y: number, w: number, h: number, colour: number): void;

	/**
	 * Note: this may appear buggy depending on rectangle size. The easiest fix is
	 * to adjust the "angle" by a degree or two.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {float} angle
	 * @param {number} colour1
	 * @param {number} colour2
	 * @param {float} [focus=1.0] Specify where the centred colour will be at its highest intensity. Valid values between 0 and 1.
	 */
	FillGradRect(x: number, y: number, w: number, h: number, angle: number, colour1: number, colour2: number, focus?: number): void;

	/**
	 * @param {number} colour
	 * @param {number} fillmode 0 alternate, 1 winding.
	 * @param {Array<Array<number>>} points
	 */
	FillPolygon(colour: number, fillmode: number, points: Array<Array<number>>): void;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} arc_width
	 * @param {number} arc_height
	 * @param {number} colour
	 */
	FillRoundRect(x: number, y: number, w: number, h: number, arc_width: number, arc_height: number, colour: number): void

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number} colour
	 */
	FillSolidRect(x: number, y: number, w: number, h: number, colour: number): void

	/**
	 * @param {GdiRawBitmap} img
	 * @param {number} dstX
	 * @param {number} dstY
	 * @param {number} dstW
	 * @param {number} dstH
	 * @param {number} srcX
	 * @param {number} srcY
	 * @param {number} srcW
	 * @param {number} srcH
	 * @param {number=} [alpha=255] Valid values 0-255.
	 */
	GdiAlphaBlend(img: GdiBitmap, dstX: number, dstY: number, dstW: number, dstH: number, srcX: number, srcY: number, srcW: number, srcH: number, alpha?: number): void

	/**
	 * Always faster than {@link GdiGraphics#DrawImage}, does not support alpha channel.
	 *
	 * @param {GdiRawBitmap} img
	 * @param {number} dstX
	 * @param {number} dstY
	 * @param {number} dstW
	 * @param {number} dstH
	 * @param {number} srcX
	 * @param {number} srcY
	 * @param {number} srcW
	 * @param {number} srcH
	 */
	GdiDrawBitmap(img: GdiBitmap, dstX: number, dstY: number, dstW: number, dstH: number, srcX: number, srcY: number, srcW: number, srcH: number): void

	/**
	 * Provides faster and better rendering than {@link GdiGraphics#DrawString}.<br>
	 * <br>
	 * Do not use this to draw text on transparent background or
	 * with GdiGraphics other than the one passed in {@link module:callbacks~on_paint on_paint} callback:
	 * this will result in visual artifacts caused by ClearType hinting.<br>
	 * Use {@link GdiGraphics#DrawString} instead in such cases.<br>
	 * <br>
	 * To calculate text dimensions use {@link GdiGraphics#CalcTextHeight}, {@link GdiGraphics#CalcTextWidth}.<br>
	 * <br>
	 * Note: uses special rules for `&` character by default, which consumes the `&` and causes the next character to be underscored.
	 * This behaviour can be changed (or disabled) via `format` parameter.
	 *
	 * @param {string} str
	 * @param {GdiFont} font
	 * @param {number} colour
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number=} [format=0] See Flags.js > DT_*
	 */
	GdiDrawText(str: string | number, font: GdiFont, colour: number, x: number, y: number, w: number, h: number, format?: number): void

	/**
	 * Calculates text dimensions for {@link GdiGraphics#DrawString}.
	 *
	 * @param {string} str
	 * @param {GdiFont} font
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number=} [flags=0] See Flags.js > StringFormatFlags
	 * @return {MeasureStringInfo}
	 */
	MeasureString(str: string | number, font: GdiFont, x: number, y: number, w: number, h: number, flags?: number): MeasureStringInfo;

	/**
	 * @constructor
	 * @hideconstructor
	 *
	 * @example
	 * include(`${fb.ComponentPath}docs\\Flags.js`);
	 * include(`${fb.ComponentPath}docs\\Helpers.js`);
	 *
	 * let sf = StringFormat(StringAlignment.Near, StringAlignment.Near);
	 * let text = utils.ReadTextFile("z:\\info.txt");
	 * let font = window.GetFontDUI(0);
	 *
	 * function on_paint(gr) {
	 *     gr.DrawString(text, font, RGB(255, 0, 0), 0, 0, window.Width, window.Height, sf);
	 *     let temp = gr.MeasureString(text, font, 0, 0, window.Width, 10000, sf);
	 *     // If we want to calculate height, we must set the height to be far larger than what
	 *     // the text could possibly be.
	 *
	 *     console.log(temp.Height); // 2761.2421875 // far larger than my panel height!
	 *     console.log(temp.Chars); // 7967
	 * }
	 */

	/**
	 * @param {number=} [mode=0] See Flags.js > InterpolationMode
	 */
	SetInterpolationMode(mode?: number): void

	/**
	 * @param {number=} [mode=0] See Flags.js > SmoothingMode
	 */
	SetSmoothingMode(mode?: number): void;

	/**
	 * @param {number=} [mode=0] See Flags.js > TextRenderingHint
	 */
	SetTextRenderingHint(mode?: number): void
}

interface MeasureStringInfo {

	/**
	 * @type {number}
	 * @readonly
	 */
	readonly Chars: number;

	/**
	 * @type {float}
	 * @readonly
	 */
	readonly Height: number

	/**
	 * @type {number}
	 * @readonly
	 */
	readonly Lines: number;

	/**
	 * @type {float}
	 * @readonly
	 */
	readonly X: number;

	/**
	 * @type {float}
	 * @readonly
	 */
	readonly Y: number;

	/**
	 * @type {float}
	 * @readonly
	 */
	readonly Width: number
}

/**
 * @constructor
 * @hideconstructor
 */
interface GdiRawBitmap {

	/**
	 * @type {uint}
	 * @readonly
	 */
	readonly Width: number;

	/**
	 * @type {uint}
	 * @readonly
	 */
	readonly Height: number;
}

/**
 * @constructor
 * @hideconstructor
 */
interface DropTargetAction {

	/** @type {number} */
	Base: number;

	/**
	 * See {@link https://docs.microsoft.com/en-us/windows/win32/com/dropeffect-constants}
	 *
	 * @type {number}
	 */
	Effect: number;

	/**
	 * Active playlist.<br>
	 * -1 by default.<br>
	 * <br>
	 * Note: property is write-only.
	 *
	 * @type {number}
	 */
	Playlist: number;

	/**
	 * The tooltip text that is displayed during dragging.<br>
	 * If the property is not modified, then default tooltip text will be used.
	 * <br>
	 * Note: property is write-only.
	 *
	 * @type {string}
	 */
	Text: string;

	/**
	 * Note: property is write-only.
	 *
	 * @type {boolean}
	 */
	ToSelect: boolean;

	/**
	 * True, if the drag session was started by {@link fb.DoDragDrop}.
	 * False, otherwise.
	 *
	 * @type {boolean}
	 * @readonly
	 */
	readonly IsInternal: boolean;
}

/**
 * @constructor
 * @hideconstructor
 */
interface ContextMenuManager {
	/**
	 * @param {MenuObject} menu_obj
	 * @param {number} base_id
	 * @param {number=} [max_id=-1]
	 */
	BuildMenu(menu_obj: MenuObject, base_id: number, max_id?: number): void;

	/**
	 * @param {number} id
	 * @return {boolean}
	 */
	ExecuteByID(id: number): boolean;

	/**
	 * Initializes context menu by supplied tracks.
	 *
	 * @param {FbMetadbHandleList} handle_list
	 */
	InitContext(handle_list: FbMetadbHandleList): void;

	/**
	 * Shows playlist specific options that aren't available when passing a
	 * handle list to {@link ContextMenuManager#InitContext}.
	 */
	InitContextPlaylist(): void

	/**
	 * Initializes context menu by currently played track.
	 *
	 * @method
	 */
	InitNowPlaying(): void
}

/**
 * @constructor
 * @hideconstructor
 */
interface MainMenuManager {
	/**
	 * @param {MenuObject} menu_obj
	 * @param {number} base_id
	 * @param {number} count
	 */
	BuildMenu(menu_obj: MenuObject, base_id: number, count: number): void;

	/**
	 * @param {number} id
	 * @return {boolean}
	 */
	ExecuteByID(id: number): boolean;

	/**
	 * @param {string} root_name Must be one of the following: 'file', 'view', 'edit', 'playback', 'library', 'help'
	 */
	Init(root_name: "file" | "view" | "edit" | "playback" | "library" | "help"): void;
}


/**
 * @constructor
 * @hideconstructor
 */
interface MenuObject {

	/**
	 * @param {number} flags See Flags.js > Used in AppendMenuItem()
	 * @param {number} item_id Integer greater than 0. Each menu item needs a unique id.
	 * @param {string} text
	 */
	AppendMenuItem(flags: number, item_id: number, text: string): void;

	/** @method */
	AppendMenuSeparator(): void;

	/**
	 * @param {MenuObject} parent_menu
	 * @param {number} flags See Flags.js > Used in AppendMenuItem()
	 * @param {string} text
	 */
	AppendTo(parent_menu: MenuObject, flags: number, text: string): void;

	/**
	 * @param {number} item_id
	 * @param {boolean} check
	 */
	CheckMenuItem(item_id: number, check: boolean): void;

	/**
	 * @param {number} first_item_id
	 * @param {number} last_item_id
	 * @param {number} selected_item_id
	 */
	CheckMenuRadioItem(first_item_id: number, last_item_id: number, selected_item_id: number): void;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number=} [flags=0] See Flags.js > Used in TrackPopupMenu().
	 * @return {number}
	 */
	TrackPopupMenu(x: number, y: number, flags?: number): number;
}

/**
 * @constructor
 * @hideconstructor
 */
interface ThemeManager {
	/**
	 * @param {GdiGraphics} gr
	 * @param {number} x
	 * @param {number} y
	 * @param {number} w
	 * @param {number} h
	 * @param {number=} [clip_x=0]
	 * @param {number=} [clip_y=0]
	 * @param {number=} [clip_w=0]
	 * @param {number=} [clip_h=0]
	 */
	DrawThemeBackground(gr: GdiGraphics, x: number, y: number, w: number, h: number, clip_x?: number, clip_y?: number, clip_w?: number, clip_h?: number): void // (void) [, clip_x][, clip_y][, clip_w][, clip_h]

	/**
	 * @param {number} partid
	 * @return {boolean}
	 */
	IsThemePartDefined(partid: number): boolean;

	/**
	 * See {@link https://docs.microsoft.com/en-us/windows/win32/controls/parts-and-states}
	 *
	 * @param {number} partid
	 * @param {number=} [stateid=0]
	 */
	SetPartAndStateID(partid: number, stateid?: number): void;
}
