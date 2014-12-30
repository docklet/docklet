authorizeWindow = Ext.extend(AppWin.AbstractWindow, {
	id : 'auth-win',
	label : 'Secret-Key',
	bigIcon : 'wine-winecfg.png',
	
	prepareItems : function() {
		MyDesktop.postMessage('docker.dashboard.watchKey', { });
		
		return [{
			layout: 'border',
			title: 'Use this key file as <span style="color: red">user.key</span> to login any of your portal:<div style="margin-top:10px; color:green">chmod 0600 <span style="color: red">./user.key</span></div><div style="margin-bottom:5px; color:green">ssh <span style="color: red">-i ./user.key</span> root@portal</div>',
			items: [ new Ext.form.TextArea({
				id:"t_rocker",
				region:"center",
				readOnly:"true",
			})],
			buttons: [{
				text: 'Regen SSH-Key',
				handler: function() {
					MyDesktop.confirmBox('This will remove your older ssh-key and replace it with a new one, are you sure to continue?', function(reply) {
						if (reply=='yes')
							MyDesktop.postMessage('docker.dashboard.updateKey', { });
					})
				}
			},{
				text: 'Download SSH-Key',
				handler: function() {
					function downloadFile(fileName, content) {
						var aLink = document.getElementById('file-down');
						var blob = new Blob([content]);
						
						aLink.download = fileName;
						aLink.href = URL.createObjectURL(blob);
						aLink.click();
					}
					downloadFile(MyDesktop.getGatewayUsername()+'.key', document.getElementById('t_rocker').value);
				}
			}]
		}];
	},
});

AppWin.GenericWindows.push({
	visible: [true, true],
	window: authorizeWindow
});

