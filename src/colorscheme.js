/**
 * @description 
 */

import { ColorTypeCUI, ColorTypeDUI, RGB, toRGB } from "./common";
import { ppt } from "./configure";

export class ColorTheme {
  constructor() {
    this.text;
    this.secondaryText;
    this.background;
    this.textSelection;
    this.highlight;
  }
}

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
    background: window.GetColourDUI(ColorTypeDUI.background),
    highlight: window.GetColourDUI(ColorTypeDUI.highlight)
  }
}

function getCUIColors() {
  return {
    text: window.GetColourCUI(ColorTypeCUI.text),
    selection: window.GetColourCUI(ColorTypeCUI.selection_text),
    background: window.GetColourCUI(ColorTypeCUI.background),
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
    selection: utils.GetSysColour(COLOR_HIGHLIGHT)
  }
}

function parsePSSColor(str) {
  let rgb = str.match(/^\s*(\d+)-(\d+)-(\d+)\s*$/);
  if (rgb) {
    return RGB(rgb[1], rgb[1], rgb[2]);
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
    background: colorFromProperty("CUSTOM COLOR BACKGROUND NORMAL", "025-025-035"),
    selection: colorFromProperty("CUSTOM COLOR BACKGROUND SELECTION", "015-177-255"),
    highlight: colorFromProperty("CUSTOM COLOR HIGHLIGHT", "255-175-050")
  }
}


export let globalColors;

export const ColorMode = {
  Sys: 0,
  Fb: 1,
  Custom: 2
}

export function updateColors(colorMode) {
  switch (colorMode) {
    case ColorMode.Sys:
      globalColors = getSysColors();
      break;
    case ColorMode.Fb:
      globalColors = getFbColors();
      break;
    case ColorMode.Custom:
      globalColors = getCustomColors();
      break;
    default:
      ppt.colorMode = ColorMode.Fb;
      break;
  }
}