AppWin = new Object();

AppWin.AbstractWindow = Ext.extend(Ext.app.Module, {
	id : 'common-win',
	label : 'Common Window',
	smallIcon : 'settings',
	bigIcon : '',
	
	width: 600,
	height: 400,
	
	register : function() {
	},

	init : function() {
		var list = document.getElementById('shortcutList');
		list.innerHTML+='<dt id="'+this.id+'-shortcut"><a href="#"><img src="images/s.gif"'+
			'style="height:48px;width:48px;background-image: url(images/app-icon/'+this.bigIcon+'); box-shadow: 0px 0px 5px gray" /><div style="margin-top:5px; font-size:12px; text-shadow: 1px 1px #000000">'+this.label+'</div></a></dt>';

		this.launcher = {
			//menu: { items: [{ text: 'menu-item', iconCls:'bogus', handler : function() {} }] },
			text : this.label,
			iconCls : this.smallIcon,
			handler : this.createWindow,
			scope : this
		}
	},
	
	prepareItems : function() {
		return [];
	},

	afterPrepare : function() {
	},
	
	window : new Object(),
	
	createEvent : function() {
		this.createWindow();
	},
	
	createWindow : function(obj) {
		var desktop = this.app.getDesktop();
		var thisWindow = this, win = desktop.getWindow(this.id);
		if (!win) {
			var asyncCreateWindow = function() {
				var items = thisWindow.prepareItems(obj);
				if (items == null)
					return;
				win = desktop.createWindow({
					id : thisWindow.id,
					title : thisWindow.label,
					width : thisWindow.width,
					height : thisWindow.height,
					iconCls : thisWindow.smallIcon,
					shim : false,
					animCollapse : false,
					constrainHeader : true,
					plain: true,
					layout : 'fit',
					items : items
				});
				thisWindow.window.handle = win;
				thisWindow.afterPrepare(obj);
				win.show();
			}
			setTimeout(function(){ asyncCreateWindow(); }, 10);
		} else
			win.show();
	}
});

AppWin.GenericWindows = [];

