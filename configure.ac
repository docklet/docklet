#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

AC_PREREQ([2.69])
AC_INIT([docklet], [0.1], [unias@sei.pku.edu.cn], 
        [docklet], [http://www.unias.org])
dnl use for automake
AC_CANONICAL_TARGET
#AC_CONFIG_AUX_DIR([ac-aux])

AM_INIT_AUTOMAKE([foreign])
dnl find whether the source code existing to determine the effectiveness of the source code directory
dnl ------------------------------------------------------------------
dnl Internal functions for this configure script.
dnl ------------------------------------------------------------------

#LT_INIT([disable-static])
LT_INIT

# Checks for programs.
#AC_PROG_CC
#AC_PROG_CXX
AC_PROG_INSTALL
AC_PROG_MAKE_SET
AC_PROG_SED

AC_CHECK_PROG(GREP_CHECK,grep,yes)
if test x"$GREP_CHECK" != x"yes" ; then
    AC_MSG_ERROR([Please install GNU grep before installing.])
fi

AC_CHECK_PROG(UMOUNT_CHECK,umount,yes)
if test x"$UMOUNT_CHECK" != x"yes" ; then
    AC_MSG_ERROR([Please install umount first, possibly in package mount.])
fi

AC_CHECK_PROG(TR_CHECK,tr,yes)
if test x"$TR_CHECK" != x"yes" ; then
    AC_MSG_ERROR([Please install tr first, possibly in package coreutils.])
fi

#COLORED_ECHO_INIT
dnl Hack to skip C++/Fortran tests (stolen from Beep Media Player)
m4_undefine([AC_PROG_F77])
m4_defun([AC_PROG_F77],[])

#AM_DISABLE_STATIC
#AM_ENABLE_SHARED

#AM_PROG_LIBTOOL
dnl Print any warnings.
if test "x$GCC" = "xyes"; then
	CFLAGS="${CFLAGS% } -Wall"
fi

dnl Compatibility modules.
AC_ARG_ENABLE([compat],
	AC_HELP_STRING([--enable-compat],
	    [build compatibility modules [[default=no]]]),,
	enable_compat="no")
if test "x${enable_compat}" = "xyes"; then
	COMPAT_MODULES_START=","
	COMPAT_MODULES=""
else
	COMPAT_MODULES_START=" % Compatibility modules disabled:"
	COMPAT_MODULES="%"
fi
AM_CONDITIONAL(BUILD_COMPAT, test "x${enable_compat}" = "xyes")
AC_SUBST(COMPAT_MODULES_START)
AC_SUBST(COMPAT_MODULES)


dnl ------------------------------------------------------------------
dnl Detect Operating System.
dnl ------------------------------------------------------------------

echo
echo Detect Operating System

AC_CANONICAL_SYSTEM
case "$target_os" in
    *darwin10*)
	echo "Target OS is: Darwin10 (Mac OS X)"
	AC_LANG(Erlang)
	AC_RUN_IFELSE(
	    [AC_LANG_PROGRAM([],[dnl
	     halt(case erlang:system_info(wordsize) of
	     8 -> 0; 4 -> 1 end)])],
	    [AC_MSG_NOTICE(found 64-bit Erlang)
	     CBIT=-m64],
	    [AC_MSG_NOTICE(found 32-bit Erlang)
	     CBIT=-m32])
	;;
    *)        
	echo "Target OS is: '$target_os'"
	CBIT=""
	;;
esac
CFLAGS="$CFLAGS $CBIT"

LD_SHARED="$LD_SHARED $CBIT"
echo "CBIT = '$CBIT'"
echo "CFLAGS = '$CFLAGS'"
echo "LD_SHARED = '$LD_SHARED'"

dnl ------------------------------------------------------------------
dnl Finale substitutions.
dnl ------------------------------------------------------------------

CPPFLAGS="${CPPFLAGS# }"
CFLAGS="${CFLAGS# }"
LDFLAGS="${LDFLAGS# }"

CPPFLAGS="${CPPFLAGS% }"
CFLAGS="${CFLAGS% }"
LDFLAGS="${LDFLAGS% }"

AC_SUBST([package_name], [${PACKAGE_NAME}])
AC_SUBST([version], [${PACKAGE_VERSION}])
AC_SUBST([package_string], [${PACKAGE_STRING}])
AC_SUBST([package_tar_name], [${PACKAGE_TARNAME}])
AC_SUBST([bug_uri], [${PACKAGE_BUGREPORT}])

AC_SUBST([localconfdir], [${sysconfdir}/${package_name}])
AC_SUBST([localdatadir], [${datadir}/${package_name}])
AC_SUBST([localdocdir], [${datadir}/doc/${package_name}])
AC_SUBST([locallibdir], [${libdir}/${package_name}])

dnl ------------------------------------------------------------------
dnl Autoconf output.
dnl ------------------------------------------------------------------


AC_CONFIG_FILES([
	Makefile
    bin/Makefile
	conf/Makefile
    src/Makefile
    doc/Makefile

])

AC_OUTPUT

dnl --------------------------------------------------
dnl Configuration report
dnl --------------------------------------------------

echo
echo == ${PACKAGE_NAME} ${PACKAGE_VERSION} ==
echo
echo Configuration:
echo     Prefix:             ${prefix}
echo
echo     C compiler:         ${CC} ${CFLAGS}
echo

echo     Compat modules:     ${enable_compat}

echo
echo "You have configured the docklet system, time to relax."
echo
echo "Run 'make && sudo make install' to install."
