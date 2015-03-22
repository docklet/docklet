#!/usr/bin/python

import os, subprocess, pam, json, commands, sys
import posixpath, BaseHTTPServer, urllib, cgi, shutil, mimetypes
from StringIO import StringIO

"""
curl "http://192.168.4.200:8000/user/login?name=cuiwei13&pass=<pass>" 2>/dev/null | python -mjson.tool | grep "\-\-\-" | awk -F\" '{ print $4}' | sed 's/\\n/\n/g' > cuiwei13.key

curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/keys"
curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/clusters"
curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/portals"
curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/images"

curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/clusters"
curl -F image=root_base -F portal=192.168.4.41 -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/clusters/create"

curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key "http://192.168.4.200:8000/clusters/1"

curl -F user=cuiwei13 -F key=@${HOME}/Desktop/cuiwei13.key -F saveas=aaa "http://192.168.4.200:8000/clusters/1/commit"

"""

class DockletHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
		
	def execute(self, command):
		sys.stderr.write("[RPC] %s\n" % ("%s %s 2>/dev/null" % (self.WORK_ON, command)))
		(status, output) = commands.getstatusoutput("%s %s 2>/dev/null" % (self.WORK_ON, command))
		return output if status==0 else None

	def on_get_request(self, context, request):
		if context=='/user/login/':
			username = request['name']
			password = request['pass']
			if username=='root':
				loggedIn = self.ALLOW_ROOT
			else:
				loggedIn = pam.authenticate(username, password)
			if not loggedIn:
				raise Exception("authentication failed")
			obj = self.on_post_request("/keys/", username, None)
			if len(self.on_post_request("/portals/", username, None)['portals'])==0:
				self.execute("USER_NAME=%s CMD=app pocket portal" % username)
			return obj
		raise Exception('unsupported request!')

	def do_GET(self):
		try:
			[context, args] = self.path.split('?')
			if not context.endswith("/"):
				context = context + "/"
			params = {}
			for param in args.split('&'):
				[key, value] = param.split('=')
				params[key] = value
			obj = {'success':True, 'data': self.on_get_request(context, params)}
		except Exception as e:
			obj = {'success':False, 'message': str(e)}
		
		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()
		self.wfile.write(json.dumps(obj))
		self.wfile.close()
		return

	def on_post_request(self, context, user, form):
		if context.startswith('/clusters/'):
			context = context[10:].strip()
			if context == "":
				detail = self.execute("USER_NAME=%s pocket list" % user)
				clusters = []
				for item in detail.split('\n'):
					if len(item)==0:
						continue
					nat_id = item.split('|')[0]
					clusters.append(self.on_post_request("/clusters/%d/" % int(nat_id), user, form))
				return {'clusters': clusters }
			
			parts = context.split('/')
			if parts[0]=="create":
				image = form['image'].value
				portal = form['portal'].value
				if self.execute('BRIDGE_IP=%s USER_NAME=%s IMAGE=%s pocket create' % (portal, user, image)) == None:
					raise Exception("create operation failed")
				return {}
			
			clusterInt = int(parts[0])
			op = parts[1]
			if op == "":
				detail = self.execute('KEY=/docklet/instances/%d etcdemu get' % clusterInt)
				parts = detail.split('|')
				if len(parts)!=4:
					raise Exception("cluster not found")
				[owner, image, portal, clusters] = parts
				if user != owner:
					raise Exception("this cluster is not owned by your")
				nodes = []
				for node in clusters.split(' '):
					if len(node)==0:
						continue
					[work_on, uuid, nat_id] = node.split(':')
					nodes.append({'work_on':work_on, 'uuid':uuid, 'nat_id':nat_id})
				return {'id': clusterInt, 'owner': owner, 'image': image, 'portal': portal, 'nodes': nodes}
			elif op == "scaleup":
				result = self.execute('USER_NAME=%s NAT_ID=%s CMD=push docklet-regen' % (user, clusterInt))
				if result==None:
					raise Exception("nodes number exceed the upbound limit")
				[ipaddr, workon, uuid] = result.split()
				return {'ip':ipaddr, 'uuid':uuid}
			elif op == "scaledown":
				result = self.execute('USER_NAME=%s NAT_ID=%s CMD=pop docklet-regen' % (user, clusterInt))
				if result==None:
					raise Exception("nodes number exceed the lowerbound limit")
				[ipaddr, workon, uuid] = result.split()
				return {'ip':ipaddr, 'uuid':uuid}
			elif op == "repair":
				if self.execute('USER_NAME=%s NAT_ID=%s CMD=repair docklet-regen' % (user, clusterInt))==None:
					raise Exception("repair operation failed")
				return {}
			elif op == "restart":
				if self.execute('USER_NAME=%s NAT_ID=%s CMD=restart docklet-regen' % (user, clusterInt))==None:
					raise Exception("restart operation failed")
				return {}
			elif op == "remove":
				if self.execute('USER_NAME=%s NAT_ID=%s pocket remove' % (user, clusterInt))==None:
					raise Exception("remove operation failed")
				return {}
			elif op == "commit":
				if self.execute('USER_NAME=%s NAT_ID=%s IMAGE_NAME=%s pocket save' % (user, clusterInt, form['saveas'].value))==None:
					raise Exception("commit operation failed")
				return {}
		elif context.startswith("/images/"):
			context = context[8:]
			if context == "":
				output = self.execute('USER_NAME=%s pocket images' % user).split('\n')
				images = []
				for item in output:
					if len(item)==0:
						continue
					[name, size] = item.split(':')
					[mod, owner, iden] = name.split('_')
					images.append({"name":iden, "owner":owner, "access":mod })
				return {'images': images }
			else:
				parts = context.split("/")
				if len(parts)==3:
					[image, op, null] = parts
					if op == "drop" or op == "switch":
						if self.execute('ham %s_2v %s_%s' % (op, user, image)) == None:
							raise Exception("image not found")
						return {}
		elif context == "/portals/":
			output = self.execute('USER_NAME=%s CMD=list pocket portal' % user).split('\n')
			portals = []
			for item in output:
				if len(item)==0:
					continue
				[portal, status] = item.split(':')
				portals.append({"ip":portal, "status": status })
			return {'portals': portals }
		elif context.startswith("/keys/"):
			context = context[6:]
			context = context[:-1] if context.endswith("/") else context
			if context == "" or context == "update":
				[openssh, putty] = self.execute("USER_NAME=%s stone %s" % (user, context)).split("========")
				openssh = openssh.strip()
				putty = putty.strip()
				return {'openssh': openssh, 'putty': putty }
		raise Exception('unsupported request!')
	
	def do_POST(self):
		form = cgi.FieldStorage(fp=self.rfile, headers=self.headers,environ={'REQUEST_METHOD':'POST','CONTENT_TYPE': "text/html"})

		try:
			if form['key'].file.read().strip() != commands.getoutput("cat /mnt/%s/ssh_keys/id_rsa" % form['user'].value).strip():
				raise Exception("user's key not matched")
			context = self.path.split('?')[0]
			if not context.endswith("/"):
				context = context + "/"
			obj = {'success':True, 'data': self.on_post_request(context, form['user'].value, form)}
		except Exception as e:
			obj = {'success':False, 'message': str(e)}
		
		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()
		self.wfile.write(json.dumps(obj))
		self.wfile.write('\n')
		self.wfile.close()
		
		""" for field in form.keys():
			field_item = form[field]
			if field_item.filename:
				file_data = field_item.file.read()
				file_len = len(file_data)
				del file_data
				self.wfile.write('\tUploaded %s as "%s" (%d bytes)\n' % (field, field_item.filename, file_len))
			else:
				self.wfile.write('\t%s=%s\n' % (field, form[field].value)) """
		return

if __name__ == '__main__':
	try:
		DockletHTTPRequestHandler.ALLOW_ROOT = len(os.environ['NIS'])<=1
	except:
		DockletHTTPRequestHandler.ALLOW_ROOT = True
	DockletHTTPRequestHandler.WORK_ON = "ssh root@%s " % os.environ['WORK_ON']
	BaseHTTPServer.test(DockletHTTPRequestHandler, BaseHTTPServer.HTTPServer)

