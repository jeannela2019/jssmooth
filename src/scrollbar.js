import { blendColors, button, ButtonStates, DrawPolyStar, get_system_scrollbar_width, RGB } from "./common";
import { colors, ppt } from "./configure";
import { mouse } from "./mouse";



export const cScrollBar = {
  enabled: window.GetProperty("_DISPLAY: Show Scrollbar", true),
  visible: true,
  themed: false,
  defaultWidth: get_system_scrollbar_width(),
  width: get_system_scrollbar_width(),
  ButtonType: {
    cursor: 0,
    up: 1,
    down: 2
  },
  defaultMinCursorHeight: 20,
  minCursorHeight: 20,
  timerID: false,
  timerCounter: -1
};

export const oScrollbar = function (themed) {
  this.themed = themed;
  this.showButtons = true;
  this.buttons = [];
  this.buttonType = {
    cursor: 0,
    up: 1,
    down: 2
  };
  this.buttonClick = false;

  this.color_bg = colors.background;
  this.color_txt = colors.text;
  this.scroll = 0;
  this.scroll_ = 0;
  this.scroll_prev = 0;

  this.check_scroll = (scroll___) => {
    if (scroll___ < 0) {
      scroll___ = 0;
    }
    var g1 = this.parentView.h - (this.parentView.totalRowsVis * ppt.rowHeight);
    var end_limit = (this.parentView.rowsCount * ppt.rowHeight) - (this.parentView.totalRowsVis * ppt.rowHeight) - g1
    if (scroll___ !== 0 && scroll___ > end_limit) {
      scroll___ = end_limit;
    }
    return scroll___;
  }

  if (this.themed) {
    this.theme = window.CreateThemeManager("scrollbar");
  } else {
    this.theme = false;
  }

  this.parentView;

  this.setNewColors = function () {
    this.color_bg = colors.background;
    this.color_txt = colors.text;
    this.setButtons();
    this.setCursorButton();
  };

  this.setButtons = function () {
    // normal scroll_up Image
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      this.upImage_normal = gdi.CreateImage(this.w, this.w);
      var gb = this.upImage_normal.GetGraphics();
      try {
        this.theme.SetPartAndStateId(1, 1);
        this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
      } catch (e) {
        DrawPolyStar(gb, 4, 4, this.w - 8, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.5), 0, 255);
      }
    } else {
      this.upImage_normal = gdi.CreateImage(70, 70);
      var gb = this.upImage_normal.GetGraphics();
      DrawPolyStar(gb, 11, 16, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.5), 0, 255);
    }
    this.upImage_normal.ReleaseGraphics(gb);

    // hover scroll_up Image
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      this.upImage_hover = gdi.CreateImage(this.w, this.w);
      gb = this.upImage_hover.GetGraphics();
      try {
        this.theme.SetPartAndStateId(1, 2);
        this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
      } catch (e) {
        DrawPolyStar(gb, 4, 4, this.w - 8, 1, 3, 0, blendColors(this.color_txt, this.color_bg, 0.3), blendColors(this.color_txt, this.color_bg, 0.3), 0, 255);
      }
    } else {
      this.upImage_hover = gdi.CreateImage(70, 70);
      var gb = this.upImage_hover.GetGraphics();
      DrawPolyStar(gb, 11, 16, 44, 1, 3, 0, blendColors(this.color_txt, this.color_bg, 0.3), blendColors(this.color_txt, this.color_bg, 0.3), 0, 255);
    }
    this.upImage_hover.ReleaseGraphics(gb);

    // down scroll_up Image
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      this.upImage_down = gdi.CreateImage(this.w, this.w);
      gb = this.upImage_down.GetGraphics();
      try {
        this.theme.SetPartAndStateId(1, 3);
        this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
      } catch (e) {
        DrawPolyStar(gb, 4, 4, this.w - 8, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.05), 0, 255);
      }
    } else {
      this.upImage_down = gdi.CreateImage(70, 70);
      gb = this.upImage_down.GetGraphics();
      DrawPolyStar(gb, 11, 13, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.05), 0, 255);
    }
    this.upImage_down.ReleaseGraphics(gb);

    // normal scroll_down Image
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      this.downImage_normal = gdi.CreateImage(this.w, this.w);
      gb = this.downImage_normal.GetGraphics();
      try {
        this.theme.SetPartAndStateId(1, 5);
        this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
      } catch (e) {
        DrawPolyStar(gb, 4, 4, this.w - 8, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.5), 180, 255);
      }
    } else {
      this.downImage_normal = gdi.CreateImage(70, 70);
      gb = this.downImage_normal.GetGraphics();
      DrawPolyStar(gb, 11, 10, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.5), 180, 255);
    }
    this.downImage_normal.ReleaseGraphics(gb);

    // hover scroll_down Image
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      this.downImage_hover = gdi.CreateImage(this.w, this.w);
      gb = this.downImage_hover.GetGraphics();
      try {
        this.theme.SetPartAndStateId(1, 6);
        this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
      } catch (e) {
        DrawPolyStar(gb, 4, 4, this.w - 8, 1, 3, 1, blendColors(this.color_txt, this.color_bg, 0.3), blendColors(this.color_txt, this.color_bg, 0.3), 180, 255);
      }
    } else {
      this.downImage_hover = gdi.CreateImage(70, 70);
      gb = this.downImage_hover.GetGraphics();
      DrawPolyStar(gb, 11, 10, 44, 1, 3, 1, blendColors(this.color_txt, this.color_bg, 0.3), blendColors(this.color_txt, this.color_bg, 0.3), 180, 255);
    }
    this.downImage_hover.ReleaseGraphics(gb);

    // down scroll_down Image
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      this.downImage_down = gdi.CreateImage(this.w, this.w);
      gb = this.downImage_down.GetGraphics();
      try {
        this.theme.SetPartAndStateId(1, 7);
        this.theme.DrawThemeBackground(gb, 0, 0, this.w, this.w);
      } catch (e) {
        DrawPolyStar(gb, 4, 4, this.w - 8, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.05), 180, 255);
      }
    } else {
      this.downImage_down = gdi.CreateImage(70, 70);
      gb = this.downImage_down.GetGraphics();
      DrawPolyStar(gb, 11, 13, 44, 1, 3, 0, RGB(0, 0, 0), blendColors(this.color_txt, this.color_bg, 0.05), 180, 255);
    }
    this.downImage_down.ReleaseGraphics(gb);

    for (let i = 1; i < 3; i++) {
      switch (i) {
        case this.buttonType.cursor:
          this.buttons[this.buttonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
          break;
        case this.buttonType.up:
          this.buttons[this.buttonType.up] = new button(this.upImage_normal.Resize(this.w, this.w, 2), this.upImage_hover.Resize(this.w, this.w, 2), this.upImage_down.Resize(this.w, this.w, 2));
          break;
        case this.buttonType.down:
          this.buttons[this.buttonType.down] = new button(this.downImage_normal.Resize(this.w, this.w, 2), this.downImage_hover.Resize(this.w, this.w, 2), this.downImage_down.Resize(this.w, this.w, 2));
          break;
      }
    }
  };

  this.setCursorButton = function () {
    // normal cursor Image
    this.cursorImage_normal = gdi.CreateImage(this.cursorw, this.cursorh);
    var gb = this.cursorImage_normal.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      try {
        this.theme.SetPartAndStateId(3, 1);
        this.theme.DrawThemeBackground(gb, 0, 0, this.cursorw, this.cursorh);
        if (this.cursorh >= 30) {
          this.theme.SetPartAndStateId(9, 1);
          this.theme.DrawThemeBackground(gb, 0, 0, this.cursorw, this.cursorh);
        }
      } catch (e) {
        gb.FillSolidRect(1, 0, this.cursorw - 2, this.cursorh, blendColors(this.color_txt, this.color_bg, 0.5));
      }
    } else {
      gb.FillSolidRect(1, 0, this.cursorw - 2, this.cursorh, blendColors(this.color_txt, this.color_bg, 0.5) & 0x88ffffff);
      gb.DrawRect(1, 0, this.cursorw - 2 - 1, this.cursorh - 1, 1.0, this.color_txt & 0x44ffffff);
    }
    this.cursorImage_normal.ReleaseGraphics(gb);

    // hover cursor Image
    this.cursorImage_hover = gdi.CreateImage(this.cursorw, this.cursorh);
    gb = this.cursorImage_hover.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      try {
        this.theme.SetPartAndStateId(3, 2);
        this.theme.DrawThemeBackground(gb, 0, 0, this.cursorw, this.cursorh);
        if (this.cursorh >= 30) {
          this.theme.SetPartAndStateId(9, 2);
          this.theme.DrawThemeBackground(gb, 0, 0, this.cursorw, this.cursorh);
        }
      } catch (e) {
        gb.FillSolidRect(1, 0, this.cursorw - 2, this.cursorh, blendColors(this.color_txt, this.color_bg, 0.3));
      }
    } else {
      gb.FillSolidRect(1, 0, this.cursorw - 2, this.cursorh, blendColors(this.color_txt, this.color_bg, 0.3) & 0x88ffffff);
      gb.DrawRect(1, 0, this.cursorw - 2 - 1, this.cursorh - 1, 1.0, this.color_txt & 0x44ffffff);
    }
    this.cursorImage_hover.ReleaseGraphics(gb);

    // down cursor Image
    this.cursorImage_down = gdi.CreateImage(this.cursorw, this.cursorh);
    gb = this.cursorImage_down.GetGraphics();
    // Draw Themed Scrollbar (lg/col)
    if (this.themed) {
      try {
        this.theme.SetPartAndStateId(3, 3);
        this.theme.DrawThemeBackground(gb, 0, 0, this.cursorw, this.cursorh);
        if (this.cursorh >= 30) {
          this.theme.SetPartAndStateId(9, 3);
          this.theme.DrawThemeBackground(gb, 0, 0, this.cursorw, this.cursorh);
        }
      } catch (e) {
        gb.FillSolidRect(1, 0, this.cursorw - 2, this.cursorh, blendColors(this.color_txt, this.color_bg, 0.05));
      }
    } else {
      gb.FillSolidRect(1, 0, this.cursorw - 2, this.cursorh, blendColors(this.color_txt, this.color_bg, 0.05) & 0x88ffffff);
      gb.DrawRect(1, 0, this.cursorw - 2 - 1, this.cursorh - 1, 1.0, this.color_txt & 0x44ffffff);
    }
    this.cursorImage_down.ReleaseGraphics(gb);

    // create/refresh cursor Button in buttons array
    this.buttons[this.buttonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down);
    this.buttons[this.buttonType.cursor].x = this.x;
    this.buttons[this.buttonType.cursor].y = this.cursory;
  };

  this.draw = function (gr) {
    // scrollbar background
    if (this.themed) {
      try {
        this.theme.SetPartAndStateId(6, 1);
        this.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h);
      } catch (e) {
        gr.FillSolidRect(this.x, this.y, this.w, this.h, this.color_bg & 0x25ffffff);
        gr.FillSolidRect(this.x, this.y, 1, this.h, this.color_txt & 0x05ffffff);
      }
    } else {
      gr.FillSolidRect(this.x, this.y, this.w, this.h, this.color_bg & 0x25ffffff);
      gr.FillSolidRect(this.x, this.y, 1, this.h, this.color_txt & 0x05ffffff);
    }
    // scrollbar buttons
    if (cScrollBar.visible)
      this.buttons[this.buttonType.cursor].draw(gr, this.x, this.cursory, 200);
    if (this.showButtons) {
      this.buttons[this.buttonType.up].draw(gr, this.x, this.y, 200);
      this.buttons[this.buttonType.down].draw(gr, this.x, this.areay + this.areah, 200);
    }
  };

  this.updateScrollbar = function () {
    var prev_cursorh = this.cursorh;
    this.total = this.parentView.rowsCount;
    this.rowh = ppt.rowHeight;
    this.totalh = this.total * this.rowh;
    // set scrollbar visibility
    cScrollBar.visible = (this.totalh > this.parentView.h);
    // set cursor width/height
    this.cursorw = cScrollBar.width;
    if (this.total > 0) {
      this.cursorh = Math.round((this.parentView.h / this.totalh) * this.areah);
      if (this.cursorh < cScrollBar.minCursorHeight)
        this.cursorh = cScrollBar.minCursorHeight;
    } else {
      this.cursorh = cScrollBar.minCursorHeight;
    }
    // set cursor y pos
    this.setCursorY();
    if (this.cursorw && this.cursorh && this.cursorh != prev_cursorh)
      this.setCursorButton();
  };

  this.setCursorY = function () {
    // set cursor y pos
    var ratio = this.scroll / (this.totalh - this.parentView.h);
    this.cursory = this.areay + Math.round((this.areah - this.cursorh) * ratio);
  };

  this.setSize = function () {
    this.buttonh = cScrollBar.width;
    this.x = this.parentView.x + this.parentView.w;
    this.y = this.parentView.y - ppt.headerBarHeight * 0;
    this.w = cScrollBar.width;
    this.h = this.parentView.h + ppt.headerBarHeight * 0;
    if (this.showButtons) {
      this.areay = this.y + this.buttonh;
      this.areah = this.h - (this.buttonh * 2);
    } else {
      this.areay = this.y;
      this.areah = this.h;
    }
    this.setButtons();
  };

  this.setScrollFromCursorPos = function () {
    // calc ratio of the scroll cursor to calc the equivalent item for the full list (with gh)
    var ratio = (this.cursory - this.areay) / (this.areah - this.cursorh);
    // calc idx of the item (of the full list with gh) to display at top of the panel list (visible)
    this.scroll = Math.round((this.totalh - this.parentView.h) * ratio);
  };

  this.cursorCheck = function (event, x, y) {
    if (!this.buttons[this.buttonType.cursor])
      return;
    switch (event) {
      case "down":
        var tmp = this.buttons[this.buttonType.cursor].checkstate(event, x, y);
        if (tmp == ButtonStates.down) {
          this.cursorClickX = x;
          this.cursorClickY = y;
          this.cursorDrag = true;
          this.cursorDragDelta = y - this.cursory;
        }
        break;
      case "up":
        this.buttons[this.buttonType.cursor].checkstate(event, x, y);
        if (this.cursorDrag) {
          this.setScrollFromCursorPos();
          this.parentView.repaint();
        }
        this.cursorClickX = 0;
        this.cursorClickY = 0;
        this.cursorDrag = false;
        break;
      case "move":
        this.buttons[this.buttonType.cursor].checkstate(event, x, y);
        if (this.cursorDrag) {
          this.cursory = y - this.cursorDragDelta;
          if (this.cursory + this.cursorh > this.areay + this.areah) {
            this.cursory = (this.areay + this.areah) - this.cursorh;
          }
          if (this.cursory < this.areay) {
            this.cursory = this.areay;
          }
          this.setScrollFromCursorPos();
          this.parentView.repaint();
        }
        break;
      case "leave":
        this.buttons[this.buttonType.cursor].checkstate(event, 0, 0);
        break;
    }
  };

  this._isHover = function (x, y) {
    return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
  };

  this._isHoverArea = function (x, y) {
    return (x >= this.x && x <= this.x + this.w && y >= this.areay && y <= this.areay + this.areah);
  };

  this._isHoverCursor = function (x, y) {
    return (x >= this.x && x <= this.x + this.w && y >= this.cursory && y <= this.cursory + this.cursorh);
  };

  this.on_mouse = function (event, x, y, delta) {
    this.isHover = this._isHover(x, y);
    this.isHoverArea = this._isHoverArea(x, y);
    this.isHoverCursor = this._isHoverCursor(x, y);
    this.isHoverButtons = this.isHover && !this.isHoverCursor && !this.isHoverArea;
    this.isHoverEmptyArea = this.isHoverArea && !this.isHoverCursor;

    var scroll_step = ppt.rowHeight;
    var scroll_step_page = this.parentView.h;

    switch (event) {
      case "down":
      case "dblclk":
        if ((this.isHoverCursor || this.cursorDrag) && !this.buttonClick && !this.isHoverEmptyArea) {
          this.cursorCheck(event, x, y);
        } else {
          // buttons events
          var bt_state = ButtonStates.normal;
          for (var i = 1; i < 3; i++) {
            switch (i) {
              case 1: // up button
                bt_state = this.buttons[i].checkstate(event, x, y);
                if ((event == "down" && bt_state == ButtonStates.down) || (event == "dblclk" && bt_state == ButtonStates.hover)) {
                  this.buttonClick = true;
                  this.scroll = this.scroll - scroll_step;
                  this.scroll = this.check_scroll(this.scroll);
                  if (!cScrollBar.timerID) {
										cScrollBar.timerID = window.SetInterval(() => {
                      if (cScrollBar.timerCounter > 6) {
                        this.scroll = this.scroll - scroll_step;
                        this.scroll = this.check_scroll(this.scroll);
                      } else {
                        cScrollBar.timerCounter++;
                      }
                    }, 80);
                  }
                }
                break;
              case 2: // down button
                bt_state = this.buttons[i].checkstate(event, x, y);
                if ((event == "down" && bt_state == ButtonStates.down) || (event == "dblclk" && bt_state == ButtonStates.hover)) {
                  this.buttonClick = true;
                  this.scroll = this.scroll + scroll_step;
                  this.scroll = this.check_scroll(this.scroll);
                  if (!cScrollBar.timerID) {
										cScrollBar.timerID = window.SetInterval(() => {
                      if (cScrollBar.timerCounter > 6) {
                        this.scroll = this.scroll + scroll_step;
                        this.scroll = this.check_scroll(this.scroll);
                      } else {
                        cScrollBar.timerCounter++;
                      }
                    }, 80);
                  }
                }
                break;
            }
          }
          if (!this.buttonClick && this.isHoverEmptyArea) {
            // check click on empty area scrollbar
            if (y < this.cursory) {
              // up
              this.buttonClick = true;
              this.scroll = this.scroll - scroll_step_page;
              this.scroll = this.check_scroll(this.scroll);
              if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(() => {
                  if (cScrollBar.timerCounter > 6 && mouse.y < this.parentView.scrollbar.cursory) {
                    this.scroll = this.scroll - scroll_step_page;
                    this.scroll = this.check_scroll(this.scroll);
                  } else {
                    cScrollBar.timerCounter++;
                  }
                }, 80);
              }
            } else {
              // down
              this.buttonClick = true;
              this.scroll = this.scroll + scroll_step_page;
              this.scroll = this.check_scroll(this.scroll);
              if (!cScrollBar.timerID) {
								cScrollBar.timerID = window.SetInterval(() => {
                  if (cScrollBar.timerCounter > 6 && mouse.y > this.parentView.scrollbar.cursory + this.parentView.scrollbar.cursorh) {
                    this.scroll = this.scroll + scroll_step_page;
                    this.scroll = this.check_scroll(this.scroll);
                  } else {
                    cScrollBar.timerCounter++;
                  }
                }, 80);
              }
            }
          }
        }
        break;
      case "right":
      case "up":
        if (cScrollBar.timerID) {
          window.ClearInterval(cScrollBar.timerID);
          cScrollBar.timerID = false;
        }
        cScrollBar.timerCounter = -1;

        this.cursorCheck(event, x, y);
        for (var i = 1; i < 3; i++) {
          this.buttons[i].checkstate(event, x, y);
        }
        this.buttonClick = false;
        break;
      case "move":
        this.cursorCheck(event, x, y);
        for (var i = 1; i < 3; i++) {
          this.buttons[i].checkstate(event, x, y);
        }
        break;
      case "wheel":
        if (!this.buttonClick) {
          this.updateScrollbar();
        }
        break;
      case "leave":
        this.cursorCheck(event, 0, 0);
        for (var i = 1; i < 3; i++) {
          this.buttons[i].checkstate(event, 0, 0);
        }
        break;
    }
  };
};
