var userSpace = { app: 'Docklet' };

document.getElementById('app_title').innerHTML = 'Welcome to ' + userSpace.app;

var socketHandler = {
	docker: {
		dashboard: {
			init: function(reply) {
			
				MyDesktop.postMessage('docker.dashboard.login', {
					username: userSpace.username,
					password: userSpace.password,
				});
				userSpace.password = '';
				Ext.getCmp('submit_login').disabled = true;
				Ext.getCmp('j_userid').disabled = true;
				Ext.getCmp('j_password').disabled = true;
				
			},
			
			login: function(reply) {
				if (!reply.success) {
					Ext.getCmp('submit_login').disabled = false;
					Ext.getCmp('j_userid').disabled = false;
					Ext.getCmp('j_password').disabled = false;
					return MyDesktop.messageBox('Login failed, password not correct!');
				}
				LoginWindow.hide();
				userSpace.level = reply.level;
				
				document.getElementById('shortcutList').style.display = 'block';
				MyDesktop.startConfig = MyDesktop.startConfig || MyDesktop.getStartConfig();
				MyDesktop.desktop = new Ext.Desktop(MyDesktop);
				MyDesktop.launcher = MyDesktop.desktop.taskbar.startMenu;
				MyDesktop.modules = MyDesktop.getModules();
				if (MyDesktop.modules)
					MyDesktop.initModules(MyDesktop.modules);
				MyDesktop.init();
				Ext.EventManager.on(window, 'beforeunload', MyDesktop.onUnload, MyDesktop);
				MyDesktop.fireEvent('ready', MyDesktop);
				MyDesktop.isReady = true;
				MyDesktop.desktop.layout();

				/*
				Ext.appStorage.setItem('notify', '');
				NotifyWindow.show();
				NotifyWindow.reloadNotification();
				var notifyTimerEvent = function() {
					// Ext.getCmp('').setTitle();
					var obj = document.getElementById('load_time_field');
					if (obj != null)
						obj.innerHTML='Local Time: '+new Date();
					setTimeout(function(){notifyTimerEvent();}, 2000);
				};
				notifyTimerEvent();
				var nextSubscribe = function(conn, request) {
					var request = true;
					if (conn!=null) {
						if (conn.responseText != null) {
							var reply = Ext.decode(conn.responseText);
							if (reply.status!='ok') {
								// alert("Critical Error from Server: " + reply.reason);
								request = false;
							} else {
								var encodes = Ext.appStorage.getItem('notify');
								Ext.appStorage.setItem('notify', encodes + Ext.encode(reply) + Ext.splitter);
								NotifyWindow.reloadNotification();
							}
						}
					}
					if (request) {
						Ext.Ajax.request({
							url: '/job/subscribe' + '?' + MyDesktop.getCookie(),
							method: 'GET',
							//params:
							async :  false,
							success: nextSubscribe,
							failure: nextSubscribe
						});
					}
				};
				nextSubscribe(null);*/
			},
			
			updateKey: function(reply) {
				if (reply.success) {
					MyDesktop.messageBox('Key-Updating Succeed!');
					var obj = document.getElementById('t_rocker');
					if (obj)
						obj.value=reply.key;
				}
			},
			
			resetVNC: function(reply) {
				if (reply.success)
					MyDesktop.messageBox('VNC-Reset Succeed!');
			},
			
			portal: {
				app: function(reply) {
					if (reply.success)
						userSpace.afterApplyPortal();
					else
						MyDesktop.messageBox('Applying portal failed!');
				},
				
				list: function(reply) {
					userSpace.portalWindow.createWindow(reply);
				},
				
				remove: function(reply) {
					if (reply.success)
						userSpace.afterRemovePortal();
					else
						MyDesktop.messageBox('Removing failed!');
				},
			},
			
			cluster: {
				create: function(reply) {
					if (reply.success)
						userSpace.afterCreateCluster();
					else
						MyDesktop.messageBox('Creation failed!');
				},
				
				list: function(reply) {
					userSpace.clusterWindow.createWindow(reply);
				},
				
				save: function(reply) {
					if (reply.success && reply.messages.length>0)
						MyDesktop.messageBox('Save Succeed!');
					else
						MyDesktop.messageBox('Failed: This image name already exists.');
				},
				
				remove: function(reply) {
					if (reply.success)
						userSpace.afterRemoveCluster();
					else
						MyDesktop.messageBox('Deletion Failed!');
				},
				
				push: function(reply) {
					if (reply.success)
						reply.messages = 'New node is successfully added.';
					else
						reply.messages = 'Failed: Cluster size has reached to the maximum limit.';
					MyDesktop.messageBox(reply.messages);
				},
				
				pop: function(reply) {
					if (reply.success)
						reply.messages = 'Last slave is successfully removed.';
					else
						reply.messages = 'Failed: Cluster size has reached to the minimum limit.';
					MyDesktop.messageBox(reply.messages);
				},
				
				repair: function(reply) {
					MyDesktop.messageBox(reply.messages);
				},
				
				restart: function(reply) {
					MyDesktop.messageBox(reply.messages);
				},
			},
			
			authorize: {
				entry: function(reply) {
					userSpace.authWindow.createWindow(reply);
				},
			},
			
			source: {
				entry: function(reply) {
					userSpace.sourceWindow.createWindow(reply);
				},
				
				remove: function(reply) {
					if (reply.success)
						MyDesktop.messageBox('Drop Succeed!');
					else
						MyDesktop.messageBox('Drop Failed!');
				},
				
				chmod: function(reply) {
					if (reply.success)
						MyDesktop.messageBox('Switch Succeed!');
					else
						MyDesktop.messageBox('Switch Failed!');
				},
			},
		}
	}
};
