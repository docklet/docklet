var uriPrefix='';

Ext.splitter = '<ext-splitter/>';
Ext.appStorage = sessionStorage;

Ext.app.App = function(cfg) {
	Ext.apply(this, cfg);
	this.addEvents({
		'ready' : true,
		'beforeunload' : true
	});

	Ext.onReady(this.initApp, this);
};

Ext.extend(Ext.app.App, Ext.util.Observable, {
	isReady : false,
	startMenu : null,
	modules : null,

	getStartConfig : function() {
	},
	
	postMessage : function(field, obj) {
		userSpace.windowMask = new Ext.LoadMask(Ext.getBody(), {
			msg: "Please wait for a while ...",
			msgCls: 'z-index:10000;'
		});
		userSpace.windowMask.show();
		if (ws.readyState==1)
			ws.send(field+' '+JSON.stringify(obj));
		else
			MyDesktop.messageBox("Lose connection with remote services!", function() {
				location.reload();
			});
	},
	
	messageBox : function(msg, reply) {
		Ext.MessageBox.alert("Message", msg, reply);
		Ext.MessageBox.getDialog().getEl().setStyle('z-index','80000');
		if (this.desktop != null)
			this.desktop.layout();
	},
	
	confirmBox : function(msg, reply) {
		Ext.MessageBox.confirm("Confirm", msg, reply);
		Ext.MessageBox.getDialog().getEl().setStyle('z-index','80000');
		if (this.desktop != null)
			this.desktop.layout();
	},
	
	promptBox : function(msg, reply) {
		Ext.MessageBox.prompt("Prompt", msg, reply);
		Ext.MessageBox.getDialog().getEl().setStyle('z-index','80000');
		if (this.desktop != null)
			this.desktop.layout();
	},

	getGatewayUsername : function() {
		return userSpace.username;
	},

	initApp : function() {
		LoginWindow.show();
		Ext.getCmp('j_userid').focus(false, 100);
	},

	getModules : Ext.emptyFn,
	init : Ext.emptyFn,

	initModules : function(ms) {
		for (var i = 0, len = ms.length; i < len; i++) {
			var m = ms[i];
			this.launcher.add(m.launcher);
			m.app = this;
		}
	},

	getModule : function(name) {
		var ms = this.modules;
		for (var i = 0, len = ms.length; i < len; i++)
			if (ms[i].id == name || ms[i].appType == name)
				return ms[i];
		return '';
	},

	onReady : function(fn, scope) {
		if (!this.isReady)
			this.on('ready', fn, scope);
		else
			fn.call(scope, this);
	},

	getDesktop : function() {
		return this.desktop;
	},

	onUnload : function(e) {
		if (this.fireEvent('beforeunload', this) === false)
			e.stopEvent();
	}
});

