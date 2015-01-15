[ Docklet ] git clone http://git.unias.org/docklet.git

==============================================================

[Setup]

sudo apt-get install git make

git clone http://git.unias.org/docklet.git

cd ./docklet

sudo make install

# edit /etc/docklet/docklet.conf for self-defined configuration

sudo dl-join (only download dependencies for the first time)

firefox http://localhost/ (using native PAM，then create clusters, like 172.31.0.3)

Finally, ssh root@172.31.0.3 (initial password: 123456)

==============================================================

[Multi host bridge settings: /etc/network/interfaces]
auto eth0
iface eth0 inet manual

auto br1
iface br1 inet static
	address 192.168.192.11
	netmask 255.255.255.0
	gateway 192.168.192.1
	bridge_ports eth0
	bridge_stp off
	bridge_fd 0
	bridge_maxwait 0
	dns-nameservers 162.105.129.27

==============================================================

[Memory]
echo 'GRUB_CMDLINE_LINUX="cgroup_enable=memory swapaccount=1"' >> /etc/default/grub
update-grub && reboot

[CPU-Speed]
--lxc-conf="lxc.cgroup.cpu.cfs_quota_us=50000"

[Bandwidth]


==============================================================

[VNC Server]

>>	echo "#!/bin/bash" > ${HOME}/.vnc/xstartup
>>	chmod a+x ${HOME}/.vnc/xstartup
>>	echo -e "openbox-session &" >> ${HOME}/.vnc/xstartup
>>	rm -rf /tmp/.X1-lock /tmp/.X11-unix/X1 /root/.vnc/*.log /root/.vnc/*.pid

==============================================================

[HOSTS]

* 192.168.4.12
* 192.168.4.13

* 192.168.192.11
* 192.168.192.12
* 192.168.192.13

[docker.dep]

btrfs-tools dh-golang dh-systemd go-md2man golang golang golang-context-dev golang-dbus-dev golang-go-patricia-dev golang-go-systemd-dev golang-go.net-dev golang-gocapability-dev golang-gosqlite-dev golang-mux-dev golang-pty-dev libapparmor-dev libdevmapper-dev


[Make and install]

autoreconf -is
./configure --prefix=/home/docklet
make
make install

