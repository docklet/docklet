var triggerPortalWindow = function() {
	MyDesktop.postMessage('docker.dashboard.portal.list', {});
};

portalWindow = Ext.extend(AppWin.AbstractWindow, {
	id : 'portal-win',
	label : 'My Portals',
	bigIcon : 'goa-panel.png',
	
	width: 380,
	
	register : function() {
		userSpace.portalWindow = this;
	},

	createEvent : function() {
		triggerPortalWindow();
	},
	
	prepareItems : function(obj) {
		if (!obj.success)
			return null;
		
		var portals = [];
		for (var i=0;i<obj.portals.length;i++)
			portals.push([obj.portals[i].portal, obj.portals[i].status]);

		var win=this.window, items = [{
			layout: 'border',
			title: 'My Applied Portals',
			split:true, collapsible:true,
			items: [ new Ext.grid.GridPanel({
				id: 'portal-list-grid',
				region: 'center',
				border : false,
				ds : new Ext.data.Store({
					autoLoad:true,
					reader : new Ext.data.ArrayReader({}, [{ name : 'portal' }, { name : 'status' }]),
					data : portals
				}),
				cm : new Ext.grid.ColumnModel([
					new Ext.grid.RowNumberer(),
					{ header : "Portal", width:180, sortable : true, dataIndex : 'portal' },
					{ header : "Status", width:120, sortable : true, dataIndex : 'status' },
				]),
				autoHeight: true,
				monitorResize: true,
				listeners : {
					'rowdblclick' : function() {
					}
				},
			}), {
				region: 'south',
				buttons: [{
					text: 'Apply Portal',
					handler: function() {
						userSpace.afterApplyPortal = triggerPortalWindow;
						win.handle.close();
						MyDesktop.postMessage('docker.dashboard.portal.app', { });
					}
				},{
					text: 'Delete',
					handler: function() {
						var record = Ext.getCmp('portal-list-grid').getSelectionModel().getSelected();
						if (record==null || record.get('status')=='active')
							return MyDesktop.messageBox('You are supposed to select an inactive portal.');
						userSpace.afterRemovePortal = triggerPortalWindow;
						win.handle.close();
						MyDesktop.postMessage('docker.dashboard.portal.remove', { portal: record.get('portal') });
					}
				}]
			}]
		}];
		return items;
	}
});

AppWin.GenericWindows.push({
	visible: [true, true],
	window: portalWindow
});

