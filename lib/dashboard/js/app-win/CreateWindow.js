var triggerSourceWindow = function() {
	MyDesktop.postMessage('docker.dashboard.source.entry', {});
};

sourceWindow = Ext.extend(AppWin.AbstractWindow, {
	id : 'create-win',
	label : 'Images',
	bigIcon : 'gnome-glines.png',
	
	register : function() {
		userSpace.sourceWindow = this;
	},
	
	createEvent : function() {
		triggerSourceWindow();
	},
	
	prepareItems : function(obj) {
		if (!obj.success)
			return null;

		var thisWindow = this;
		
		var portals = [];
		for (var i=0;i<obj.portals.length;i++)
			portals.push({
				xtype: 'radio',
				style: 'margin-top:5px;margin-left:5px',
				id: obj.portals[i][0],
				boxLabel: obj.portals[i][0],
				name: 'rd_portal',
				checked: (i==0)
			});
		if (portals.length==0)
			portals.push({ html: '<strong style="color:red">All your portals are in used, please apply more from admin or properly stop one of your clusters to free a portal.</strong>' });
		
		return new Ext.Panel({
			layout: 'border',
			items: [{
				title: 'Option',
				region: 'west', split:true, collapsible:true,
				width: 150,
				items: [
					//{ title: 'Initialize', html: '<input disabled="true" type="radio" style="margin-top:5px;margin-left:10px;" name="initialize" checked>Open Bash</input><br/><input disabled="true" type="radio" style="margin-top:5px;margin-left:10px;" name="initialize">Open Spark-Shell</input><br/><input disabled="true" type="radio" style="margin-top:5px;margin-left:10px;" name="initialize">Open File Browser</input><br/><input disabled="true" type="radio" style="margin-top:5px;margin-left:10px;" name="initialize">Open Python Shell</input><br/>' },
					{ title: 'Cluster Size', html: '<input id="c_nodes" style="width:100%" value="1" />' },
					{ title: 'Free Portal', items: portals },
				]
			}, /*{
				title: 'Components Include',
				region: 'east', split:true, collapsible:true,
				width: 150,
				html: '<input type="checkbox" style="margin-top:5px;margin-left:10px;" checked> ssh</input><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;" checked> python2</input><br/><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> gcc</input><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> g++</input><br/><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> mpi</input><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> openjdk7</input><br/><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> spark</input><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> nginx</input><br/><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> apache2</input><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> gnome2</input><br/><input type="checkbox" disabled="true" style="margin-top:5px;margin-left:10px;"> eclipse</input>'
			}, */new Ext.grid.GridPanel({
				id: 'image-list-grid',
				title: 'Select a new initial image ..',
				region: 'center', split:true, collapsible:true,
				ds : new Ext.data.Store({
					autoLoad:true,
					reader : new Ext.data.ArrayReader({}, [{ name : 'name' }, { name : 'owner' }, { name : 'mod' }, { name : 'desc' }]),
					data : obj.images /*[
						['ssh', 'SSH Only, provide: ssh root@portal', '52m'],
						['x11','ssh+x11+python2+openbox' , '110m'],
						['spark','ssh+x11+python2+openbox+jre+scala+spark' , '292m'],
						['mate','ssh+x11+python2+gnome2' , '253m'],
						['unios141212','ssh+gnome2+python2+firefox/flash+gcc+<br/>pthread/mpi+java7+scala/akka+<br/>spark1.1.1+nginx' , '542m'],
					]*/
				}),
				cm : new Ext.grid.ColumnModel([
					new Ext.grid.RowNumberer(),
					{ header : "Type", width:120, sortable : true, dataIndex : 'name' },
					{ header : "Owner", width:100, sortable : true, dataIndex : 'owner' },
					{ header : "Access", width:100, sortable : true, dataIndex : 'mod' },
					//{ header : "Desc", width:240, sortable : true, dataIndex : 'desc' }
				]),
				autoHeight: true,
				monitorResize: true,
				listeners : {
					'rowdblclick' : function() {
					}
				}
			})],
			
			buttons : [/*{
				text : 'Apply Portal',
				inputType : 'submit',
				handler : function() {
					userSpace.afterApplyPortal = triggerSourceWindow;
					
					thisWindow.window.handle.close();
					MyDesktop.postMessage('docker.dashboard.portal.app', { });
				}
			}, */{
				id : 'submit_login',
				text : 'Start Image',
				inputType : 'submit',
				handler : function() {
					var record = Ext.getCmp('image-list-grid').getSelectionModel().getSelected();
					if (record==null)
						return MyDesktop.messageBox('You are supposed to select an image.');
					var image = record.get('name'), owner = record.get('owner'), mod = record.get('mod');
					var nodes = document.getElementById('c_nodes').value;
					nodes = parseInt(nodes);
					if (isNaN(nodes) || nodes<1 || nodes>8)
						return MyDesktop.messageBox('Only nodes between 1-8 is allowed!');
					var portals = document.getElementsByName('rd_portal');
					var ip='';
					for (var i=0;i<portals.length;i++)
						if (portals[i].checked)
							ip=portals[i].id;
					if (ip.length==0)
						return MyDesktop.messageBox('No available portals!');
					
					userSpace.afterCreateCluster = function() {
						MyDesktop.postMessage('docker.dashboard.cluster.list', {});
					};
					thisWindow.window.handle.close();
					MyDesktop.postMessage('docker.dashboard.cluster.create', {
						mod: mod,
						owner: owner,
						image: image,
						nodes: nodes,
						bridge: ip,
					});
				}
			}, {
				text : 'Drop Image',
				inputType : 'submit',
				handler : function() {
					var record = Ext.getCmp('image-list-grid').getSelectionModel().getSelected();
					if (record==null)
						return MyDesktop.messageBox('You are supposed to select an image.');
					var image = record.get('name'), owner = record.get('owner'), mod = record.get('mod');
					
					if (owner!=MyDesktop.getGatewayUsername())
						return MyDesktop.messageBox('Failed: This image is not owned by you.');
					MyDesktop.confirmBox('Deleting this image created by you is unrecoverable, are you sure to continue?', function(reply) {
						if (reply=='yes') {
							thisWindow.window.handle.close();
							MyDesktop.postMessage('docker.dashboard.source.remove', { image: image, mod: mod });
						}
					})
				}
			}, {
				text : 'Switch Access',
				inputType : 'submit',
				handler : function() {
					var record = Ext.getCmp('image-list-grid').getSelectionModel().getSelected();
					if (record==null)
						return MyDesktop.messageBox('You are supposed to select an image.');
					var image = record.get('name'), owner = record.get('owner'), mod = record.get('mod');
					
					if (owner!=MyDesktop.getGatewayUsername())
						return MyDesktop.messageBox('Failed: This image is not owned by you.');
					thisWindow.window.handle.close();
					MyDesktop.postMessage('docker.dashboard.source.chmod', { image: image, mod: mod });
				}
			}],
		});
	}
});

AppWin.GenericWindows.push({
	visible: [true, true],
	window: sourceWindow
});

