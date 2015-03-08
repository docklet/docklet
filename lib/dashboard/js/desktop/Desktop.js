
Ext.Desktop = function(app) {
	this.taskbar = new Ext.ux.TaskBar(app);
	var taskbar = this.taskbar;

	var desktopEl = Ext.get('x-desktop');
	var taskbarEl = Ext.get('ux-taskbar');
	var shortcuts = Ext.get('x-shortcuts');

	var windows = new Ext.WindowGroup();
	var activeWindow;

	function minimizeWin(win) {
		win.minimized = true;
		win.hide();
	}

	function markActive(win) {
		if (activeWindow && activeWindow != win) {
			markInactive(activeWindow);
		}
		taskbar.setActiveButton(win.taskButton);
		activeWindow = win;
		Ext.fly(win.taskButton.el).addClass('active-win');
		win.minimized = false;
	}

	function markInactive(win) {
		if (win == activeWindow) {
			activeWindow = null;
			Ext.fly(win.taskButton.el).removeClass('active-win');
		}
	}

	function removeWin(win) {
		taskbar.removeTaskButton(win.taskButton);
		layout();
	}

	var padding = 16, elementWidth = 72, elementHeight = 84;
	
	function layout() {
		var desktopHeight = Ext.lib.Dom.getViewHeight() - taskbarEl.getHeight();
		desktopEl.setHeight(desktopHeight);

		var items=Ext.query("dt", shortcuts.dom), posX = padding, posY = padding;
		for(var i = 0, len = items.length; i < len; i++) {
			Ext.fly(items[i]).setXY([posX, posY]);
			posY += elementHeight;
			if (posY + elementHeight > desktopHeight) {
				posX += elementWidth;
				posY = padding;
			}
		}
		/*if (Ext.getCmp('notify-win').getEl().setStyle) {
			Ext.getCmp('notify-win').getEl().setStyle('z-index','9002');
			Ext.getCmp('notify-win').setPosition(MyDesktop.desktop.getWinWidth()-380,30);
		}*/
	}
	
	Ext.EventManager.onWindowResize(layout, this, {delay:100});

	this.layout = layout;

	this.createWindow = function(config, cls) {
		var win = new (cls || Ext.Window)(Ext.applyIf(config || {}, {
			manager : windows,
			minimizable : true,
			maximizable : true
		}));
		win.render(desktopEl);
		win.taskButton = taskbar.addTaskButton(win);

		win.cmenu = new Ext.menu.Menu({
			items : []
		});

		win.animateTarget = win.taskButton.el;

		win.on({
			'activate' : {
				fn : markActive
			},
			'beforeshow' : {
				fn : markActive
			},
			'deactivate' : {
				fn : markInactive
			},
			'minimize' : {
				fn : minimizeWin
			},
			'close' : {
				fn : removeWin
			}
		});

		layout();
		return win;
	};

	this.getManager = function() {
		return windows;
	};

	this.getWindow = function(id) {
		return windows.get(id);
	}

	this.getWinWidth = function() {
		var width = Ext.lib.Dom.getViewWidth();
		return width < 200 ? 200 : width;
	}

	this.getWinHeight = function() {
		var height = (Ext.lib.Dom.getViewHeight() - taskbarEl.getHeight());
		return height < 100 ? 100 : height;
	}

	this.getWinX = function(width) {
		return (Ext.lib.Dom.getViewWidth() - width) / 2;
	}

	this.getWinY = function(height) {
		return (Ext.lib.Dom.getViewHeight() - taskbarEl.getHeight() - height) / 2;
	}

	layout();

	if (shortcuts) {
		shortcuts.on('click', function(e, t) {
			if (t = e.getTarget('dt', shortcuts)) {
				e.stopEvent();
				var module = app.getModule(t.id.replace('-shortcut', ''));
				if (module)
					module.createEvent();
			}
		});
	}
};

