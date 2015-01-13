
install:
	cp -r bin/* /usr/local/sbin
	cp -r dashboard /usr/local/sbin
	mkdir -p /etc/docklet
	cp -r conf/docklet.conf /etc/docklet

test:
	for MACHINE in 12 13; do \
		ssh root@192.168.4.$$MACHINE killall etcd 2>/dev/null; \
		scp -r bin/* root@192.168.4.$$MACHINE:/usr/local/sbin; \
		scp -r dashboard root@192.168.4.$$MACHINE:/usr/local/sbin; \
	done

upgrade:
	for MACHINE in 11 12 13; do \
                scp -r bin/* root@192.168.192.$$MACHINE:/usr/local/sbin; \
                scp -r dashboard root@192.168.192.$$MACHINE:/usr/local/sbin; \
		ssh root@192.168.192.$$MACHINE mkdir -p /etc/docklet; \
                scp -r conf/docklet.conf root@192.168.192.$$MACHINE:/etc/docklet; \
        done

