#!/usr/bin/python

import os
import posixpath
import BaseHTTPServer
import urllib
import cgi
import shutil
import mimetypes
from StringIO import StringIO


class DockletHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(self.path)
        self.wfile.close()
        return

    def do_POST(self):
    	print self.headers
        form = cgi.FieldStorage(
            fp=self.rfile, 
            headers=self.headers,
            environ={'REQUEST_METHOD':'POST',
                     'CONTENT_TYPE': "text/html", #self.headers['Content-Type'],
                     })

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
    BaseHTTPServer.test(DockletHTTPRequestHandler, BaseHTTPServer.HTTPServer)
