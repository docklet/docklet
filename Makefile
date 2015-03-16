
install:
	@cp -r bin/* /usr/local/sbin
	@mkdir -p /usr/local/lib/docklet-http
	@cp -r http/* /usr/local/lib/docklet-http
	@mkdir -p /etc/docklet
	@cp -ri conf/docklet.conf /etc/docklet

