* [ Docklet ]

git clone http://git.unias.org/docklet.git

==============================================================

[Todo]

* Completely remove /docklet/portal/free;


==============================================================

[Init]
apt-get install bridge-utils lxc [bridge: /etc/network/interfaces]
echo 'DOCKER_OPTS="-e lxc"' >> /etc/default/docker

[Memory]
echo 'GRUB_CMDLINE_LINUX="cgroup_enable=memory swapaccount=1"' >> /etc/default/grub
update-grub && reboot

[CPU-Speed]
--lxc-conf="lxc.cgroup.cpu.cfs_quota_us=50000"

[Bandwidth]


[Depends]
docker with weave (>=1.3.2), etcd (=0.4.6), pocket-tools (dev)

[Config]
MASTER=192.168.4.231
sshfs root@${MASTER}:/home/docklet /home/docklet
weave launch [ ${MASTER} ]
cd / && nohup etcd >/dev/null &
# mount.nfs /home/docklet


[VNC Server]

>>	echo "#!/bin/bash" > ${HOME}/.vnc/xstartup
>>	chmod a+x ${HOME}/.vnc/xstartup
>>	echo -e "openbox-session &" >> ${HOME}/.vnc/xstartup
>>	rm -rf /tmp/.X1-lock /tmp/.X11-unix/X1 /root/.vnc/*.log /root/.vnc/*.pid


etcdctl rm "/docklet" --recursive || true
# KEY="/docklet/instances/go" VALUE="0" etcdemu set
# KEY="/docklet/portal/free" VALUE=" 192.168.192.101 192.168.192.102 192.168.192.103 192.168.192.104 192.168.192.105 192.168.192.106 192.168.192.107 192.168.192.108 192.168.192.109 192.168.192.110 192.168.192.111 192.168.192.112 192.168.192.113 192.168.192.114 192.168.192.115 192.168.192.116 192.168.192.117 192.168.192.118 192.168.192.119 192.168.192.120 192.168.192.121 192.168.192.122 192.168.192.123 192.168.192.124 192.168.192.125 192.168.192.126 192.168.192.127 192.168.192.128 192.168.192.129 192.168.192.130 192.168.192.131 192.168.192.132 192.168.192.133 192.168.192.134" etcdemu set

# KEY="/docklet/glob/hosts" VALUE="192.168.192.11 192.168.192.12 192.168.192.13" etcdemu set
# KEY="/docklet/portal/free" VALUE=" 192.168.4.150 192.168.4.151 192.168.4.152" etcdemu set
# KEY="/docklet/glob/hosts" VALUE="192.168.4.12" etcdemu set


[Run]
USER_NAME=root CMD=app pocket portal
IMAGE=unios141212 BRIDGE_IP=192.168.4.150 USER_NAME=root NODE_NUM=5 pocket create
CREATE_ID=0 pocket remove

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
