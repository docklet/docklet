#!/bin/bash

# This script builds docklet with local-deploy mode (1-node), just for testing and development.

set -e

function wrong_arch {
	echo "FAILED: Require one of Ubuntu x86_64 - 12.04.5/14.04/14.10/15.04 !" > /dev/stderr
	exit 1
}

[[ "`getconf LONG_BIT`" != "64" ]] && wrong_arch

[[ "`lsb_release -d -s`" != "Ubuntu 12.04.5 LTS" ]] && \
	[[ "`lsb_release -c -s`" != "trusty" ]] && \
		[[ "`lsb_release -c -s`" != "utopic" ]] && \
			[[ "`lsb_release -c -s`" != "vivid" ]] && \
				wrong_arch

if [[ "`cat /proc/cmdline | grep 'cgroup_enable=memory'`" == "" ]]; then
	echo "FAILED: CGroup memory limit option should be enabled in Linux Kernel! TRY:" > /dev/stderr
	echo -e "  echo 'GRUB_CMDLINE_LINUX=\"cgroup_enable=memory swapaccount=1\"' >> /etc/default/grub; update-grub; reboot" > /dev/stderr
	exit 1
fi

if [[ "`whoami`" != "root" ]]; then
	echo "FAILURE: Require root previledge !" > /dev/stderr
	exit 1
fi


apt-get install -y make cgroup-lite lxc ethtool bridge-utils libapparmor1 nmap curl sshfs netcat-openbsd net-tools openssh-server openvswitch-switch python

make install

mkdir -p /usr/share/docklet-rootfs

curl -L "http://docklet.unias.org/dependency/docklet-bin-latest.tar.gz" | tar xzvf - -C /usr/local/bin >/dev/null
curl -L "http://docklet.unias.org/dependency/filesystem.tgz" > /usr/share/docklet-rootfs/filesystem.tgz

echo "SUCCEEDED: Finish installion, just run 'dl-join' to boot docklet!" > /dev/stderr

echo "INFO: Current docklet configurations are: " > /dev/stderr

cat /etc/docklet/docklet.conf > /dev/stderr



