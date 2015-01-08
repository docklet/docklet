
install:
	cp -r bin/* /usr/local/sbin
	cp -r dashboard /usr/local/sbin
	cp -r conf/docklet.conf /etc

test:
	for MACHINE in 11 12 13; do \
		scp -r bin/* root@192.168.192.$$MACHINE:/usr/local/sbin; \
		scp -r dashboard root@192.168.192.$$MACHINE:/usr/local/sbin; \
		scp -r conf/docklet.conf root@192.168.192.$$MACHINE:/etc; \
	done

