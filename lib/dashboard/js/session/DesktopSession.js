MyDesktop = new Ext.app.App( {

	init : function() {
		Ext.QuickTips.init();
	},

	getModules : function() {
		var appWindows = [];
		var level = userSpace.level;
		for (var i=0; i!=AppWin.GenericWindows.length;i++) {
			var appItem = AppWin.GenericWindows[i];
			if (appItem.visible[level]) {
				var widget = new appItem.window();
				widget.register();
				appWindows.push(widget);
			}
		}
		return appWindows;
	},

	getStartConfig : function() {
		var userName = this.getGatewayUsername();

		var struct = {
			title : userName,
			iconCls : 'member',
			toolItems : [ '-', {
				text : 'Unias.Org',
				//iconCls : 'user-kid',
				scope : this,
				listeners : {
					click : function() {
						window.open('http://www.unias.org');
					}
				}
			}, {
				text : 'Contact Us',
				//iconCls : 'user-girl',
				scope : this,
				listeners : {
					click : function() {
						window.open('mailto:unias@sei.pku.edu.cn');
					}
				}
			}, '-', {
				text : 'Logout',
				iconCls : 'logout',
				scope : this,
				listeners : {
					click : function() {
						MyDesktop.confirmBox("Are you sure to logout? Any running clusters will be continuly in service.", function(reply) {
							if (reply=="yes")
								location.reload();
						});
					}
				}
			} ]
		};
		return struct;
	}
});

