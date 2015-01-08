
install:
	scp -r bin/* /usr/local/sbin
	scp -r dashboard /usr/local/sbin
	scp -r conf/docklet.conf /etc

