var triggerClusterWindow = function() {
	MyDesktop.postMessage('docker.dashboard.cluster.list', {});
};

clusterWindow = Ext.extend(AppWin.AbstractWindow, {
	id : 'cluster-win',
	label : 'Clusters',
	bigIcon : 'unetbootin.png',
	
	register : function() {
		userSpace.clusterWindow = this;
	},

	createEvent : function() {
		triggerClusterWindow();
	},
	
	prepareItems : function(obj) {
		if (!obj.success) {
			MyDesktop.messageBox('Cannot load pages, please re-login docklet!');
			return null;
		}
		
		var openVNC = function() {
			/*var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
			if (record==null)
				return MyDesktop.messageBox('You are supposed to select a portal.');
			window.open('http://'+record.get('portal')+':1501/');*/
		};
		
		var clusters = [];
		for (var i=0;i<obj.clusters.length;i++) {
			var prefix = '10.0.'+obj.clusters[i].id+'.';
			var nat = prefix+'0/24; master: '+prefix+'254.';
			/*var nat = prefix+'0/24; master: '+prefix+'254, slaves: ';
			if (obj.clusters[i].size>1)
				nat+=prefix+'1-'+prefix+(obj.clusters[i].size-1);
			else
				nat+='-';*/
			clusters.push([obj.clusters[i].id, obj.clusters[i].user, obj.clusters[i].portal, obj.clusters[i].image, nat]);
		}

		var win=this.window, items = [{
			layout: 'border',
			title: 'My Runnning Clusters',
			split:true, collapsible:true,
			items: [ new Ext.grid.GridPanel({
				id: 'cluster-list-grid',
				region: 'center',
				border : false,
				ds : new Ext.data.Store({
					autoLoad:true,
					reader : new Ext.data.ArrayReader({}, [{ name : 'id' }, { name : 'user' }, { name : 'portal' }, { name : 'image' }, { name : 'nat' }]),
					data : clusters
				}),
				cm : new Ext.grid.ColumnModel([
					new Ext.grid.RowNumberer(),
					{ header : "ID", width:40, sortable : true, dataIndex : 'id' },
					{ header : "User", width:80, sortable : true, dataIndex : 'user' },
					{ header : "Portal", width:100, sortable : true, dataIndex : 'portal' },
					{ header : "Image", width:150, sortable : true, dataIndex : 'image' },
					{ header : "NAT VMs", width:200, sortable : true, dataIndex : 'nat' },
				]),
				autoHeight: true,
				monitorResize: true,
				listeners : {
					'rowdblclick' : function() {
						var portal = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected().get('portal')
						MyDesktop.messageBox('Your OpenSSH portal is: <span style="color:blue">root@'+portal+'</span><br/><br/>Use Secret-Key file to login the portal.');
					}
				},
			}), {
				region: 'south',
				buttons: [/*{
					text: 'Create Cluster',
					handler: function() {
						win.handle.close();
						MyDesktop.postMessage('docker.dashboard.source.entry', {});
					}
				},{
					text: 'Open VNC',
					handler: openVNC
				},{
					text: 'Reset My VNC Password',
					handler: function() {
						MyDesktop.confirmBox('This will reset vnc password of your clusters, are you sure to continue?', function(reply) {
							if (reply=='yes')
								MyDesktop.postMessage('docker.dashboard.resetVNC', { });
						})
					}
				},*/{
					text: 'Scale Up',
					handler: function() {
						var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
						if (record==null)
							return MyDesktop.messageBox('You are supposed to select a portal.');
						var id = record.get('id');
						if (record.get('user')!=MyDesktop.getGatewayUsername())
							return MyDesktop.messageBox('This cluster is not owned by you.');
						MyDesktop.postMessage('docker.dashboard.cluster.push', { id: id });
					}
				},{
					text: 'Scale Down',
					handler: function() {
						var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
						if (record==null)
							return MyDesktop.messageBox('You are supposed to select a portal.');
						var id = record.get('id');
						if (record.get('user')!=MyDesktop.getGatewayUsername())
							return MyDesktop.messageBox('This cluster is not owned by you.');
						MyDesktop.postMessage('docker.dashboard.cluster.pop', { id: id });
					}
				},{
					text: 'Repair Cluster',
					handler: function() {
						var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
						if (record==null)
							return MyDesktop.messageBox('You are supposed to select a portal.');
						var id = record.get('id');
						if (record.get('user')!=MyDesktop.getGatewayUsername())
							return MyDesktop.messageBox('This cluster is not owned by you.');
						MyDesktop.postMessage('docker.dashboard.cluster.repair', { id: id });
					}
				},{
					text: 'Restart Cluster',
					handler: function() {
						var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
						if (record==null)
							return MyDesktop.messageBox('You are supposed to select a portal.');
						var id = record.get('id');
						if (record.get('user')!=MyDesktop.getGatewayUsername())
							return MyDesktop.messageBox('This cluster is not owned by you.');
						MyDesktop.postMessage('docker.dashboard.cluster.restart', { id: id });
					}
				},{
					text: 'Save Master as Image ..',
					handler: function() {
						var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
						if (record==null)
							return MyDesktop.messageBox('You are supposed to select a portal.');
						var portal = record.get('portal');
						if (record.get('user')!=MyDesktop.getGatewayUsername())
							return MyDesktop.messageBox('This cluster is not owned by you.');

						var limit = 'only a-z, 0-9, "-" are allowed, and word length: 1-20';
						MyDesktop.promptBox('Please enter a name for image ('+limit+'):', function(reply, text) {
							if (reply=='ok') {
								for (var i=0;i<text.length;i++)
									if (!(text[i]>='a' && text[i]<='z' || text[i]>='0' && text[i]<='9' || text[i]=='-')) {
										text='';
										break;
									}
								if (text.length==0 || text.length>20)
									MyDesktop.messageBox('Failed:'+limit+'!');
								else {
									win.handle.close();
									MyDesktop.postMessage('docker.dashboard.cluster.save', { portal: portal, name: text });
								}
							}
						})
					}
				},{
					text: 'Delete Cluster',
					handler: function() {
						var record = Ext.getCmp('cluster-list-grid').getSelectionModel().getSelected();
						if (record==null)
							return MyDesktop.messageBox('You are supposed to select a portal.');
						if (record.get('user')!=MyDesktop.getGatewayUsername())
							return MyDesktop.messageBox('This cluster is not owned by you.');
						MyDesktop.confirmBox('Please note that all files other than /root/* will be permanently removed and unrecoverable, are you sure to delete?', function(reply) {
							if (reply=='yes') {
								userSpace.afterRemoveCluster = triggerClusterWindow;
								win.handle.close();
								MyDesktop.postMessage('docker.dashboard.cluster.remove', { id: parseInt(record.get('id')) });
							}
						})
					}
				}]
			}]
		}];
		return items;
	}
});

AppWin.GenericWindows.push({
	visible: [true, true],
	window: clusterWindow
});

