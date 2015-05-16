#!/bin/bash

# This script builds docklet with local-deploy mode (1-node), just for testing and development.

set -e

function wrong_arch {
	echo "FAILED: Require Ubuntu x86_64 (=14.04 | =15.04) !" > /dev/stderr
	exit 1
}

[[ "`getconf LONG_BIT`" != "64" ]] && wrong_arch

OS_VERSION=$(cat /etc/lsb-release | grep ^DISTRIB_RELEASE= | cut -b 17-)

[[ "${OS_VERSION}" != "14.04" ]] && [[ "${OS_VERSION}" != "15.04" ]] && wrong_arch

if [[ "`cat /proc/cmdline | grep 'cgroup_enable=memory'`" == "" ]]; then
	echo "FAILED: CGroup memory limit option should be enabled in Linux Kernel! TRY:" > /dev/stderr
	echo -e "  echo 'GRUB_CMDLINE_LINUX=\"cgroup_enable=memory swapaccount=1\"' >> /etc/default/grub; update-grub; reboot" > /dev/stderr
	exit 1
fi

if [[ "`whoami`" != "root" ]]; then
	echo "FAILED: Require root previledge !" > /dev/stderr
	exit 1
fi


apt-get install -y make cgroup-lite lxc ethtool bridge-utils libapparmor1 nmap curl sshfs netcat-openbsd net-tools openssh-server openvswitch-switch python --no-install-recommends

make install

mkdir -p /usr/share/docklet-rootfs

curl -L "http://docklet.unias.org/dependency/docklet-bin-latest.tar.gz" | tar xzvf - -C /usr/local/bin >/dev/null
curl -L "http://docklet.unias.org/dependency/filesystem.tgz" > /usr/share/docklet-rootfs/filesystem.tgz

echo "INFO: Current docklet configurations are: " > /dev/stderr

cat /etc/docklet/docklet.conf > /dev/stderr

echo "SUCCEEDED: Finish installion, just run 'dl-join' to boot docklet!" > /dev/stderr



