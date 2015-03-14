var triggerAuthWindow = function() {
	MyDesktop.postMessage('docker.dashboard.authorize.entry', {});
};

authorizeWindow = Ext.extend(AppWin.AbstractWindow, {
	id : 'auth-win',
	label : 'Secret-Key',
	bigIcon : 'wine-winecfg.png',
	
	register : function() {
		userSpace.authWindow = this;
	},
	
	createEvent : function() {
		triggerAuthWindow();
	},
	
	prepareItems : function(obj) {
		if (!obj.success) {
			MyDesktop.messageBox('Cannot load pages, please re-login docklet!');
			return null;
		}

		return [{
			layout: 'border',
			title: 'Use this key file as <span style="color: red">user.key</span> to login any of your portal:<div style="margin-top:10px; color:green">For Unix: chmod go-rw <span style="color:red">./user.key</span> ; ssh <span style="color: red">-i ./user.key</span> root@portal-ip</div><div style="margin-top:10px; color:green">For Windows Firefox FireSSH / Chromium SecurityShell: <span style="color:blue">ssh://portal-ip/</span> with <span style="color:red">user.key</span> </div>',
			items: [ new Ext.form.TextArea({
				id:"t_rocker",
				region:"center",
				readOnly:"true",
				value:obj.key,
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

