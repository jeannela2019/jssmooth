/**
 * @description
 */

import { ColorTypeCUI, ColorTypeDUI, RGB } from "./common";
import { ppt, colors, ColorMode } from "./configure";

const InstanceType = {
  DUI: 1,
  Other: 0,
}

export function getFbColors() {
  if (window.InstanceType === InstanceType.DUI) {
    return getDUIColors();
  } else {
    return getCUIColors();
  }
}

function getDUIColors() {
  return {
    text: window.GetColourDUI(ColorTypeDUI.text),
    selection: window.GetColourDUI(ColorTypeDUI.selection),
    selectedText: window.GetColourDUI(ColorTypeDUI.selection),
    background: window.GetColourDUI(ColorTypeDUI.background),
    highlight: window.GetColourDUI(ColorTypeDUI.highlight)
  }
}

function getCUIColors() {
  console.log("get cui colors");
  return {
    text: window.GetColourCUI(ColorTypeCUI.text),
    selection: window.GetColourCUI(ColorTypeCUI.selection_background),
    background: window.GetColourCUI(ColorTypeCUI.background),
    selectedText: window.GetColourCUI(ColorTypeCUI.selection_text),
    hightlight: window.GetColourCUI(ColorTypeCUI.active_item_frame),
  }
}

const COLOR_WINDOW = 5;
const COLOR_WINDOWTEXT = 8;
const COLOR_HIGHLIGHT = 13;
const COLOR_HIGHLIGHTTEXT = 14;

export function getSysColors() {
  return {
    text: utils.GetSysColour(COLOR_WINDOWTEXT),
    background: utils.GetSysColour(COLOR_WINDOW),
    highlight: utils.GetSysColour(COLOR_HIGHLIGHT),
    selection: utils.GetSysColour(COLOR_HIGHLIGHT),
    selectedText: utils.GetSysColour(COLOR_HIGHLIGHTTEXT),
  }
}

function parsePSSColor(str) {
  let rgb = str.match(/^\s*(\d+)-(\d+)-(\d+)\s*$/);
  if (rgb) {
		return RGB(rgb[1], rgb[2], rgb[3]);
  }
  return 0;
}

function colorFromProperty(key, value) {
  let resultColor = parsePSSColor(window.GetProperty(key, value));
  if (resultColor === 0) {
    resultColor = parsePSSColor(value)
    window.SetProperty(key, value);
  }
  return resultColor;
}

export function getCustomColors() {
  return {
    text: colorFromProperty("CUSTOM COLOR TEXT NORMAL", "180-180-180"),
    selectedText: colorFromProperty("CUSTOM COLOR TEXT SELECTION", "255-255-255"),
    background: colorFromProperty("CUSTOM COLOR BACKGROUND NORMAL", "025-025-035"),
    selection: colorFromProperty("CUSTOM COLOR BACKGROUND SELECTION", "015-177-255"),
    highlight: colorFromProperty("CUSTOM COLOR HIGHLIGHT", "255-175-050")
  }
}

export function updateColors() {
  switch (ppt.colorMode) {
    case ColorMode.Sys:
			Object.assign(colors, getSysColors());
      break;
    case ColorMode.Fb:
			Object.assign(colors, getFbColors());
      break;
    case ColorMode.Custom:
			Object.assign(colors, getCustomColors());
      break;
    default:
			ppt.colorMode = ColorMode.Sys;
      updateColors(ppt.colorMode);
      break;
  }
}
