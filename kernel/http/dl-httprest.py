#!/usr/bin/python

import traceback, re, random
import os, subprocess, pam, json, commands, sys, httplib
import posixpath, BaseHTTPServer, urllib, cgi, shutil, mimetypes
from StringIO import StringIO

class DockletHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):

	def execute(self, command, node = os.environ['WORK_ON']):
		sys.stderr.write("[RPC] ssh %s %s 2>/dev/null\n" % (node, command))
		(status, output) = commands.getstatusoutput("ssh %s %s 2>/dev/null" % (node, command))
		return output if status==0 else None

	def authenticate_with_headers(self, provider=None):
		[username, password] = provider if provider!=None else self.headers['Auth'].split('/', 1)
		if re.match('^[a-z0-9]{1,20}$',username)==None:
			raise Exception('illegal name!')
		if username=='root':
			loggedIn = self.ALLOW_ROOT
		else:
			loggedIn = (password == commands.getoutput("cat /mnt/global/users/%s/ssh_keys/id_rsa 2>/dev/null" % username).strip())
			if not loggedIn:
				loggedIn = pam.authenticate(username, password)
				if loggedIn:
					commands.getoutput('echo "%s" | md5sum | cut -b 1-8 > /mnt/global/users/%s/ssh_keys/vnc_hash' % (password, username))
		if not loggedIn:
			raise Exception("authentication failed")
		
		return username

	def do_PUT(self):
		try:
			raise Exception("not correct upload/download port")
			username = self.authenticate_with_headers()
			[null, cmd, filename] = self.path.split('/', 2)
			filename=filename.split('?', 1)[0]
			if cmd=='upload' or cmd=='upload-force':
				if filename.find('/')!=-1 or filename.find('*')!=-1:
					raise Exception('unsupported delimiter "/", "*" !')
				if filename=='' or filename=='.' or filename=='..':
					raise Exception('illegal filename "", ".", ".." !')
				target = "/mnt/global/users/%s/home/%s" % (username, filename)
				if os.path.exists(target) and cmd!='upload-force':
					raise Exception('file with name %s already exists in your nfs directory, uploading cancelled (try upload-force)' % filename)
				length = int(self.headers['content-length'])
				host = open(target, "w")
				read = 0
				while read < length:
					data = self.rfile.read(min(1000000, length - read))
					host.write(data)
					read += len(data)
				host.close()
				obj = {'success':True, 'file-location': "/nfs/%s" % filename}
			else:
				raise Exception('unsupported request!')
		except Exception, e:
			sys.stderr.write(traceback.format_exc())
			obj = {'success':False, 'message': str(e)}
		
		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()
		self.wfile.write(json.dumps(obj))
		self.wfile.write('\n')
		self.wfile.close()
		return

	def on_get_request(self, context, username):
		if context=='/user/login/':
			obj = self.on_post_request("/keys/", username, None)
			if len(self.on_post_request("/portals/", username, None)['portals'])==0:
				self.execute("USER_NAME=%s CMD=app pocket portal" % username)
			return obj
		raise Exception('unsupported request!')

	def do_GET(self):
		try:
			username = self.authenticate_with_headers()
			context = self.path
			if context.startswith("/download/"):
				raise Exception("not correct upload/download port")
				filename = context[10:].strip()
				if filename.find('/')!=-1 or filename.find('*')!=-1 or filename == "" or filename == "." or filename =="..":
					raise Exception("Bad filename given!")
				target = "/mnt/global/users/%s/home/%s" % (username, filename)
				self.send_response(200)
				self.end_headers()
				host = open(target, "r")
				BLOCK = 1024000
				data = host.read(BLOCK)
				while len(data)!=0:
					self.wfile.write(data)
					data = host.read(BLOCK)
				host.close()
				self.wfile.close()
				return
			if not context.endswith("/"):
				context = context + "/"
			obj = {'success':True, 'data': self.on_get_request(context, username)}
		except Exception, e:
			sys.stderr.write(traceback.format_exc())
			obj = {'success':False, 'message': str(e)}
		
		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()
		self.wfile.write(json.dumps(obj))
		self.wfile.write('\n')
		self.wfile.close()
		return
	
	def etcd_http_database(self, path):
		conn = httplib.HTTPConnection("%s:4001" % os.environ['WORK_ON'])
		conn.request(method="GET",url='/v2/keys%s' % path)
		stri = conn.getresponse().read()
		obj = json.loads(stri)
		if 'errorCode' in obj:
			raise Exception("etcd undetermized")
		return obj

	def etcd_get_machines(self):
		obj = self.etcd_http_database('/_etcd/machines')
		machines = []
		for node in obj['node']['nodes']:
			machine = node['key'].split('/')[-1]
			machines.append(machine)
		return machines

	def etcd_get_random_machine(self):
		cl = self.etcd_get_machines()
		return cl[random.randint(0, len(cl)-1)]

	def etcd_list_clusters(self, user):
		obj = self.etcd_http_database('/docklet/instances')
		clusters = []
		for item in obj['node']['nodes']:
			datas = item['value']
			[owner,image,portal,cluster] = datas.split('|')
			if owner==user or user=='root':
				nat_id = item['key'].split('/')[-1]
				clusters.append({'id': int(nat_id), 'owner': owner, 'image': image, 'portal': portal, 'size':len(cluster.split())})
		return clusters

	def etcd_list_single_cluster(self, user, nat_id):
		clusterInt = int(nat_id)
		obj = self.etcd_http_database('/docklet/instances/%d' % clusterInt)
		item = obj['node']
		datas = item['value']
		[owner,image,portal,cluster] = datas.split('|')
		if owner==user or user=='root':
			nat_id = item['key'].split('/')[-1]
			nodes = []
			for node in cluster.split():
				[work_on, uuid, nat_id, host_name] = node.split(':')
				nodes.append({'work_on':work_on, 'uuid':uuid, 'nat_id':nat_id, 'host_name':host_name})
			return {'id': clusterInt, 'owner': owner, 'image': image, 'portal': portal, 'nodes': nodes}
		raise Exception("cluster not found!")

	def etcd_user_portals(self, user):
		portals = []
		try:
			obj = self.etcd_http_database('/docklet/portal/%s' % user)
			for portal in obj['node']['nodes']:
				portals.append({"ip":portal['key'].split('/')[-1], "status": portal['value'] })
		except:
			pass
		return portals

	def on_post_request(self, context, user, form):
		if context.startswith('/clusters/'):
			context = context[10:].strip()
			if context == "":
				return {'clusters': self.etcd_list_clusters(user)}
				""" detail = self.execute("USER_NAME=%s pocket list" % user)
				clusters = []
				for item in detail.split('\n'):
					if len(item)==0:
						continue
					[nat_id,user,image,portal,cluster] = item.split('|')
					clusters.append({'id': int(nat_id), 'owner': user, 'image': image, 'portal': portal, 'size':len(cluster.split())})
				return {'clusters': clusters } """
			
			parts = context.split('/')
			if parts[0]=="create":
				image = form['image'].value
				portal = form['portal'].value
				if re.match('^[a-z0-9]{1,10}_[a-z0-9\-]{1,20}$', image)==None:
					raise Exception("illegal image format, should like: owner_abc123-def")
				if re.match('^[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}$', portal)==None:
					raise Exception("illegal portal format, should like: 1.2.3.4")
				WORK_ON = self.etcd_get_random_machine()
				NAT_ID = self.execute('THIS_HOST=%s BRIDGE_IP=%s USER_NAME=%s IMAGE=%s pocket create' % (WORK_ON, portal, user, image), WORK_ON)
				if NAT_ID == None:
					raise Exception("create operation failed")
				return {'id': NAT_ID, 'workon': WORK_ON, 'portal': portal}
			
			clusterInt = int(parts[0])
			op = parts[1]
			if op == "":
				return self.etcd_list_single_cluster(user, clusterInt)
				"""detail = self.execute('KEY=/docklet/instances/%d etcdemu get' % clusterInt)
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
					[work_on, uuid, nat_id, host_name] = node.split(':')
					nodes.append({'work_on':work_on, 'uuid':uuid, 'nat_id':nat_id, 'host_name':host_name})
				return {'id': clusterInt, 'owner': owner, 'image': image, 'portal': portal, 'nodes': nodes}"""
			elif op == "scaleup":
				[_owner, _image, _portal, _nodes] = self.etcd_http_database("/docklet/instances/%d" % clusterInt)['node']['value'].split('|')
				if _owner != user:
					raise Exception("permission denied")
				usages = dict()
				for node in _nodes.split():
					usages[node.split(':')[0]] = True
				for mac in self.etcd_get_machines():
					if not mac in usages:
						result = self.execute('USER_NAME=%s NAT_ID=%s CMD=push THIS_HOST=%s docklet-regen' % (user, clusterInt, mac), mac)
						if result == None:
							raise Exception("nodes number exceed the upbound limit")
						[ipaddr, workon, uuid, host] = result.split()
						return {'ip':ipaddr, 'uuid':uuid, 'host_name':host}
				raise Exception("no more physical machines to allocate")
				"""
				this_host = self.etcd_get_random_machine()
				result = self.execute('USER_NAME=%s NAT_ID=%s CMD=push THIS_HOST=%s docklet-regen' % (user, clusterInt, this_host), this_host)
				if result==None:
					raise Exception("nodes number exceed the upbound limit")
				[ipaddr, workon, uuid, host] = result.split()
				return {'ip':ipaddr, 'uuid':uuid, 'host_name':host} """
				
			elif op == "scaledown":
				result = self.execute('USER_NAME=%s NAT_ID=%s CMD=pop docklet-regen' % (user, clusterInt))
				if result==None:
					raise Exception("nodes number exceed the lowerbound limit")
				[ipaddr, workon, uuid, host] = result.split()
				return {'ip':ipaddr, 'uuid':uuid, 'host_name':host}
			elif op == "repair":
				if self.execute('USER_NAME=%s NAT_ID=%s CMD=repair docklet-regen' % (user, clusterInt))==None:
					raise Exception("repair operation failed")
				return {}
			elif op == "restart":
				if self.execute('USER_NAME=%s NAT_ID=%s CMD=restart docklet-regen' % (user, clusterInt))==None:
					raise Exception("restart operation failed")
				return {}
			elif op == "commit":
				if 'saveas' in form:
					saveas = 'IMAGE_NAME=' + form['saveas'].value
					if re.match('^IMAGE_NAME=[a-z0-9\-]{1,20}$', saveas)==None:
						raise Exception("illegal image format")
				else:
					saveas = ''
				obj = self.etcd_http_database('/docklet/instances/%s' % clusterInt)
				WORK_ON = obj['node']['value'].strip().split('|')[-1].strip().split()[-1].strip().split(':')[0]
				if self.execute('USER_NAME=%s NAT_ID=%s %s pocket save' % (user, clusterInt, saveas), WORK_ON)==None:
					raise Exception("exit operation failed")
				return {'master': obj['node']['value'].strip().split('|')[2], 'natid': clusterInt}
			else:
				nodeRank = op
				nodes = self.execute('KEY=/docklet/instances/%s etcdemu get' % clusterInt)
				if nodes == None or nodes == '':
					raise Exception("no cluster information found")
				for node in nodes.strip().split('|')[3].strip().split():
					[workon, uuid, natip, host_name] = node.split(':')
					if uuid.split('-')[-1] == nodeRank:
						output = commands.getoutput('ssh %s dl-meter %s 2>/dev/null' % (workon, uuid)).strip()
						if output == '':
							raise Exception("load node resource failed")
						[cpuacct, memory] = output.split()
						return {'cpuacct': long(cpuacct), 'memory': long(memory) }
				raise Exception("no node information found")
		elif context.startswith("/images/"):
			context = context[8:]
			if context == "":
				#output = self.execute('USER_NAME=%s pocket images' % user).split('\n')
				images = []
				for image in os.listdir('/mnt/global/images'):
					[mod, owner, img] = image.split('_')
					if mod == 'pub' or user == 'root' or user == owner:
						images.append({"name":img[:-4], "owner":owner, "access":mod })
				"""images = []
				for item in output:
					if len(item)==0:
						continue
					[mod, owner, iden] = item.split('_')
					images.append({"name":iden, "owner":owner, "access":mod })"""
				return {'images': images }
			else:
				parts = context.split("/")
				if len(parts)==3:
					[image, op, null] = parts
					if re.match('^[a-z0-9\-]{1,20}$',image)==None:
						raise Exception("illegal image name")
					if op == "drop" or op == "switch":
						if self.execute('USER_NAME=%s IMAGE=%s pocket %s' % (user, image, 'chi' if op=='switch' else 'rmi')) == None:
							raise Exception("image not found")
						return {}
		elif context == "/portals/":
			return {'portals': self.etcd_user_portals(user)}
			"""output = self.execute('USER_NAME=%s CMD=list pocket portal' % user).split('\n')
			portals = []
			for item in output:
				if len(item)==0:
					continue
				[portal, status] = item.split(':')
				portals.append({"ip":portal, "status": status })
			return {'portals': portals }"""
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
		try:
			length = int(self.headers['content-length'])
			if length>10000000:
				raise Exception("data too large, submitting cancelled")
			
			if self.path=='/submit':
				raise Exception("not correct upload/download port")
				ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
				if ctype != 'multipart/form-data':
					raise Exception("data format not supported")
				postvars = cgi.parse_multipart(self.rfile, pdict)
				provider = ["\n".join(postvars['user']), "\n".join("\n".join(postvars['key']).split('\\n'))]
				username = self.authenticate_with_headers(provider)
				
				filename = "".join(postvars['name'])
				if filename.find('/')!=-1 or filename.find('*')!=-1:
					raise Exception('unsupported delimiter "/", "*" !')
				if filename=='' or filename=='.' or filename=='..':
					raise Exception('illegal filename "", ".", ".." !')
				
				if os.system('mkdir -p /mnt/global/users/%s/home/submit' % username)!=0:
					raise Exception('cannot locate "/nfs/submit" directory!')
				target = "/mnt/global/users/%s/home/submit/%s" % (username, filename)
				
				host = open(target, "w")
				host.write("\n".join(postvars['upload']))
				host.close()
				# obj = {'success':True, 'file-location': "/nfs/submit/%s" % filename}
				
				self.send_response(200)
				self.end_headers()
				self.wfile.close()
				return
			else:
				form = cgi.FieldStorage(fp=self.rfile, headers=self.headers,environ={'REQUEST_METHOD':'POST','CONTENT_TYPE': "text/html"})
			
				username = self.authenticate_with_headers([form['user'].value, form['key'].file.read().strip()])
				context = self.path.split('?')[0]
				if not context.endswith("/"):
					context = context + "/"
				obj = {'success':True, 'data': self.on_post_request(context, username, form)}
		except Exception, e:
			sys.stderr.write(traceback.format_exc())
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
	BaseHTTPServer.test(DockletHTTPRequestHandler, BaseHTTPServer.HTTPServer)

