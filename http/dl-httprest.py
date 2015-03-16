#!/usr/bin/python

import os, subprocess, pam, json
import posixpath, BaseHTTPServer, urllib, cgi, shutil, mimetypes
from StringIO import StringIO


class DockletHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):

	def on_get_request(self, context, request):
		if context=='/user/login':
			username = request['name']
			password = request['pass']
			if username=='root':
				loggedIn = self.ALLOW_ROOT
			else:
				loggedIn = pam.authenticate(username, password)
			return {'authorization': loggedIn}
		raise Exception('unsupported request!')

	def do_GET(self):
		try:
			[context, args] = self.path.split('?')
			params = {}
			for param in args.split('&'):
				[key, value] = param.split('=')
				params[key] = value
			obj = {'success':True, 'data': self.on_get_request(context, params)}
		except Exception as e:
			obj = {'success':False, 'data': str(e)}
		
		self.send_response(200)
		self.send_header("Content-type", "application/json")
		self.end_headers()
		self.wfile.write(json.dumps(obj))
		self.wfile.close()
		return

	def do_POST(self):
		print self.headers
		return
		form = cgi.FieldStorage(
			fp=self.rfile, 
			headers=self.headers,
			environ={'REQUEST_METHOD':'POST','CONTENT_TYPE': "application/json", }
		)

		# Begin the response
		self.send_response(200)
		self.end_headers()
		self.wfile.write('Client: %s\n' % str(self.client_address))
		self.wfile.write('User-agent: %s\n' %
						 str(self.headers['user-agent']))
		self.wfile.write('Path: %s\n' % self.path)
		self.wfile.write('Form data:\n')

		print form.keys()

		# Echo back information about what was posted in the form
		for field in form.keys():
			field_item = form[field]
			if field_item.filename:
				# The field contains an uploaded file
				file_data = field_item.file.read()
				file_len = len(file_data)
				del file_data
				self.wfile.write(
					'\tUploaded %s as "%s" (%d bytes)\n' % \
						(field, field_item.filename, file_len))
				print "========================="
			else:
				# Regular form value
				self.wfile.write('\t%s=%s\n' %
								 (field, form[field].value))
		return

if __name__ == '__main__':
	try:
		DockletHTTPRequestHandler.ALLOW_ROOT = len(os.environ['NIS'])<=1
	except:
		DockletHTTPRequestHandler.ALLOW_ROOT = True
	BaseHTTPServer.test(DockletHTTPRequestHandler, BaseHTTPServer.HTTPServer)
