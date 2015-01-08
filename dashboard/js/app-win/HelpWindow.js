helpWindow = Ext.extend(AppWin.AbstractWindow, {
	id : 'help-win',
	label : 'Help',
	bigIcon : 'evolution-tasks.png',
	
	width: 500,
	height: 400,
	
	register : function() {
	},
	
	prepareItems : function() {
		return [{
			html: '<iframe style="width:100%;height:100%" src="/doc.html"></iframe>'
		}];
		/*return [{
			title: 'Common Question',
			html: '<div><div style="margin-top:10px; margin-left:5px; color: red; font-size:13">How to quickly create a private cluster?</div><div style="margin-top:5px; margin-left:10px; font-size:13">Click "Git Center", then select a portal(free one if no one listed in portals) and an image, finally click on "Create".</div>'+
			'<div style="margin-top:10px; margin-left:5px; color: red; font-size:13">How to change vnc login password of a certain cluster portal?</div><div style="margin-top:5px; margin-left:10px; font-size:13">Open any bash in vnc and type command: vncpasswd, then input a stricter password that suits you.</div></div>'+
			'<div style="margin-top:10px; margin-left:5px; color: red; font-size:13">How to login a certain cluster portal through ssh (under mac/linux) or putty (under windows)?</div><div style="margin-top:5px; margin-left:10px; font-size:13">Open any bash in vnc and type command: passwd root, then input a password as the password for ssh login.</div></div>'+
			'<div style="margin-top:10px; margin-left:5px; color: red; font-size:13">What is "Secret-Key" used for?</div><div style="margin-top:5px; margin-left:10px; font-size:13">It provides a private rsa key for linux client to ssh login without password, no use for windows client.</div></div>'
		}];*/
	}
});

AppWin.GenericWindows.push({
	visible: [true, true],
	window: helpWindow
});

