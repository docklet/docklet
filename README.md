# docklet-core

A light-weighted manager for lxc-cluster based on lxc/ovs/aufs/docker/.. , with elasticity, availability, live-upgradable rootfs, live-join machines ..

* Version: 0.2.0

* OS Required: Ubuntu 14.04.* (LTS) x86_64, or Ubuntu 15.04 x86_64

==============================================================

# Preinstallation on Machines

* git clone https://github.com/maverickplusplus/docklet-core
* cd docklet-core
* sudo ./docklet-installer.sh

(Reboot is needed if cgroup memory account is not enabled)

# Installation: Single-Node Mode (Default)

[Quickly startup the docklet daemon]
* sudo dl-join

[Open another non-sudo terminal, and test creating a first user cluster]
* test-docklet

# Installation: Multi-Node Cluster Mode

[For cluster configuration]
* sudo gedit /etc/docklet/docklet.conf

Note: Keep same config file among all physical machines!

[SSH-autologin configuration]
* sudo ssh-keygen -t rsa -P ''
* sudo echo ${HOME}/.ssh/id_rsa | sudo tee -a ${HOME}/.ssh/authorized_keys

Note: Keep no-pass login among any pair of physical machines!

[Quickly startup the docklet daemon on each machines]
* sudo dl-join

==============================================================

# Controlling API:

* /user/login, /portals, /images, /clusters, ..

* Example: curl -H "Auth:{username}/{passwd}" http://${PORTAL_HTTP}:8000/user/login

See more samples in test-docklet file from source code

==============================================================

# Inside Users Containers:

* docklet scaleout

* docklet scalein

* docklet status

* docklet clusterid

* docklet save {image-name}

* docklet remove

* docklet restart

* docklet hosts

* docklet owner

* ...
